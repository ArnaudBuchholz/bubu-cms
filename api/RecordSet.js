'use strict'

const Set = require('./Set')
const tagSet = require('./tagSet')
const tagPrefix = '#'
const tagPrefixLength = tagPrefix.length

const records = []
const recordsById = {}

class RecordSet extends Set {

  function add (record) {
    records.push(record)
    recordsById[record.id] = record
  }

  function all () {
    return Promise.resolve(records)
  }

  function byId (id) {
    return Promise.resolve(recordsById[id])
  }

  function search (criteria) {
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

  function sort (searchResult) {

  }

}

module.exports = new RecordSet()
