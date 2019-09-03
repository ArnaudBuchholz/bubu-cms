'use strict'

const gpf = require('gpf-js')
const attributes = require('./attributes')
const db = require('./db')
const searcher = require('./search')
const sorter = require('./sort')

const mapOfODataParamTypes = {
  undefined: () => {},
  number: (aggregated, key, value) => {
    aggregated[key] = parseInt(value, 10)
  },
  string: (aggregated, key, value) => {
    aggregated[key] = value
  }
}

const mapOfSerialTypeMatcher = {
  undefined: '',
  number: '([0-9]+)',
  string: "'([^']+)'"
}

const mapOfSerialTypeToJSON = {
  undefined: () => '',
  number: value => value,
  string: value => `'${value}'`
}

const prepare = EntityClass => {
  EntityClass.serialProperties = gpf.serial.get(EntityClass)
  EntityClass.navigationProperties = attributes.navigationProperties(EntityClass)
  EntityClass.keys = Object.keys(gpf.attributes.get(EntityClass, attributes.Key))
  EntityClass.toJSON = buildToJSON(EntityClass)
  if (!EntityClass.byId) {
    EntityClass.byId = () => Promise.resolve(null)
  }
  if (!EntityClass.all) {
    EntityClass.all = () => Promise.resolve([])
  }
}

const buildToJSON = EntityClass => {
  const
    keys = EntityClass.keys

  const serialProps = EntityClass.serialProperties
  return entity => {
    const
      raw = gpf.serial.toRaw(entity, (value, property) => {
        if (gpf.serial.types.datetime === property.type) {
          if (value) {
            return '/Date(' + value.getTime() + ')/'
          } else {
            return null
          }
        }
        if (property.name === 'tags') {
          return value.join(' ')
        }
        return value
      })

    const uriKey = keys
      .map(key => serialProps[key])
      .map(keyProperty => {
        return {
          name: keyProperty.name,
          value: mapOfSerialTypeToJSON[keyProperty.type](raw[keyProperty.name])
        }
      })
      .map(keyInfo => keys.length === 1
        ? keyInfo.value
        : `${keyInfo.name}=${keyInfo.value}`
      )
      .join(',')
    EntityClass.navigationProperties.forEach(property => {
      const
        name = property.getName()

      const expanded = entity[name]
      if (expanded) {
        if (Array.isArray(expanded.result)) {
          raw[name] = {
            results: expanded.result.map(expanded.EntityClass.toJSON)
          }
        } else {
          raw[name] = expanded.EntityClass.toJSON(expanded.result)
        }
      }
    })
    raw.__metadata = {
      uri: `${EntityClass.name}Set(${uriKey})`,
      type: `BUBU_CMS.${EntityClass.name}`
    }
    return raw
  }
}

const parse = req => Object.assign(req.url
  .substr(req.url.indexOf('?') + 1)
  .split('&')
  .reduce((aggregated, param) => {
    const
      equalPos = param.indexOf('=')

    const key = param.substr(0, equalPos)

    const defaultValue = aggregated[key]
    mapOfODataParamTypes[typeof defaultValue](aggregated, key, decodeURIComponent(param.substr(equalPos + 1)))
    return aggregated
  }, {
    $top: 0,
    $skip: 0,
    $inlinecount: '',
    $orderby: '',
    search: '',
    $expand: ''
  }), {
  _expand: function (EntityClass, records) {
    if (!this.$expand) {
      return Promise.resolve(records)
    }
    const
      expandNames = this.$expand.split(',')

    const expandedProperties = EntityClass.navigationProperties
      .filter(navigationProperty => expandNames.includes(navigationProperty.getName()))

    const promises = []

    records.forEach((record, idx) => expandedProperties.forEach(navigationProperty => {
      promises.push(record[navigationProperty.getMemberName()]()
        .then(function (subRecords) {
          const expandedProperty = {}
          expandedProperty[navigationProperty.getName()] = {
            EntityClass: navigationProperty.to(),
            result: subRecords
          }
          records[idx] = Object.assign(Object.create(records[idx]), expandedProperty)
        })
      )
    }))
    return Promise.all(promises)
      .then(() => records)
  },

  send: function (EntityClass, records, res) {
    res.set('Content-Type', 'application/json')
    if (Array.isArray(records)) {
      const
        recordSet = { d: {} }
      if (this.$orderby) {
        records.sort(sorter(EntityClass, this.$orderby))
      }
      if (this.$inlinecount === 'allpages') {
        recordSet.d.__count = records.length
      }
      if (this.$top || this.$skip) {
        records = records.slice(this.$skip, this.$skip + this.$top)
      }
      this._expand(EntityClass, records)
        .then(expandedRecords => {
          recordSet.d.results = expandedRecords.map(EntityClass.toJSON)
          res.send(JSON.stringify(recordSet))
        })
    } else {
      this._expand(EntityClass, [records])
        .then(expandedRecords => res.send(JSON.stringify({
          d: EntityClass.toJSON(expandedRecords[0])
        }))
        )
    }
  }
})

const fail = (status, text, next) => {
  var error = new Error(text)
  error.status = status
  next(error)
}

const notFound = next => fail(404, 'Not found', next)

let
  parserInstalled = false

module.exports = {

  route: (router, EntityClass) => {
    if (!parserInstalled) {
      router.get('*', (req, res, next) => {
        req.odata = parse(req)
        next() // pass control to the next handler
      })
      parserInstalled = true
    }

    prepare(EntityClass)

    const
      serialProps = EntityClass.serialProperties

    const keys = EntityClass.keys
    let
      keysMatcher

    if (keys.length === 1) {
      keysMatcher = mapOfSerialTypeMatcher[serialProps[keys[0]].type]
    } else {
      keysMatcher = keys
        .map(key => serialProps[key])
        .map(keyProperty => `${keyProperty.name}=${mapOfSerialTypeMatcher[keyProperty.type]}`)
        .join(',')
    }

    EntityClass.navigationProperties.forEach(property => {
      router.get(new RegExp(`/${EntityClass.name}Set\\(${keysMatcher}\\)/${property.getName()}`), (req, res, next) =>
        db.open()
          .then(() => EntityClass.byId(req.params))
          .then(record => record
            ? record[property.getMemberName()]()
              .then(records => req.odata.send(property.to(), records, res))
              .catch(reason => fail(500, reason.toString, next))

            : notFound(next)
          )
      )
    })

    router.get(new RegExp(`/${EntityClass.name}Set\\(${keysMatcher}\\)`), (req, res, next) =>
      db.open()
        .then(() => EntityClass.byId(req.params))
        .then(record => record
          ? req.odata.send(EntityClass, record, res)
          : notFound(next)
        )
    )

    router.get(`/${EntityClass.name}Set`, (req, res, next) =>
      db.open()
        .then(() => EntityClass.searchable && req.odata.search
          ? searcher(EntityClass, req.odata.search)
          : EntityClass.all()
        )
        .then(records => req.odata.send(EntityClass, records, res))
    )
  }

}
