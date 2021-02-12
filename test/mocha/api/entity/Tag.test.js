'use strict'

const assert = require('assert')
const Tag = require('../../../../api/entity/Tag')

describe('/api/entity/Tag', () => {
  it('exposes a name property', () => {
    const tag = new Tag('test')
    assert.strictEqual(tag.name, 'test')
  })

  describe('records holding', () => {
    it('supports adding records', () => {
      const tag = new Tag('test')
      const a = {}, b = {}
      tag.add(a)
      tag.add(b)
      assert.strictEqual(tag.count, 2)
      assert.strictEqual(tag.getRecords()[0], a)
      assert.strictEqual(tag.getRecords()[1], b)
    })

    it('supports adding records', () => {
      const tag = new Tag('test')
      const a = {}, b = {}
      tag.add(a)
      tag.add(b)
      tag.remove(a)
      assert.strictEqual(tag.count, 1)
      assert.strictEqual(tag.getRecords()[0], b)
    })
  })
})
