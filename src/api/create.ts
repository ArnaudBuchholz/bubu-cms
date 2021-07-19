import { IStorage } from '../types/IStorage'
import { isStoredRecord } from '../types/StoredRecord'

export async function create (storage: IStorage, jsonBody: object): Promise<void> {
  if (!isStoredRecord(jsonBody)) {
    throw new Error('Not a record')
  }
  await storage.create(jsonBody)
}
