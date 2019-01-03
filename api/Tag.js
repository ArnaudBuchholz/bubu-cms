'use strict'

class Tag {

  get name () {
    return this._name
  }

  get count () {
    return this._records.length
  }

  get records () {
    return this._records
  }

  add: function (record) {
    this._records.push(record)
  },

  remove: function (record) {
    this._records = this._records.filter(candidate => candidate !== record)
  }

  constructor (name) {
    this._name = name
    this._records = []
  }

}
