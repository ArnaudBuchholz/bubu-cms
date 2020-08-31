'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator

class Id extends gpf.attributes.Attribute {
}

attribute(new gpf.attributes.MemberAttribute())(Id)
attribute(new gpf.attributes.UniqueAttribute())(Id)

module.exports = Id
