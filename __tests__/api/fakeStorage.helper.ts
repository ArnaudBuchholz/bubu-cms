import { StoredRecordType, StoredRecordId, StorableRecord, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'

export const fakeStorage: IStorage = {
  async search (options: SearchOptions): Promise<SearchResult> {
    const result: SearchResult = {
      records: [],
      count: 0,
      refs: {}
    }
    return result
  },

  async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
    return null
  },

  async create (record: StorableRecord): Promise<StoredRecordId> {
    return ''
  },

  async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
  },

  async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
  }
}
