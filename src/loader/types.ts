import { STOREDRECORDTYPE_TAG, isLiteralObject } from '../types/StoredRecord'
import { isTypeDefinition, isTypeName, TypeDefinition } from '../types/TypeDefinition'
import { isStorageType, StorageType } from '../storages'

export interface CsvLoader {
  $type: string
  csv: string
  separator?: string // = ','
  tagSeparator?: string // = '|'
}
export function isCsvLoader (value: any): value is CsvLoader {
  if (!isLiteralObject(value)) {
    return false
  }
  const { $type, csv, separator, tagSeparator } = value
  return (isTypeName($type) || $type === STOREDRECORDTYPE_TAG) &&
    typeof csv === 'string' &&
    (separator === undefined || typeof separator === 'string') &&
    (tagSeparator === undefined || typeof tagSeparator === 'string')
}

export interface CustomLoader {
  custom: string
}
export function isCustomLoader (value: any): value is CustomLoader {
  if (!isLiteralObject(value)) {
    return false
  }
  const { custom } = value
  return typeof custom === 'string'
}

export type RecordLoader = CsvLoader | CustomLoader
function isLoader (value: any): value is RecordLoader {
  return isCsvLoader(value) || isCustomLoader(value)
}

export interface Configuration {
  serve?: number
  storage: StorageType
  types: TypeDefinition[]
  loaders: RecordLoader[]
}

export function isConfiguration (value: any): value is Configuration {
  if (!isLiteralObject(value)) {
    return false
  }
  const { serve, storage, types, loaders } = value
  return (serve === undefined || typeof serve === 'number') &&
    isStorageType(storage) &&
    Array.isArray(types) && types.every((type: any) => isTypeDefinition(type)) &&
    loaders.length > 0 && loaders.every((loader: any) => isLoader(loader))
}
