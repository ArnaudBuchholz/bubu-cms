'use strict'

const assert = require('assert')
const Database = require('../../../api/Database')
const Record = require('../../../api/Record')

const checkNames = (result, expected) => {
  assert.strictEqual(result.map(item => item.name).join(''), expected)
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
        name: 'a',
        tags: ['vowel', 'accent-placeholder']
      }, {
        name: 'b'
      }, {
        name: 'c',
        tags: ['accent-placeholder']
      }, {
        name: 'd'
      }, {
        name: 'e',
        tags: ['vowel', 'accent-placeholder']
      }].forEach(data => new MyRecord(db, data))
    })
    it('retreives records by name', () => {
      return db.records.query('a')
        .then(records => {
          checkNames(records, 'a')
        })
    })
    it('retreives records by tags (type)', () => {
      return db.records.query('#myrecord')
        .then(records => {
          checkNames(records, 'abcde')
        })
    })
    it('retreives records by tags (multiple)', () => {
      debugger
      return db.records.query('#myrecord #accent-placeholder')
        .then(records => {
          checkNames(records, 'ace')
        })
    })
  })
})
