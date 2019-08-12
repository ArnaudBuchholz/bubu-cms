'use strict'

const gpf = require('gpf-js')
const attributes = require('./odata/attributes')
const key = new attributes.Key()
const sortable = new attributes.Sortable()
const filterable = new attributes.Filterable()
const updatable = new attributes.Updatable()
const creatable = new attributes.Creatable()
const NavigationProperty = attributes.NavigationProperty
const Content = require('./Content')

const Record = gpf.define({
  $class: 'Record',

  '[_id]': [key, new gpf.attributes.Serializable({
    name: 'id',
    type: gpf.serial.types.string,
    required: true
  })],
  _id: '',

  '[_type]': [new gpf.attributes.Serializable({
    name: 'type',
    type: gpf.serial.types.string,
    required: true
  })],
  _type: '',

  '[_name]': [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
    name: 'name',
    type: gpf.serial.types.string,
    required: true
  })],
  _name: '',

  '[_icon]': [creatable, updatable, new gpf.attributes.Serializable({
    name: 'icon',
    type: gpf.serial.types.string
  })],
  _icon: '',

  '[_number]': [creatable, updatable, filterable, new gpf.attributes.Serializable({
    name: 'number',
    type: gpf.serial.types.string
  })],
  _number: '',

  '[_rating]': [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
    name: 'rating',
    type: gpf.serial.types.integer
  })],
  _rating: 0,

  '[_created]': [creatable, sortable, filterable, new gpf.attributes.Serializable({
    name: 'created',
    type: gpf.serial.types.datetime,
    required: true
  })],
  _created: null,

  '[_modified]': [creatable, sortable, filterable, new gpf.attributes.Serializable({
    name: 'modified',
    type: gpf.serial.types.datetime
  })],
  _modified: null,

  '[_statusText1]': [creatable, filterable, new gpf.attributes.Serializable({
    name: 'statusText1',
    type: gpf.serial.types.string
  })],
  _statusText1: '',

  '[_statusState1]': [new gpf.attributes.Serializable({
    name: 'statusState1',
    type: gpf.serial.types.string
  })],
  _statusState1: '',

  '[_statusText2]': [creatable, filterable, new gpf.attributes.Serializable({
    name: 'statusText2',
    type: gpf.serial.types.string
  })],
  _statusText2: '',

  '[_statusState2]': [new gpf.attributes.Serializable({
    name: 'statusState2',
    type: gpf.serial.types.string
  })],
  _statusState2: '',

  '[_tags]': [new gpf.attributes.Serializable({
    name: 'tags',
    type: gpf.serial.types.string
  })],
  _tags: [],

  addTag: function (tag) {
    const tagRecord = Record.Tag.allocate(tag)
    this._tags.push(tagRecord)
    tagRecord.usedBy(this)
    return tagRecord
  },

  hasTag: function (tag) {
    return this._tags.indexOf(tag) !== -1
  },

  search: function (term) {
    return [
      this._name,
      this._statusText1,
      this._statusText2
    ].some(value => value.indexOf(term) !== -1)
  },

  constructor: function (raw) {
    this._tags = []
    this._type = this.addTag(this.constructor.name)._name
    if (raw.tags) {
      raw.tags.split(' ').forEach(tag => this.addTag(tag))
      delete raw.tags
    }
    if (typeof raw.rating === 'string') {
      raw.rating = parseInt(raw.rating, 10)
    }
    gpf.serial.fromRaw(this, raw)
    if (!this._created) {
      this._created = new Date()
    }
    if (!this._modified) {
      this._modified = this._created
    }
  },

  '[getContent]': [new NavigationProperty().to(Content, '0..1').on({
    id: 'recordId'
  })],
  getContent: function () {
    return Promise.resolve(this._allocateContent({
      _type: 'plain',
      _data: ''
    }))
  },

  _allocateContent: function (properties) {
    return Object.assign(new Content(this._id), properties)
  }

})

const records = []

const recordsById = {}

Object.assign(Record, {

  STATE: {
    hide: '',
    error: 'Error',
    show: 'None',
    success: 'Success',
    warning: 'Warning'
  },

  all: () => Promise.resolve(records),
  byId: ids => Promise.resolve(recordsById[ids[0]]),
  searchable: true,

  load: array => {
    array.forEach(record => {
      records.push(record)
      recordsById[record._id] = record
    })
    return Promise.resolve()
  }

})

module.exports = Record
