'use strict'

const recordSet = require('./recordSet')
const tagSet = require('./tagSet')

class Record {

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

  get created () {
    return this._created
  }

  get modified () {
    return this._modified
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

  addTag: function (tag) {
    const tagRecord = tagSet.allocate(tag)
    this._tags.push(tagRecord)
    tagRecord.add(this)
    return tagRecord
  }

  function search (term) {
    return [
      this.name,
      this.statusText1,
      this.statusText2
    ].some(value => value.includes(term))
  }

  getContent: function () {
    return Promise.resolve(this._allocateContent({
      _type: 'plain',
      _data: ''
    }))
  }

  constructor () {
    this._tags = []
    this._type = this.addTag(this.constructor.name).name
    recordSet.add(this)
  }

}

gpf.define.import(Record, {

  id: [new gpf.attributes.Serializable({
    name: 'id',
    type: gpf.serial.types.string,
    required: true
  })],

})
