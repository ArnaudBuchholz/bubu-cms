import { IStorage } from '../types/IStorage'
import { StoredRecordId, StoredRecordType } from '../types/StoredRecord'

export async function deleteRecord (storage: IStorage, type: StoredRecordType, id: StoredRecordId): Promise<void> {
  if (await storage.get(type, id) === null) {
    throw new Error('Not existing')
  }
  await storage.delete(type, id)
}
