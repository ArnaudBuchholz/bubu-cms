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
        statusText1: 'A',
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
        statusText2: 'egg',
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
      return db.records.query('#myrecord #accent-placeholder')
        .then(records => {
          checkNames(records, 'ace')
        })
    })
    it('retreives records by tags and one search term', () => {
      return db.records.query('#myrecord #accent-placeholder egg')
        .then(records => {
          checkNames(records, 'e')
        })
    })
    it('retreives records by tags and multiple search terms (OR)', () => {
      return db.records.query('#myrecord #accent-placeholder egg A')
        .then(records => {
          checkNames(records, 'ae')
        })
    })
  })
})
