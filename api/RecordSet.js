'use strict'

const Set = require('./Set')
const Record = require('./Record')

const tagPrefix = '#'
const tagPrefixLength = tagPrefix.length

class RecordSet extends Set {
  add (record) {
    this._records.push(record)
    if (record.id) {
      this._recordsById[record.id] = record
    } else {
      this._hasNonIndexedRecords = true
    }
  }

  async all () {
    return this._records
  }

  async byId (id) {
    if (this._hasNonIndexedRecords) {
      this._records.forEach(record => {
        this._recordsById[record.id] = record
      })
      delete this._hasNonIndexedRecords
    }
    return this._recordsById[id]
  }

  async _getTags (searchTerms) {
    return Promise.all(searchTerms
      .filter(term => term.startsWith(tagPrefix))
      .map(term => this.database.tags.byId(term.substr(tagPrefixLength)))
    )
  }

  async search (criteria) {
    const
      searchTerms = criteria
        .split(' ')
        .map(term => term.trim())
        .filter(term => term)

    const tags = (await this._getTags(searchTerms))
      .filter(tag => tag)
      // Less references first
      .sort((tag1, tag2) => tag1.count - tag2.count)

    const terms = searchTerms
      .filter(term => term.indexOf(tagPrefix) !== 0)
      .map(term => term.toLowerCase())

    let searchResult
    if (tags.length) {
      // AND
      searchResult = tags[0].records
      tags.slice(1).forEach(tag => {
        searchResult = searchResult.filter(record => record.hasTag(tag))
      })
    } else {
      searchResult = await this.database.records.all()
    }
    if (terms.length) {
      searchResult = searchResult.filter(record => terms.some(term => record.search(term))) // OR
    }
    return searchResult
  }

  constructor (database) {
    super(database)
    this._records = []
    this._recordsById = {}
  }
}

Record.Set = RecordSet

module.exports = RecordSet
