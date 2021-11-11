import { StoredRecordRefs, $tag } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, encodeSearchOptions } from '../../src/types/IStorage'
import { DEFAULT_PAGE_SIZE, search, decodeSearchOptions } from '../../src/api/search'
import { fakeStorage } from './fakeStorage.helper'

type SearchResultAndOptions = SearchResult & {
  options: SearchOptions
}

describe('api/search', () => {
  const storage: IStorage = {
    ...fakeStorage,

    async search (options: SearchOptions): Promise<SearchResult> {
      const result: SearchResultAndOptions = {
        records: [],
        count: 0,
        refs: {},
        options
      }
      return result
    }
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

    it(`searches ${label} with generic text criteria`, async () => {
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

    it(`searches ${label} with exact name criteria`, async () => {
      const result: SearchResultAndOptions = await search(storage, `${baseUrl}?name=Hello%20World!`) as SearchResultAndOptions
      expect(result.options).toEqual({
        paging: {
          skip: 0,
          top: DEFAULT_PAGE_SIZE
        },
        search: 'Hello World!',
        fullNameOnly: true,
        refs: baseRefs
      })
    })

    describe('errors', () => {
      it('validates parameters', async () => {
        return await expect(search(storage, `${baseUrl}?unknown=abc&skip=20`)).rejects.toThrow(Error)
      })

      it('validates top parameter', async () => {
        return await expect(search(storage, `${baseUrl}?top=abc&skip=20`)).rejects.toThrow(Error)
      })

      it('validates skip parameter', async () => {
        return await expect(search(storage, `${baseUrl}?top=50&skip=abc`)).rejects.toThrow(Error)
      })

      it('validates sort parameter', async () => {
        return await expect(search(storage, `${baseUrl}?sort=any`)).rejects.toThrow(Error)
      })

      it('validates sort direction', async () => {
        return await expect(search(storage, `${baseUrl}?sort=name any`)).rejects.toThrow(Error)
      })

      it('validates exclusive search vs name', async () => {
        return await expect(search(storage, `${baseUrl}?search=a&name=b`)).rejects.toThrow(Error)
      })

      it('validates exclusive name vs search', async () => {
        return await expect(search(storage, `${baseUrl}?name=a&search=b`)).rejects.toThrow(Error)
      })

      it('validates refs (invalid JSON)', async () => {
        return await expect(search(storage, `${baseUrl}?refs={abc}`)).rejects.toThrow(Error)
      })

      it('validates refs (invalid type)', async () => {
        return await expect(search(storage, `${baseUrl}?refs={"a":"b"}`)).rejects.toThrow(Error)
      })
    })
  }

  describe('all records', () => genTests('/records', {}, 'all records'))
  describe('tags', () => genTests('/records/$tag', { $type: ['$tag'] }, 'tags'))
  describe('types', () => genTests('/records/$type', { $type: ['$type'] }, 'types'))
  describe('custom records', () => genTests('/records/custom', { $type: ['custom'] }, 'custom records'))

  describe('errors', () => {
    it('validates syntax', async () => {
      return await expect(search(storage, '/anything')).rejects.toThrow(Error)
    })

    it('validates syntax (too many steps)', async () => {
      return await expect(search(storage, '/records/any/thing')).rejects.toThrow(Error)
    })

    it('rejects invalid types ($any)', async () => {
      return await expect(search(storage, '/records/$any')).rejects.toThrow(Error)
    })

    it('rejects invalid types (123)', async () => {
      return await expect(search(storage, '/records/123')).rejects.toThrow(Error)
    })
  })

  describe('SearchOptions serialization', () => {
    const options: SearchOptions[] = [{
      paging: { skip: 0, top: 10 },
      refs: {}
    }, {
      paging: { skip: 1, top: 50 },
      refs: {},
      sort: {
        field: 'name',
        ascending: true
      },
      search: 'a'
    }, {
      paging: { skip: 50, top: 100 },
      refs: {},
      sort: {
        field: 'rating',
        ascending: false
      },
      search: 'a',
      fullNameOnly: true
    }, {
      paging: { skip: 50, top: 100 },
      refs: {
        [$tag]: ['123', '456']
      },
      sort: {
        field: 'rating',
        ascending: false
      },
      search: 'a',
      fullNameOnly: true
    }]

    options.forEach(option => {
      it(JSON.stringify(option), () => {
        const urlParams = encodeSearchOptions(option)
        const deserialized = decodeSearchOptions(urlParams)
        expect(deserialized).toMatchObject(option)
      })
    })
  })
})
