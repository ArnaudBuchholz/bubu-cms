'use strict'

const gpf = require('gpf-js')
const Id = require('../Id')
const Record = require('../Record')
const Tag = require('../Tag')

const mapOfSerialTypeToJSON = {
  undefined: () => '',
  number: value => value,
  string: value => `'${value}'`
}

function getKeys (record) {
  const EntityClass = record.constructor
  if (!EntityClass._keys) {
    const serialProperties = gpf.serial.get(EntityClass)
    EntityClass._keys = Object.keys(gpf.attributes.get(EntityClass, Id)).map(name => serialProperties[name])
  }
  return EntityClass._keys
}

function toJSON () {
  const json = gpf.serial.toRaw(this, (value, property) => {
    if (gpf.serial.types.datetime === property.type) {
      if (value) {
        return '/Date(' + value.getTime() + ')/'
      }
      return null
    }
    if (property.name === 'tags') {
      return value.map(tag => tag.name).join(' ')
    }
    return value
  })

  const uriKey = getKeys(this)
    .map(property => {
      return {
        name: property.name,
        value: mapOfSerialTypeToJSON[property.type](json[property.name])
      }
    })
    .map((pair, index, keys) => keys.length === 1
      ? pair.value
      : `${pair.name}=${pair.value}`
    )
    .join(',')

  json.__metadata = {
    uri: `${this.constructor.name}Set(${uriKey})`,
    type: `BUBU_CMS.${this.constructor.name}`
  }

  return json
}

Record.prototype.toJSON = toJSON
Tag.prototype.toJSON = toJSON
