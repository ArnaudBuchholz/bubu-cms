'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')
const NavigationProperty = require('reserve-odata/attributes/NavigationProperty')
const TypeProperty = require('./TypeProperty')

module.exports = class RecordType {
    get type () {
        return this._type
    }

    getProperties () {

    }

    constructor (type) {
        this._type = type
    }
}

attribute(new gpf.attributes.Serializable())(RecordType, 'type')
attribute(new Key())(RecordType, 'type')
attribute(new NavigationProperty('properties', TypeProperty, '*'))(RecordType, 'getProperties')
