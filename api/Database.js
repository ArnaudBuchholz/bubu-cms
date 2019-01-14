'use strict'

const Record = require('./Record')
const RecordSet = require('./RecordSet')
const TagSet = require('./TagSet')

class Database {
  get Record () {
    if (!this._Record) {
      const database = this
      this._Record = class DBRecord extends Record {
        constructor () {
          super(database)
        }
      }
      Object.keys(this._Record).forEach(staticProperty => {
        this._Record[staticProperty] = this._Record[this._Record]
      })
    }
    return this._Record
  }

  get records () {
    return this._recordSet
  }

  get tags () {
    return this._tagSet
  }

  open () {
    if (!this.opened) {
      try {
        this.opened = require(`../db/${this._name}/init`)(this)
      } catch (e) {
        console.error(e)
      }
    }
    return this.opened
  }

  constructor (name) {
    this._name = name
    this._recordSet = new RecordSet(this)
    this._tagSet = new TagSet(this)
  }
}

module.exports = Database
