'use strict'

const assert = require('assert')
const Database = require('../../../api/Database')
const Record = require('../../../api/Record')

const checkNames = (result, expected) => {
  const names = result.map(item => item.name)
  assert(names.length === expected.length)
  names.forEach((name, index) => assert(name === expected[index]))
}

describe('/api/RecordSet.js', () => {
  describe('query', () => {
    class MyRecord extends Record {
      constructor (database, data) {
        super(database)
        'name,statusText1,statusText2'.split(',').forEach(property => {
          this[`_${property}`] = data[property]
        });
        (data.tags || []).forEach(tag => this.addTag(tag))
      }
    }
    let db
    beforeEach(() => {
      db = new Database('test');
      [{
        name: 'a'
      }, {
        name: 'b'
      }].forEach(data => new MyRecord(db, data))
    })
    it('retreives records', () => {
      return db.records.query('a')
        .then(records => {
          checkNames(records, 'a')
        })
    })
  })
})
