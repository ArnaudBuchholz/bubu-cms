'use strict'

const Set = require('./Set')
const Tag = require('./Tag')

const tags = []
const tagsById = {}

class TagSet extends Set {

  function all () {
    return Promise.resolve(tags)
  }

  function byId (id) {
    return Promise.resolve(tagsById(id.toLowerCase()))
  }

  function search () {
    return Promise.resolve(tags)
  }

  function sort (searchResult) {
    return searchResult.sort((tag1, tag2) => {
      return tag1.name.localeCompare(tag2.name)
    })
  }

  function allocate () {
    const loweredTag = tag.toLowerCase()
    let tagRecord = tagsById[loweredTag]
    if (!tagRecord) {
      tagRecord = new Tag(loweredTag)
      tags.push(tagRecord)
      tagsById[loweredTag] = tagRecord
    }
    return tagRecord
  }

}

module.exports = new TagSet()
