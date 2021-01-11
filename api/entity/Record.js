'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/Key')
const Filterable = require('reserve-odata/Filterable')
const Sortable = require('reserve-odata/Sortable')
const Content = require('./Content')

const nanoFormat = require('nanoid/format')
const nanoUrl = require('nanoid/url')
const mime = require('mime')

const jsonContentType = mime.getType('json')
const minDate = new Date(0)

class Record {
  get database () {
    return this._database
  }

  _buildId (key) {
    const id = `${this.constructor.name}#${key}`
    return nanoFormat(() => id.split('').map(char => char.charCodeAt(0)), nanoUrl, id.length)
  }

  get id () {
    return this._id
  }

  get type () {
    return this._type
  }

  get name () {
    return this._name
  }

  get icon () {
    return this._icon
  }

  get number () {
    return this._number
  }

  get rating () {
    return this._rating || 0
  }

  get touched () {
    return this._touched || minDate
  }

  get statusText1 () {
    return this._statusText1
  }

  get statusState1 () {
    return this._statusState1
  }

  get statusText2 () {
    return this._statusText2
  }

  get statusState2 () {
    return this._statusState2
  }

  get tags () {
    return this._tags
  }

  addTag (tag) {
    const tagRecord = this._database.tags.allocate(tag)
    this._tags.push(tagRecord)
    tagRecord.add(this)
    return tagRecord
  }

  hasTag (tag) {
    return this._tags.includes(tag)
  }

  _getSearchableProperties () {
    const MyClass = this.constructor
    if (!MyClass._searchableProperties) {
      MyClass._searchableProperties = Object.keys(gpf.attributes.get(MyClass, Searchable))
    }
    return MyClass._searchableProperties
  }

  search (term) {
    return this._getSearchableProperties()
      .map(property => this[property])
      .filter(value => !!value)
      .some(value => (value.toString() || '').toLowerCase().includes(term))
  }

  async buildContent (data, mimeType) {
    if (!mimeType && gpf.isLiteralObject(data)) {
      return new Content(this._id, JSON.stringify(data), jsonContentType)
    }
    return new Content(this._id, data, mimeType)
  }

  constructor (database) {
    this._database = database
    this._tags = []
    this._type = this.addTag(this.constructor.name).name
    this._database.records.add(this)
  }
}

Record.StatusState = {
  hide: '',
  error: 'Error',
  show: 'None',
  success: 'Success',
  warning: 'Warning'
}

Object.freeze(Record.StatusState)

Object.assign(Record.prototype, {
  _statusState1: Record.StatusState.show,
  _statusState2: Record.StatusState.show
})

attribute(new Key())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'type')
attribute(new gpf.attributes.Serializable())(Record, 'name')
attribute(new Sortable())(Record, 'name')
attribute(new gpf.attributes.Serializable())(Record, 'icon')
attribute(new gpf.attributes.Serializable())(Record, 'number')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer, readOnly: false }))(Record, 'rating')
attribute(new Sortable())(Record, 'rating')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Record, 'touched')
attribute(new Sortable())(Record, 'touched')
attribute(new gpf.attributes.Serializable())(Record, 'statusText1')
attribute(new gpf.attributes.Serializable())(Record, 'statusState1')
attribute(new gpf.attributes.Serializable())(Record, 'statusText2')
attribute(new gpf.attributes.Serializable())(Record, 'statusState2')
attribute(new gpf.attributes.Serializable())(Record, 'tags')

module.exports = Record
