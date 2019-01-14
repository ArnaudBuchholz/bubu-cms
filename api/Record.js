'use strict'

class Record {
  get database () {
    return this._database
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

  set rating (value) {
    if (typeof value !== 'number' || value < 0 || value > 5) {
      throw new Error('Invalid value')
    }
    this._rating = value
  }

  get created () {
    return this._created
  }

  get modified () {
    return this._modified
  }

  set modified (value) {
    if (!(value instanceof Date)) {
      throw new Error('Invalid value')
    }
    this._modified = value
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

  search (term) {
    return [
      this.name,
      this.statusText1,
      this.statusText2
    ].some(value => (value || '').includes(term))
  }

  get content () {
    return Promise.resolve(this._allocateContent({
      _type: 'plain',
      _data: ''
    }))
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

module.exports = Record
