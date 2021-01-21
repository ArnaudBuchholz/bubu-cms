'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')

module.exports = class TypeProperty {
    get type () {
        return this._type
    }

    constructor (type) {
        this._type = type
    }
}

attribute(new gpf.attributes.Serializable())(TypeProperty, 'type')
attribute(new Key())(TypeProperty, 'type')