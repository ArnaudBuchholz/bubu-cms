import { SearchResult } from '../../src/types/IStorage'
import { MemoryStorage } from '../../src/storages/memory'
import { StoredRecord } from '../../src/types/StoredRecord'

describe('storages/memory', () => {
  let storage: MemoryStorage

  const tags: Record<string, StoredRecord> = [...new Array(10).keys()]
    .reduce((dictionary: Record<string, StoredRecord>, index: number): Record<string, StoredRecord> => {
      dictionary[index] = {
        type: 'tag',
        id: `tag${index}`,
        name: `Tag ${index}`,
        refs: {},
        fields: {}
      }
      return dictionary
    }, {})

  const record0: StoredRecord = {
    type: 'record',
    id: 'record0',
    name: 'Record 0',
    rating: 3,
    touched: new Date('2021-06-12T12:14:23.000Z'),
    refs: { tag: ['tag0', 'tag7'] },
    fields: {
      a: 'a',
      b: 'b'
    }
  }

  const record1: StoredRecord = {
    type: 'record',
    id: 'record1',
    name: 'Record 1',
    rating: 5,
    touched: new Date('2021-04-12T14:12:12.000Z'),
    refs: { tag: ['tag0', 'tag1', 'tag2'] },
    fields: {
      a: 'A',
      b: 'B'
    }
  }

  const record2: StoredRecord = {
    type: 'record',
    id: 'record2',
    name: 'A record 2',
    rating: 1,
    touched: new Date('2021-05-26T08:21:00.000Z'),
    refs: { tag: ['tag0', 'tag9', 'tag8'] },
    fields: {
      a: 'bA',
      b: 'aB'
    }
  }

  const records: StoredRecord[] = [
    ...Object.keys(tags).map(index => tags[index]),
    record0,
    record1,
    record2
  ]

  beforeAll(async () => {
    storage = new MemoryStorage()
    for await (const record of records) {
      await storage.create(record)
    }
  })

  describe('get', () => {
    it('retreives any record by type and id (record)', async () => {
      const retreived: undefined | StoredRecord = await storage.get('record', 'record0')
      expect(retreived).toEqual(record0)
    })

    it('retreives any record by type and id (tag)', async () => {
      const retreived: undefined | StoredRecord = await storage.get('tag', 'tag7')
      expect(retreived).toEqual(tags[7])
    })

    it('returns undefined if not found', async () => {
      const retreived: undefined | StoredRecord = await storage.get('tag', 'tag12')
      expect(retreived).toEqual(undefined)
    })
  })

  describe('search', () => {
    it('returns everything (including refs)', async () => {
      const all: SearchResult = await storage.search({
        paging: { skip: 0, top: 100 },
        refs: {}
      })
      expect(all.count).toEqual(records.length)
      expect(all.refs.tag).not.toEqual(undefined)
      expect(all.refs.tag.length).not.toEqual(0)
    })

    it('searches through refs', async () => {
      const all: SearchResult = await storage.search({
        paging: { skip: 0, top: 100 },
        refs: {
          tag: ['tag7']
        }
      })
      expect(all.count).toEqual(1)
      expect(all.records[0]).toEqual(record0)
      expect(all.refs.tag).toEqual({
        tag0: tags[0],
        tag7: tags[7]
      })
    })

    it('searches using text', async () => {
      const all: SearchResult = await storage.search({
        paging: { skip: 0, top: 100 },
        refs: {},
        search: 'record 0'
      })
      expect(all.count).toEqual(1)
      expect(all.records[0]).toEqual(record0)
      expect(all.refs.tag).toEqual({
        tag0: tags[0],
        tag7: tags[7]
      })
    })

    /*
    describe('sorting', () => {
      it('sort by name (ascending)', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          refs: { tag: [ 'tag0' ]},
          sort: {

          }

        })
      })
    })
*/
  })
})
