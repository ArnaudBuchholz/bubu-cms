'use strict'

const assert = require('assert')
const Database = require('../../../api/Database')

const checkNames = (result, expected) => {
  assert.strictEqual(result.map(item => item.name).join(''), expected)
}

describe('/api/RecordSet.js', () => {
  describe('query', () => {
    let db
    beforeEach(() => {
      db = new Database('test')
      class MyRecord extends db.Record {
        constructor (data) {
          super()
          'name,statusText1,statusText2'.split(',').forEach(property => {
            this[`_${property}`] = data[property]
          })
          data.tags.forEach(tag => this.addTag(tag))
        }
      }
      [{
        name: 'a',
        statusText1: 'A',
        tags: ['vowel', 'accent-placeholder']
      }, {
        name: 'b',
        tags: []
      }, {
        name: 'c',
        tags: ['accent-placeholder']
      }, {
        name: 'd',
        tags: []
      }, {
        name: 'e',
        statusText2: 'egg',
        tags: ['vowel', 'accent-placeholder']
      }].forEach(data => new MyRecord(data))
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
