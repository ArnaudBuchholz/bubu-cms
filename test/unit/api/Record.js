'use strict'

const assert = require('assert')
const Database = require('../../../api/Database')

describe('/api/Record.js', () => {
  describe('creation', () => {
    let MyRecord
    let db
    let record
    beforeEach(() => {
      db = new Database('test')
      MyRecord = class MyRecord extends db.Record {}
      record = new MyRecord()
    })
    it('allocates the type tag', () => {
      assert(record.type === 'myrecord')
      assert(record.tags.length === 1)
      return db.tags.byId('myrecord')
        .then(tag => assert(tag.count === 1))
    })
    it('adds record to the database', () => db.records.all()
      .then(records => {
        assert(records.length === 1)
        assert(records[0] === record)
      })
    )
  })
})
