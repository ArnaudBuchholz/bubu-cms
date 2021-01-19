'use strict'

import gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
import Key = require('reserve-odata/attributes/Key')

export class TypeProperty {
    _type: string

    @attribute(new gpf.attributes.Serializable())
    @attribute(new Key())
    get type () {
        return this._type
    }

    constructor (type: string) {
        this._type = type
    }
}
