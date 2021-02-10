'use strict'

const assert = require('assert')
const Database = require('../../../../api/Database')
const RecordType = require('../../../../api/entity/RecordType')
const Record = require('../../../../api/entity/Record')

describe('/api/entity/Record', () => {
  describe('structure', () => {
    it('has prototype properties', () => {
      const nullRecord = Object.create(Record.prototype)
      assert.strictEqual(Object.prototype.hasOwnProperty.call(nullRecord, 'id'), false)
      assert.strictEqual(Object.prototype.hasOwnProperty.call(Record.prototype, 'id'), true)
    })
  })

  describe('loading', () => {
    const db = new Database()
    const rt = new RecordType('test', {
      load: any => {}
    })

    it('fits known properties in private members', () => {
      const record = new Record(db, rt, {
        status1: 'status1'
      })
      assert.strictEqual(record._status1, 'status1')
    })
  })
})
