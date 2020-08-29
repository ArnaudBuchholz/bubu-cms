'use strict'

const gpf = require('gpf-js')
const Id = require('../Id')

const mapOfSerialTypeToJSON = {
  undefined: () => '',
  number: value => value,
  string: value => `'${encodeURIComponent(value)}'`
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

  /*
   * Since Record is subclassed but accessed with RecordSet, the __metadata should match
   * Check for the constructor which prototype owns toJSON
   */
  let constructor = this.constructor
  while (!Object.prototype.hasOwnProperty.call(constructor.prototype, 'toJSON')) {
    constructor = Object.getPrototypeOf(constructor.prototype).constructor
  }

  json.__metadata = {
    uri: `${constructor.name}Set(${uriKey})`,
    type: `BUBU_CMS.${constructor.name}`
  }

  return json
}

require('./entities').forEach(EntityClass => {
  EntityClass.prototype.toJSON = toJSON
})
