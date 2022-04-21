import { IStorage, SearchOptions, SearchResult } from '../types/IStorage'
import { StorableRecord, StoredRecord, StoredRecordId, StoredRecordType } from '../types/StoredRecord'
import { TypeName, StoredTypeDefinition, FieldType } from '../types/TypeDefinition'

export type LogType = 'info' | 'warning' | 'error' | 'fatal'

export interface ILoaderTypeFieldOptions {
  type?: FieldType
}

export interface ILoaderType {
  selectOrder: (position: number) => ILoaderType
  defaultIcon: (value: string | ((record: StoredRecord) => string)) => ILoaderType
  field: (name: string, options: ILoaderTypeFieldOptions) => ILoaderType
  upsert: () => Promise<StoredRecordType>
}

export interface ILoader {
  log: (type: LogType, module: string, message: string, details?: object) => void

  port: (serverPort: number) => void
  storage: (storageType: string) => Promise<IStorage>

  type: (name: string) => ILoaderType

  search: (options: SearchOptions) => Promise<SearchResult>
  create: (record: StorableRecord) => Promise<StoredRecordId>
  update: (record: StoredRecord) => Promise<void>
  delete: (record: StoredRecord) => Promise<void>
}
