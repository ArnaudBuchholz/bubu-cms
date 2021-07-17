import { StoredRecordType, StoredRecordId, /* StoredRecordRating, StoredRecordRefs, Fields, */ StoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'
import { DEFAULT_PAGE_SIZE, search } from '../../src/api/search'

type SearchResultAndOptions = SearchResult & {
  options: SearchOptions
}

describe('api/search', () => {
  const storage: IStorage = {
    async search (options: SearchOptions): Promise<SearchResult> {
      const result: SearchResultAndOptions = {
        records: [],
        count: 0,
        refs: {},
        options
      }
      return result
    },
    async get (type: StoredRecordType, id: StoredRecordId): Promise<undefined | StoredRecord> { return undefined },
    async create (record: StoredRecord): Promise<void> {},
    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {},
    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {}
  }

  describe('all records', () => {
    it('search all records', async () => {
      const result: SearchResultAndOptions = await search(storage, '/records') as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        refs: {}
      })
    })

    it('search all records with paging', async () => {
      const result: SearchResultAndOptions = await search(storage, '/records?top=45&skip=20') as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 20,
          top: 45
        },
        refs: {}
      })
    })
  })

  describe('errors', () => {
    it('validates parameters', async () => {
      expect(await search(storage, '/records?unknown=abc&skip=20')).toThrow(Error)
    })

    it('validates skip & top parameters', async () => {
      expect(await search(storage, '/records?top=abc&skip=20')).toThrow(Error)
    })

    it('validates syntax', async () => {
      expect(await search(storage, '/anything')).toThrow(Error)
    })
  })
})
