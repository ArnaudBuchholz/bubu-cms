'use strict'

const assert = require('assert')
const Database = require('../../../../api/Database')
require('../../../../api/odata/toJSON')

describe('/api/odata/toJSON.js', () => {
  let db
  let MyRecord
  let record
  beforeEach(() => {
    db = new Database('test')
    MyRecord = class MyRecord extends db.Record {
      constructor () {
        super()
        this._id = '1'
        this._name = 'test'
      }
    }
    record = new MyRecord()
  })
  describe('Record.toJSON()', () => {
    it('exposes toJSON', () => assert(typeof record.toJSON === 'function'))
    it('generates a valid ODATA json for record', () => {
      const json = record.toJSON()
      assert.strictEqual(json.name, 'test')
      assert.strictEqual(json.__metadata.uri, `MyRecordSet('1')`)
    })
  })
  describe('Tag.toJSON()', () => {
    let tag
    beforeEach(async () => {
      const tags = await db.tags.all()
      tag = tags[0]
      assert(!!tag)
    })
    it('exposes toJSON', () => assert(typeof tag.toJSON === 'function'))
    it('generates a valid ODATA json for tag', async () => {
      const json = tag.toJSON()
      assert.ok(!!json.name)
      assert.notStrictEqual(json.count, 0)
      assert.strictEqual(json.__metadata.uri, `TagSet('${json.name}')`)
    })
  })
})
