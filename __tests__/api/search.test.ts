import { IStorage, SearchOptions, SearchResult } from '../../src/types/IStorage'
import search from '../../src/api/search'

type SearchResultAndOptions = SearchResult & {
  options: SearchOptions
}

describe('api/search', () => {
  const $options = Symbol('options')
  const storage: IStorage = {
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

  it('search all records', async () => {
    const result: SearchResultAndOptions = await search(storage, '/records') as SearchResultAndOptions
    // check result.options
  })
})