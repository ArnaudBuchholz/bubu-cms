'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('reserve-odata/attributes/Key')
const Sortable = require('reserve-odata/attributes/Sortable')
const NavigationProperty = require('reserve-odata/attributes/NavigationProperty')
const Tag = require('./Tag')

const minDate = new Date(0)

class Record {
  get id () {
    return `${this.type}.${this._id}`
  }

  get type () {
    return this._type.type
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

  get status1 () {
    return this._status1
  }

  get status2 () {
    return this._status2
  }

  get tags () {
    return this._tags.map(tag => tag.name).join(' ')
  }

  getTags () {
    return this._tags
  }

  hasTag (tag) {
    return this._tags.includes(tag)
  }

  constructor (database, type, record) {
    this._type = type
    Object.keys(record)
      .forEach(property => {
        const value = record[property]
        if (Record.prototype.hasOwnProperty(property)) {
          this[`_${property}`] = value
        } else {
          this[property] = value
        }
      })
  }
}

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
attribute(new gpf.attributes.Serializable())(Record, 'status1')
attribute(new gpf.attributes.Serializable())(Record, 'status2')
attribute(new gpf.attributes.Serializable())(Record, 'tags')
attribute(new NavigationProperty('Tags', Tag, '*'))(Record, 'getTags')

module.exports = Record
