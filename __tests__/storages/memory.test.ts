import { SearchResult, SortableField } from '../../src/types/IStorage'
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
    rating: 5,
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
    rating: 3,
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

    it('returns undefined if not found (invalid id)', async () => {
      const retreived: undefined | StoredRecord = await storage.get('tag', 'tag12')
      expect(retreived).toEqual(undefined)
    })

    it('returns undefined if not found (invalid type)', async () => {
      const retreived: undefined | StoredRecord = await storage.get('unknwon', '123')
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

    it('searches through multiple refs', async () => {
      const all: SearchResult = await storage.search({
        paging: { skip: 0, top: 100 },
        refs: {
          tag: ['tag0', 'tag7']
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

    describe('sorting', () => {
      const tests = [{
        field: 'name',
        ascending: true,
        expected: [record2, record0, record1]
      }, {
        field: 'name',
        ascending: false,
        expected: [record1, record0, record2]
      }, {
        field: 'rating',
        ascending: true,
        expected: [record2, record1, record0]
      }, {
        field: 'rating',
        ascending: false,
        expected: [record0, record1, record2]
      }, {
        field: 'touched',
        ascending: true,
        expected: [record1, record2, record0]
      }, {
        field: 'touched',
        ascending: false,
        expected: [record0, record2, record1]
      }]
      tests.forEach(({ field, ascending, expected }) => {
        it(`sort by ${field} (${ascending ? 'ascending' : 'descending'})`, async () => {
          const all: SearchResult = await storage.search({
            paging: { skip: 0, top: 100 },
            refs: { tag: ['tag0'] },
            sort: {
              field: field as SortableField,
              ascending
            }
          })
          expect(all.records).toEqual(expected)
        })
      })
    })
  })

  describe('record lifecycle', () => {
    const lifecycle0: StoredRecord = {
      type: 'lifecycle',
      id: 'lifecycle0',
      name: 'A new record',
      refs: { tag: ['tag0', 'tag9', 'tag8'] },
      fields: {
        a: 'a',
        b: 'b'
      }
    }

    const getLifecycle0 = async (): Promise<undefined | StoredRecord> => await storage.get('lifecycle', 'lifecycle0')

    beforeAll(async () => await storage.create(lifecycle0))

    it('created the lifecycle record', async () => {
      const record: undefined | StoredRecord = await getLifecycle0()
      expect(record).toEqual(lifecycle0)
    })

    describe('updating', () => {
      it('updates name', async () => {
        await storage.update('lifecycle', 'lifecycle0', {
          name: 'New name',
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record?.name).toEqual('New name')
      })

      it('updates icon', async () => {
        await storage.update('lifecycle', 'lifecycle0', {
          icon: 'anything',
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record?.icon).toEqual('anything')
      })

      it('updates rating', async () => {
        await storage.update('lifecycle', 'lifecycle0', {
          rating: 4,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record?.rating).toEqual(4)
      })

      it('updates touched', async () => {
        const touched = new Date()
        await storage.update('lifecycle', 'lifecycle0', {
          touched,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record?.touched).toEqual(touched)
      })

      it('updates fields', async () => {
        await storage.update('lifecycle', 'lifecycle0', {
          fields: {
            a: 'A',
            b: undefined,
            c: 'c'
          },
          refs: { add: {}, del: {} }
        })
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record).not.toEqual(undefined)
        if (record !== undefined) {
          expect(record.fields.a).toEqual('A')
          expect(record.fields.c).toEqual('c')
          expect(Object.keys(record.fields).length).toEqual(2)
        }
      })

      it('updates references', async () => {
        await storage.update('lifecycle', 'lifecycle0', {
          fields: {},
          refs: {
            add: {
              tag: ['tag1']
            },
            del: {
              tag: ['tag0']
            }
          }
        })
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record?.refs).toEqual({
          tag: ['tag9', 'tag8', 'tag1']
        })
      })
    })

    describe('deleting', () => {
      it('removes the record', async () => {
        await storage.delete('lifecycle', 'lifecycle0')
        const record: undefined | StoredRecord = await getLifecycle0()
        expect(record).toEqual(undefined)
      })
    })
  })
})
