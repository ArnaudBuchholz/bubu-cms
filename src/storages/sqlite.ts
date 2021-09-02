import { StoredRecordType, StoredRecordId, StorableRecord, StoredRecord } from '../types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../types/IStorage'

export class SQLLiteStorage implements IStorage {
  // region IStorage

  async search (options: SearchOptions): Promise<SearchResult> {
    return {
      count: 0,
      records: [],
      refs: {}
    }
  }

  async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
    return null
  }

  async create (record: StorableRecord): Promise<StoredRecordId> {
    return ''
  }

  async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
  }

  async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
  }

  // endregion
}
