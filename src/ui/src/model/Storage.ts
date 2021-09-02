import JSONModel from 'sap/ui/model/json/JSONModel'
import { StoredRecordType, StoredRecordId, StorableRecord, StoredRecord } from '../types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../types/IStorage'

export default class StorageModel extends JSONModel implements IStorage {
  // region IStorage

  async search (options: SearchOptions): Promise<SearchResult> {
    const response = await fetch('/api/search', {
      method: 'GET'
    })
    const json = await response.json()
    return json as SearchResult
  }

  async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
    const response = await fetch('/api/get', {
      method: 'GET'
    })
    const json = await response.json()
    return json as StoredRecord
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
