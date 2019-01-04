'use strict'

const Set = require('./Set')
const Tag = require('./Tag')

const tags = []
const tagsById = {}

class TagSet extends Set {
  all () {
    return Promise.resolve(tags)
  }

  byId (id) {
    return Promise.resolve(tagsById(id.toLowerCase()))
  }

  search () {
    return Promise.resolve(tags)
  }

  allocate (tag) {
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
