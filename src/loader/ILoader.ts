import { StorableRecord, StoredRecordId } from '../types/StoredRecord'
import { TypeName, TypeDefinition } from '../types/TypeDefinition'

export interface ILoader {
  log: (...content: any[]) => void
  getType: (typeName: TypeName) => Promise<TypeDefinition | null>
  getTagId: (tagName: string) => Promise<StoredRecordId | null>
  create: (record: StorableRecord) => Promise<StoredRecordId>
}
