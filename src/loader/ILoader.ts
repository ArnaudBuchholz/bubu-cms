import { StorableRecord, StoredRecordId } from '../types/StoredRecord'
import { TypeName } from '../types/TypeDefinition'

export interface ILoader {
  log: (...content: any[]) => void
  getTypeId: (typeName: TypeName) => Promise<StoredRecordId | null>
  create: (record: StorableRecord) => Promise<StoredRecordId>
}
