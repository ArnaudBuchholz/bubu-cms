'use strict'

const assert = require('assert')
const Database = require('../../../../api/Database')
require('../../../../api/odata/toJSON')

describe('/api/odata/toJSON.js', () => {
  describe('Record.toJSON()', () => {
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
    it('exposes toJSON', () => assert(typeof record.toJSON === 'function'))
    it('generates a valid ODATA json', () => {
      // debugger;
      const json = record.toJSON(); // _gpfDefineEntitiesFindByConstructor must be replace by import
      assert.strictEqual(json.name,'test')
      assert.strictEqual(json.__metadata.uri, 'MyRecordSet(\'1\')')
    })
  })
})
