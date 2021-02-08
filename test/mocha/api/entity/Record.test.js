'use strict'

const assert = require('assert')
const Record = require('../../../../api/entity/Record')

describe('/api/entity/Record', () => {
  describe('structure', () => {
    it('has prototype properties', () => {
      const nullRecord = Object.create(Record.prototype)
      assert.strictEqual(nullRecord.hasOwnProperty('id'), false)
      assert.strictEqual(Record.prototype.hasOwnProperty('id'), true)
    })
  })
})
