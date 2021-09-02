import { IStorage } from '../types/IStorage'
import { TypeDefinition } from '../types/TypeDefinition'
import { StoredRecord, $type } from '../types/StoredRecord'

async function createType (storage: IStorage, typeDefinition: TypeDefinition): Promise<void> {

}

async function updateType (storage: IStorage, typeDefinition: TypeDefinition, existing: StoredRecord): Promise<void> {
  throw new Error('Not implemented')
}

export async function declareType (storage: IStorage, typeDefinition: TypeDefinition): Promise<void> {
  const { name } = typeDefinition
  const existing: StoredRecord | null = await storage.get($type, name)
  if (existing === null) {
    await createType(storage, typeDefinition)
  } else {
    await updateType(storage, typeDefinition, existing)
  }
}
