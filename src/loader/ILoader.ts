import { StorableRecord, StoredRecordId } from '../types/StoredRecord'
import { TypeName, StoredTypeDefinition } from '../types/TypeDefinition'

export enum LogType {
  info,
  warning,
  error,
  fatal
}

export interface ILoader {
  log: (type: LogType, module: string, message: string, details?: object) => void
  getType: (typeName: TypeName) => Promise<StoredTypeDefinition | null>
  getTagId: (tagName: string) => Promise<StoredRecordId | null>
  create: (record: StorableRecord) => Promise<StoredRecordId>
}
