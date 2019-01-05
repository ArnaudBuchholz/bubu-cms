const assert = require('assert')
const Tag = require('../../../api/Tag')
const TagSet = require('../../../api/TagSet')

describe('/api/TagSet.js', () => {
  describe('allocate', () => {
    let tagSet
    let testTag
    before(() => {
      tagSet = new TagSet()
    })
    it('creates new tag', () => {
      testTag = tagSet.allocate('test')
      assert(testTag instanceof Tag)
      assert(testTag.name === 'test')
    })
    it('generates one instance per tag', () => {
      const newTestTag = tagSet.allocate('test')
      assert(newTestTag === testTag)
    })
    it('returns the tag using its name', () => {
      return tagSet.byId('test')
        .then(retreivedTag => {
          assert(retreivedTag === testTag)
        })
    })
  })
})
