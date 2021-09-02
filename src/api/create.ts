import { IStorage } from '../types/IStorage'
import { StoredRecordId, isStorableRecord } from '../types/StoredRecord'

export async function create (storage: IStorage, jsonBody: object): Promise<StoredRecordId> {
  if (!isStorableRecord(jsonBody)) {
    throw new Error('Not a record')
  }
  return await storage.create(jsonBody)
}
