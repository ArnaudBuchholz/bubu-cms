'use strict'

import gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
import Key = require('reserve-odata/attributes/Key')
import NavigationProperty = require('reserve-odata/attributes/NavigationProperty')
import TypeProperty = require('./TypeProperty')

export class RecordType {
    _type: string

    @attribute(new gpf.attributes.Serializable())
    @attribute(new Key())
    get type () {
        return this._type
    }

    @attribute(new NavigationProperty('properties', TypeProperty, '*'))
    getProperties () {

    }

    constructor (type: string) {
        this._type = type
    }
}
