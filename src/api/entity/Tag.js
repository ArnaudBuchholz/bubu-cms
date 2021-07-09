'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')
const Sortable = require('reserve-odata/attributes/Sortable')
const Filterable = require('reserve-odata/attributes/Filterable')
const NavigationProperty = require('reserve-odata/attributes/NavigationProperty')
const Record = require('./Record')

class Tag {
  get name () {
    return this._name
  }

  get count () {
    return this._records.length
  }

  getRecords () {
    return this._records
  }

  add (record) {
    this._records.push(record)
  }

  remove (record) {
    const index = this._records.indexOf(record)
    this._records.splice(index, 1)
  }

  constructor (name) {
    this._name = name
    this._records = []
  }
}

attribute(new gpf.attributes.Serializable())(Tag, 'name')
attribute(new Key())(Tag, 'name')
attribute(new Sortable())(Tag, 'name')
attribute(new Filterable())(Tag, 'name')
attribute(new gpf.attributes.Serializable())(Tag, 'count')
attribute(new Sortable())(Tag, 'count')
attribute(new NavigationProperty('records', Record, '*'))(Tag, 'getRecords')

module.exports = Tag
