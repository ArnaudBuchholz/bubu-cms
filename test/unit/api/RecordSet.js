'use strict'

const gpf = require('gpf-js')
const assert = require('assert')
const Database = require('../../../api/Database')
const Searchable = require('../../../api/Searchable')

const attribute = gpf.attributes.decorator

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
          this._id = data.name
          'name,statusText1,statusText2'.split(',').forEach(property => {
            this[`_${property}`] = data[property]
          })
          data.tags.forEach(tag => this.addTag(tag))
        }
      }
      attribute(new Searchable())(MyRecord, 'name')
      attribute(new Searchable())(MyRecord, 'statusText1')
      attribute(new Searchable())(MyRecord, 'statusText2')
      const records = [{
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
      }]
      records.forEach(data => new MyRecord(data))
    })
    it('retreives records by id', () => db.records.byId('a')
      .then(record => {
        checkNames([record], 'a')
      })
    )
    it('retreives records by name', () => db.records.query('a')
      .then(records => {
        checkNames(records, 'a')
      })
    )
    it('retreives records by tags (type)', () => db.records.query('#myrecord')
      .then(records => {
        checkNames(records, 'abcde')
      })
    )
    it('retreives records by tags (multiple)', () => db.records.query('#myrecord #accent-placeholder')
      .then(records => {
        checkNames(records, 'ace')
      })
    )
    it('retreives records by tags and one search term', () =>
      db.records.query('#myrecord #accent-placeholder egg')
        .then(records => {
          checkNames(records, 'e')
        })
    )
    it('retreives records by tags and multiple search terms (OR)', () =>
      db.records.query('#myrecord #accent-placeholder egg A')
        .then(records => {
          checkNames(records, 'ae')
        })
    )
  })
})
