import { ILoader } from './ILoader'
import { IStorage } from '../types/IStorage'
import { StorableRecord, StoredRecordId } from '../types/StoredRecord'
import { TypeDefinition, TypeName } from '../types/TypeDefinition'
import { create } from '../api/create'

export class Loader implements ILoader {
  private readonly storage: IStorage

  log (...content: any[]): void {
    console.log(...content)
  }

  async getType (typeName: TypeName): Promise<TypeDefinition | null> {
    return null
  }

  async getTagId (tagName: string): Promise<StoredRecordId | null> {
    return null
  }

  async create (record: StorableRecord): Promise<StoredRecordId> {
    return await create(this.storage, record)
  }

  constructor (storage: IStorage) {
    this.storage = storage
  }
}
