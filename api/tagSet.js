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

  function query (sort, search) {
    return Promise.resolve([]) // Not implemented
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
