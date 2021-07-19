/* eslint-disable @typescript-eslint/no-floating-promises */

import { StoredRecordType, StoredRecordId, StoredRecordRefs, StoredRecord } from '../../src/types/StoredRecord'
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

  function genTests (baseUrl: string, baseRefs: StoredRecordRefs, label: string): void {
    it(`searches ${label}`, async () => {
      const result: SearchResultAndOptions = await search(storage, baseUrl) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        refs: baseRefs
      })
    })

    it(`searches ${label} with paging`, async () => {
      const result: SearchResultAndOptions = await search(storage, `${baseUrl}?top=45&skip=20`) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 20,
          top: 45
        },
        refs: baseRefs
      })
    })

    it(`searches ${label} with sorting (not specified)`, async () => {
      const result: SearchResultAndOptions = await search(storage, `${baseUrl}?sort=name`) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        sort: {
          field: 'name',
          ascending: true
        },
        refs: baseRefs
      })
    })

    it(`searches ${label} with sorting (ascending)`, async () => {
      const result: SearchResultAndOptions = await search(storage, `${baseUrl}?sort=name%20asc`) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        sort: {
          field: 'name',
          ascending: true
        },
        refs: baseRefs
      })
    })

    it(`searches ${label} with sorting (descending)`, async () => {
      const result: SearchResultAndOptions = await search(storage, `${baseUrl}?sort=name%20desc`) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        sort: {
          field: 'name',
          ascending: false
        },
        refs: baseRefs
      })
    })

    it(`searches ${label} with text criteria`, async () => {
      const result: SearchResultAndOptions = await search(storage, `${baseUrl}?search=Hello%20World!`) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        search: 'Hello World!',
        refs: baseRefs
      })
    })

    describe('errors', () => {
      it('validates parameters', () => {
        expect(async () => await search(storage, `${baseUrl}?unknown=abc&skip=20`)).rejects.toThrow(Error)
      })

      it('validates top parameter', () => {
        expect(async () => await search(storage, `${baseUrl}?top=abc&skip=20`)).rejects.toThrow(Error)
      })

      it('validates skip parameter', () => {
        expect(async () => await search(storage, `${baseUrl}?top=50&skip=abc`)).rejects.toThrow(Error)
      })

      it('validates sort parameter', () => {
        expect(async () => await search(storage, `${baseUrl}?sort=any`)).rejects.toThrow(Error)
      })

      it('validates sort direction', () => {
        expect(async () => await search(storage, `${baseUrl}?sort=name any`)).rejects.toThrow(Error)
      })
    })
  }

  describe('all records', () => genTests('/records', {}, 'all records'))
  describe('tags', () => genTests('/records/$tag', { $type: ['$tag'] }, 'tags'))
  describe('types', () => genTests('/records/$type', { $type: ['$type'] }, 'types'))
  describe('custom records', () => genTests('/records/custom', { $type: ['custom'] }, 'custom records'))

  describe('errors', () => {
    it('validates syntax', async () => {
      expect(async () => await search(storage, '/anything')).rejects.toThrow(Error)
    })

    it('validates syntax (too many steps)', async () => {
      expect(async () => await search(storage, '/records/any/thing')).rejects.toThrow(Error)
    })

    it('rejects invalid types ($any)', async () => {
      expect(async () => await search(storage, '/records/$any')).rejects.toThrow(Error)
    })

    it('rejects invalid types (123)', async () => {
      expect(async () => await search(storage, '/records/123')).rejects.toThrow(Error)
    })
  })
})
