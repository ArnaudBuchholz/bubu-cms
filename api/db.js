'use strict'

const Record = require('./Record')

class Database {
  open () {
    if (!this.opened) {
      try {
        this.opened = require(`../db/${this._name}/init`)({
          Record: Record,
          loadRecords: array => Record.load(array)
        })
      } catch (e) {
        console.error(e)
      }
    }
    return this.opened
  }

  constructor (name) {
    this._name = name
  }
}

const databases = {}

module.exports = name => {
  if (!databases[name]) {
    databases[name] = new Database(name)
  }
  return databases[name]
}
