'use strict'

const Tag = require('./Tag')
const tagPrefix = '#'
const tagPrefixLength = tagPrefix.length

module.exports = (EntityClass, search) => {
  const
    searchTerms = search
      .split(' ')
      .map(term => term.trim())
      .filter(term => term)

  const tags = searchTerms
    .filter(term => term.indexOf(tagPrefix) === 0)
    .map(term => Tag.get(term.substr(tagPrefixLength)))
    .filter(tag => tag)
    .sort((a, b) => a._records.length - b._records.length)
  // Less references first

  const terms = searchTerms
    .filter(term => term.indexOf(tagPrefix) !== 0)

  let
    asyncRecords
  if (tags.length) {
    // AND
    let recordsByTags = tags[0].records(EntityClass) // synchronous
    tags.slice(1).forEach(tag => {
      recordsByTags = recordsByTags.filter(record => record.hasTag(tag))
    })
    asyncRecords = Promise.resolve(recordsByTags)
  } else {
    asyncRecords = EntityClass.all()
  }
  return asyncRecords
    .then(records => terms.length
      ? records.filter(record => terms.some(term => record.search(term))) // OR
      : records
    )
}
