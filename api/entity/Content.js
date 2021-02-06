'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')

class Content {
  constructor (recordId, data = '', mimeType = 'text/plain') {
    this._recordId = recordId
    this._data = data
    this._mimeType = mimeType
  }
}

attribute(new Key())(Content, '_recordId')
attribute(new gpf.attributes.Serializable())(Content, '_recordId')
attribute(new gpf.attributes.Serializable())(Content, '_data')
attribute(new Key())(Content, '_mimeType')
attribute(new gpf.attributes.Serializable())(Content, '_mimeType')

module.exports = Content
