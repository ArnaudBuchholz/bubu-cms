'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/Key')
const Sortable = require('reserve-odata/Sortable')
const Content = require('./Content')

const jsonContentType = mime.getType('json')
const minDate = new Date(0)

class Record {
  get raw () {
    return this._raw
  }

  get id () {
    return `${this.type.name}.${this.raw.id}`
  }

  get type () {
    return this._type.name
  }

  get name () {
    return this.raw.name
  }

  get icon () {
    return this.raw.icon
  }

  get number () {
    return this.raw.number
  }

  get rating () {
    return this.raw.rating || 0
  }

  get touched () {
    return this.raw.touched || minDate
  }

  get status1 () {
    return this.raw.status1
  }

  get status2 () {
    return this.raw.status2
  }

  getTags () {
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

  async buildContent (data, mimeType) {
    if (!mimeType && gpf.isLiteralObject(data)) {
      return new Content(this._id, JSON.stringify(data), jsonContentType)
    }
    return new Content(this._id, data, mimeType)
  }

  constructor (database, type, record) {
    this._tags = []
    this._type = type
    this._raw = record
    database.records.add(this)
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
