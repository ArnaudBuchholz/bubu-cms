'use strict'

const Set = require('./Set')
const Tag = require('./Tag')

class TagSet extends Set {
  all () {
    return Promise.resolve(this._tags)
  }

  byId (id) {
    return Promise.resolve(this._tagsById[id.toLowerCase()])
  }

  async search () {
    return this._tags
  }

  allocate (tag) {
    const loweredTag = tag.toLowerCase()
    let tagRecord = this._tagsById[loweredTag]
    if (!tagRecord) {
      tagRecord = new Tag(loweredTag)
      this._tags.push(tagRecord)
      this._tagsById[loweredTag] = tagRecord
    }
    return tagRecord
  }

  constructor (database) {
    super(database)
    this._tags = []
    this._tagsById = {}
  }
}

Tag.Set = TagSet

module.exports = TagSet
