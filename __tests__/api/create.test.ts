/* eslint-disable @typescript-eslint/no-floating-promises */

import { StoredRecordType, StoredRecordId, StoredRecord, isStoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'
import { create } from '../../src/api/create'

describe('api/create', () => {
  class Storage implements IStorage {
    public created: undefined | StoredRecord = undefined
    async search (options: SearchOptions): Promise<SearchResult> {
      return { records: [], count: 0, refs: {} }
    }
    async get (type: StoredRecordType, id: StoredRecordId): Promise<undefined | StoredRecord> { return undefined }
    async create (record: StoredRecord): Promise<void> {
      this.created = record
    }
    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {}
    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {}
  }

  const storage: Storage = new Storage()

  
})
