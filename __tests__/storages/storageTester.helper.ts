import { IStorage, SearchResult, SortableField } from '../../src/types/IStorage'
import { TypeDefinition, saveTypeDefinition } from '../../src/types/TypeDefinition'
import { StoredRecordType, StoredRecordId, isStoredRecordId, StoredRecord, STOREDRECORDTYPE_TAG } from '../../src/types/StoredRecord'

export default function testStorage (storage: IStorage): void {
  const tags: StoredRecord[] = [...new Array(10).keys()]
    .map((index: number) => {
      return {
        type: STOREDRECORDTYPE_TAG,
        id: '',
        name: `Tag ${index}`,
        refs: {},
        fields: {}
      }
    })

  const recordType: TypeDefinition = {
    name: 'record',
    fields: [{
      name: 'a',
      type: 'string'
    }, {
      name: 'b',
      type: 'string'
    }]
  }

  const record0: StoredRecord = {
    type: '',
    id: '',
    name: 'Record 0',
    rating: 5,
    touched: new Date('2021-06-12T12:14:23.000Z'),
    refs: { [STOREDRECORDTYPE_TAG]: ['0', '7'] },
    fields: {
      a: 'a',
      b: 'b'
    }
  }

  const record1: StoredRecord = {
    type: '',
    id: '',
    name: 'Record 1',
    rating: 3,
    refs: { [STOREDRECORDTYPE_TAG]: ['0', '1', '2'] },
    fields: {
      a: 'A',
      b: 'b'
    }
  }

  const record2: StoredRecord = {
    type: '',
    id: '',
    name: 'A record 2',
    touched: new Date('2021-05-26T08:21:00.000Z'),
    refs: { [STOREDRECORDTYPE_TAG]: ['0', '9', '8'] },
    fields: {
      a: 'bA',
      b: 'aB'
    }
  }

  let recordTypeId: StoredRecordType

  beforeAll(async () => {
    recordTypeId = await saveTypeDefinition(storage, recordType)
    for await (const tag of tags) {
      tag.id = await storage.create(tag)
    }
    for await (const record of [record0, record1, record2]) {
      record.type = recordTypeId
      record.refs[STOREDRECORDTYPE_TAG] = record.refs[STOREDRECORDTYPE_TAG].map((index: string) => tags[parseInt(index, 10)].id)
      record.id = await storage.create(record)
    }
  })

  describe('get', () => {
    it('retreives any record by type and id (record)', async () => {
      const retreived: null | StoredRecord = await storage.get(recordTypeId, record0.id)
      expect(retreived).toEqual(record0)
    })

    it('retreives any record by type and id (tag)', async () => {
      const tag7 = tags[7]
      const retreived: null | StoredRecord = await storage.get(STOREDRECORDTYPE_TAG, tag7.id)
      expect(retreived).toEqual(tag7)
    })

    it('returns null if not found (invalid id)', async () => {
      const retreived: null | StoredRecord = await storage.get(STOREDRECORDTYPE_TAG, 'tag12')
      expect(retreived).toEqual(null)
    })

    it('returns null if not found (invalid type)', async () => {
      const retreived: null | StoredRecord = await storage.get('unknwon', '123')
      expect(retreived).toEqual(null)
    })
  })

  describe('search', () => {
    it('returns everything (including refs)', async () => {
      const all: SearchResult = await storage.search({
        paging: { skip: 0, top: 100 }
      })
      expect(all.count).toEqual(tags.length + 3 /* records */ + 3 /* typedef + fields */)
      expect(all.refs[STOREDRECORDTYPE_TAG]).not.toEqual(undefined)
      expect(all.refs[STOREDRECORDTYPE_TAG].length).not.toEqual(0)
    })

    describe('references', () => {
      it('searches through refs', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          refs: {
            [STOREDRECORDTYPE_TAG]: [tags[7].id]
          }
        })
        expect(all.count).toEqual(1)
        expect(all.records[0]).toEqual(record0)
        expect(all.refs[STOREDRECORDTYPE_TAG]).toEqual({
          [tags[0].id]: tags[0],
          [tags[7].id]: tags[7]
        })
      })

      it('searches through refs (non existing)', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          refs: {
            [STOREDRECORDTYPE_TAG]: ['unknown']
          }
        })
        expect(all.count).toEqual(0)
      })

      it('searches through multiple refs', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          refs: {
            [STOREDRECORDTYPE_TAG]: [tags[0].id, tags[7].id]
          }
        })
        expect(all.count).toEqual(1)
        expect(all.records[0]).toEqual(record0)
        expect(all.refs[STOREDRECORDTYPE_TAG]).toEqual({
          [tags[0].id]: tags[0],
          [tags[7].id]: tags[7]
        })
      })
    })

    describe('text / name', () => {
      it('generic text search', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          search: 'record'
        })
        expect(all.count).toEqual(4)
      })

      it('searches using text (case insensitive)', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          search: 'record 0'
        })
        expect(all.count).toEqual(1)
        expect(all.records[0]).toEqual(record0)
        expect(all.refs[STOREDRECORDTYPE_TAG]).toEqual({
          [tags[0].id]: tags[0],
          [tags[7].id]: tags[7]
        })
      })

      it('searches using perfect name match', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          search: 'record',
          fullNameOnly: true
        })
        expect(all.count).toEqual(1)
        expect(all.records[0].id).toEqual(recordTypeId)
      })
    })

    describe('fields', () => {
      it('searches with fields (a)', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          fields: {
            a: 'a'
          }
        })
        expect(all.count).toEqual(1)
        expect(all.records[0].name).toEqual('Record 0')
      })

      it('searches with fields (b)', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          fields: {
            b: 'b'
          },
          sort: {
            field: 'rating',
            ascending: true
          }
        })
        expect(all.count).toEqual(2)
        expect(all.records[0].name).toEqual('Record 1')
        expect(all.records[1].name).toEqual('Record 0')
      })

      it('searches with fields (a & b)', async () => {
        const all: SearchResult = await storage.search({
          paging: { skip: 0, top: 100 },
          fields: {
            a: 'a',
            b: 'b'
          }
        })
        expect(all.count).toEqual(1)
        expect(all.records[0].name).toEqual('Record 0')
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
            refs: { [STOREDRECORDTYPE_TAG]: [tags[0].id] },
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
    const lifecycle: StoredRecord = {
      type: '',
      id: '',
      name: 'A new record',
      refs: {},
      fields: {
        a: 'a',
        b: 'b'
      }
    }

    const getLifecycle = async (): Promise<null | StoredRecord> => await storage.get(recordTypeId, lifecycle.id)

    beforeAll(async () => {
      lifecycle.type = recordTypeId
      lifecycle.refs = { [STOREDRECORDTYPE_TAG]: [tags[0].id, tags[9].id, tags[8].id] }
      expect(lifecycle.type).not.toBeUndefined()
      lifecycle.id = await storage.create(lifecycle)
    })

    it('created the lifecycle record', async () => {
      const record: null | StoredRecord = await getLifecycle()
      expect(record).toEqual(lifecycle)
    })

    describe('updating', () => {
      it('updates name', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          name: 'New name',
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.name).toEqual('New name')
      })

      it('updates icon', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          icon: 'anything',
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.icon).toEqual('anything')
      })

      it('removes icon', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          icon: null,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.icon).toEqual(undefined)
      })

      it('updates rating', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          rating: 4,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.rating).toEqual(4)
      })

      it('removes rating', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          rating: null,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.rating).toEqual(undefined)
      })

      it('updates touched', async () => {
        const touched = new Date()
        await storage.update(recordTypeId, lifecycle.id, {
          touched,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.touched).toEqual(touched)
      })

      it('removes touched', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          touched: null,
          fields: {},
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record?.touched).toEqual(undefined)
      })

      it('updates fields', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          fields: {
            a: 'A',
            b: null,
            c: 'c'
          },
          refs: { add: {}, del: {} }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record).not.toEqual(null)
        if (record !== null) {
          expect(record.fields.a).toEqual('A')
          expect(record.fields.c).toEqual('c')
          expect(Object.keys(record.fields).length).toEqual(2)
        }
      })

      it('updates references', async () => {
        await storage.update(recordTypeId, lifecycle.id, {
          fields: {},
          refs: {
            add: {
              [STOREDRECORDTYPE_TAG]: [tags[1].id]
            },
            del: {
              [STOREDRECORDTYPE_TAG]: [tags[0].id]
            }
          }
        })
        const record: null | StoredRecord = await getLifecycle()
        expect(record).not.toBeNull()

        function compare (id1: StoredRecordId, id2: StoredRecordId): number {
          expect(isStoredRecordId(id1)).toStrictEqual(true)
          expect(isStoredRecordId(id2)).toStrictEqual(true)
          return id1.localeCompare(id2)
        }

        if (record !== null) {
          expect(Object.keys(record.refs).length).toStrictEqual(1)
          expect(record.refs[STOREDRECORDTYPE_TAG]).not.toBeUndefined()
          expect([...record.refs[STOREDRECORDTYPE_TAG]].sort(compare)).toEqual([tags[9].id, tags[8].id, tags[1].id].sort(compare))
        }
      })
    })

    describe('deleting', () => {
      it('removes the record', async () => {
        await storage.delete(recordTypeId, lifecycle.id)
        const record: null | StoredRecord = await getLifecycle()
        expect(record).toEqual(null)
      })
    })
  })
}
