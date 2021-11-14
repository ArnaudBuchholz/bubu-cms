import { SearchOptions, SearchResult } from '../types/IStorage'
import { StorableRecord, StoredRecord, StoredRecordId } from '../types/StoredRecord'
import { TypeName, StoredTypeDefinition } from '../types/TypeDefinition'

export type LogType = 'info' | 'warning' | 'error' | 'fatal'

export interface ILoader {
  log: (type: LogType, module: string, message: string, details?: object) => void
  getType: (typeName: TypeName) => Promise<StoredTypeDefinition | null>
  getTagId: (tagName: string) => Promise<StoredRecordId | null>

  search: (options: SearchOptions) => Promise<SearchResult>
  create: (record: StorableRecord) => Promise<StoredRecordId>
  update: (record: StoredRecord) => Promise<void>
  delete: (record: StoredRecord) => Promise<void>
}
