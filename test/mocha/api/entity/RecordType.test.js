'use strict'

const assert = require('assert')
const RecordType = require('../../../../api/entity/RecordType')

describe('/core/api/entity/RecordType.js', () => {
  it('loads properties', () => {
    const test = new RecordType('test', {
      load: any => {}
    })
    assert.notStrictEqual(test.properties.length, 0)
  })

  describe('errors', () => {
    it('validates the load method (missing)', () => {
      assert.throws(() => new RecordType('test', {
      }))
    })

    it('validates the load method (invalid)', () => {
      assert.throws(() => new RecordType('test', {
        load: 0
      }))
    })

    it('validates the load method (wrong signature)', () => {
      assert.throws(() => new RecordType('test', {
        load: () => {}
      }))
    })
  })
})
