import { isLiteralObject } from '../types/StoredRecord'
import { TypeDefinition } from '../types/TypeDefinition'
import { isStorageType, StorageType } from '../storages'

export interface RecordSet {
  $type: string
  csv: string
}

export interface Configuration {
  serve?: number
  storage: StorageType
  types: TypeDefinition[]
  records: RecordSet[]
}

export function isConfiguration (value: any): value is Configuration {
  if (!isLiteralObject(value)) {
    return false
  }
  const { serve, storage } = value
  return (serve === undefined || typeof serve === 'number') &&
    isStorageType(storage)
}
