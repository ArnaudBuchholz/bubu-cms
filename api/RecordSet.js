'use strict'

const Set = require('./Set')
const tagSet = require('./tagSet')
const tagPrefix = '#'
const tagPrefixLength = tagPrefix.length

const records = []
const recordsById = {}

class RecordSet extends Set {
  add (record) {
    records.push(record)
    recordsById[record.id] = record
  }

  all () {
    return Promise.resolve(records)
  }

  byId (id) {
    return Promise.resolve(recordsById[id])
  }

  search (criteria) {
    const
      searchTerms = criteria
        .split(' ')
        .map(term => term.trim())
        .filter(term => term)

    const tags = searchTerms
      .filter(term => term.indexOf(tagPrefix) === 0)
      .map(term => tagSet.byId(term.substr(tagPrefixLength)))
      .filter(tag => tag)
      .sort((tag1, tag2) => tag1.count - tag2.count)
    // Less references first

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
      searchResult = records
    }
    if (terms.length) {
      searchResult = searchResult.filter(record => terms.some(term => record.search(term))) // OR
    }
    return Promise.resolve(searchResult)
  }
}

module.exports = new RecordSet()
