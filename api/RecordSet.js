'use strict'

const Set = require('./Set')
const tagPrefix = '#'
const tagPrefixLength = tagPrefix.length

class RecordSet extends Set {
  add (record) {
    this._records.push(record)
    this._recordsById[record.id] = record
  }

  all () {
    return Promise.resolve(this._records)
  }

  byId (id) {
    return Promise.resolve(this._recordsById[id])
  }

  _getTags (searchTerms) {
    return Promise.all(searchTerms
      .filter(term => term.indexOf(tagPrefix) === 0)
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

module.exports = RecordSet
