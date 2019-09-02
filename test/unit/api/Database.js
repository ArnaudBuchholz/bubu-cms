'use strict'

const assert = require('assert')
const Database = require('../../../api/Database')

describe('/api/Database.js', () => {
  describe('loading', () => {
    let db
    beforeEach(() => {
      db = new Database('sample')
      return db.open()
    })
    it('loads record in the database', () => db.records.all()
      .then(records => {
        assert.notStrictEqual(records.length, 0)
      })
    )
  })
})
