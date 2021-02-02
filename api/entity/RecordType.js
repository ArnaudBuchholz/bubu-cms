'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')
const NavigationProperty = require('reserve-odata/attributes/NavigationProperty')
const TypeProperty = require('./TypeProperty')

class RecordType {
  get type () {
    return this._type
  }

  getProperties () {
    return this._properties
  }

  _checkLoad (definition) {
    if (typeof definition.load !== 'function' && definition.load.length !== 1) {
      throw new Error('Missing load function')
    }
    this._load = definition.load
  }

  _checkDefaultIcon (definition) {
    this._defaultIcon = definition.defaultIcon
    // Might need to map the path
  }

  constructor (type, definition) {
    this._type = type
    this._properties = TypeProperty.names.map(name => new TypeProperty(type, name, definition[name]))
    this._checkLoad(definition)
    this._checkDefaultIcon(definition)
  }
}

attribute(new gpf.attributes.Serializable())(RecordType, 'type')
attribute(new Key())(RecordType, 'type')
attribute(new NavigationProperty('properties', TypeProperty, '*'))(RecordType, 'getProperties')

module.exports = RecordType
