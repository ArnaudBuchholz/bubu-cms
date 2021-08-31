import { StoredRecordId, StoredRecordType, StoredRecord } from '../types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../types/IStorage'

export class SQLLiteStorage implements IStorage {
  // region IStorage

  async search (options: SearchOptions): Promise<SearchResult> {
  }

  async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
  }

  async create (record: StoredRecord): Promise<void> {
  }

  async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
  }

  async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
  }

  // endregion
}
