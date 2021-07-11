import { MemoryStorage } from '../../src/storages/memory'
import { StoredRecord } from '../../src/types/StoredRecord'

describe('storages/memory', () => {
  let storage: MemoryStorage

  const tags: StoredRecord[] = [...new Array(10).keys()].map(index => {
    return {
      type: 'tag',
      id: `tag${index}`,
      name: `Tag ${index}`,
      refs: {},
      fields: {}
    }
  })

  const records: StoredRecord[] = [{
    type: 'record',
    id: 'record0',
    name: 'Record 0',
    refs: { tag: ['tag0', 'tag7'] },
    fields: {
      a: 'a',
      b: 'b'
    }
  }]

  beforeAll(async () => {
    storage = new MemoryStorage()
    // Initial filling
    for await (const tag of tags) {
      await storage.create(tag)
    }
    for await (const record of records) {
      await storage.create(record)
    }
  })

  describe('get', () => {
    it('retreives any record by type and id (record)', async () => {
      const retreived: undefined | StoredRecord = await storage.get('record', 'record0')
      expect(retreived).toEqual(records[0])
    })

    it('retreives any record by type and id (tag)', async () => {
      const retreived: undefined | StoredRecord = await storage.get('tag', 'tag7')
      expect(retreived).toEqual(tags[7])
    })
  })

  describe('search', () => {
    // it('')
  })
})
