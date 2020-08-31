'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Id = require('./Id')
const Searchable = require('./Searchable')

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

  add (record) {
    this._records.push(record)
  }

  remove (record) {
    this._records = this._records.filter(candidate => candidate !== record)
  }

  constructor (name) {
    this._name = name
    this._records = []
  }
}

attribute(new Id())(Tag, 'name')
attribute(new Searchable())(Tag, 'name')
attribute(new gpf.attributes.Serializable())(Tag, 'name')
attribute(new gpf.attributes.Serializable())(Tag, 'count')

module.exports = Tag
