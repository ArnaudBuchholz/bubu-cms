'use strict'

const assert = require('assert')

module.exports = async function (loader) {
  assert.strictEqual(typeof loader, 'object')
  assert.strictEqual(typeof loader.log, 'function')
  assert.strictEqual(loader.log.length, 4)
  loader.log('info', 'custom', 'Validated logger.log method')
  loader.log('info', 'custom', 'Validating logger.getType method')
  assert.strictEqual(typeof loader.getType, 'function')
  assert.strictEqual(loader.getType.length, 1)
  loader.log('info', 'custom', 'Getting record type')
  const type = await loader.getType('record')
  assert.notStrictEqual(type, null)
  assert.strictEqual(typeof type.id, 'string')
//   getTagId: (tagName: string) => Promise<StoredRecordId | null>
//   create: (record: StorableRecord) => Promise<StoredRecordId>
}
