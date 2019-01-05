'use strict'

const RecordSet = require('./RecordSet')
const TagSet = require('./TagSet')

class Database {

  get records () {
    return this._recordSet
  }

  get tags () {
    return this._tagSet
  }

  open () {
    if (!this.opened) {
      try {
        this.opened = require(`../db/${this._name}/init`)({
          database: this,
          Record: Record
        })
      } catch (e) {
        console.error(e)
      }
    }
    return this.opened
  }

  constructor (name) {
    this._name = name
    this._recordSet = new RecordSet()
    this._tagSet = new TagSet()
  }
}

module.exports = Database
