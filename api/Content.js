'use strict'

const gpf = global.gpf || require('gpf-js/source')

const Content = gpf.define({
  $class: 'Content',

  '[_recordId]': [new gpf.attributes.Serializable({
    name: 'recordId',
    type: gpf.serial.types.string,
    required: true
  })],
  _recordId: '',

  '[_type]': [new gpf.attributes.Serializable({
    name: 'type',
    type: gpf.serial.types.string,
    required: true
  })],
  _type: '',

  '[_data]': [new gpf.attributes.Serializable({
    name: 'data',
    type: gpf.serial.types.string,
    required: true
  })],
  _data: '',

  constructor: function (recordId) {
    this._recordId = recordId
  }

})

module.exports = Content
