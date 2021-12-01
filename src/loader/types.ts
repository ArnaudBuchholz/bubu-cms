import { STOREDRECORDTYPE_TAG, isLiteralObject } from '../types/StoredRecord'
import { isTypeDefinition, isTypeName, TypeDefinition } from '../types/TypeDefinition'
import { checkStorageType, StorageType } from '../storages'
import { isA } from '../types/helpers'

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

export function checkConfiguration (value: any): void {
  if (!isLiteralObject(value)) {
    throw new Error('Invalid configuration : expected literal object')
  }
  const { serve, storage, types, loaders } = value
  if (serve !== undefined && typeof serve !== 'number') {
    throw new Error('Invalid configuration : serve must be a number')
  }
  checkStorageType(storage)
  if (!Array.isArray(types) || types.length === 0) {
    throw new Error('Invalid configuration : types must be a non empty array')
  }
  types.forEach((type: any, index: number): void => {
    if (!isTypeDefinition(type)) {
      throw new Error(`Invalid configuration : type #${index.toString()} is invalid`)
    }
  })
  if (!Array.isArray(loaders) || loaders.length === 0) {
    throw new Error('Invalid configuration : loaders must be a non empty array')
  }
  loaders.forEach((loader: any, index: number): void => {
    if (!isLoader(loader)) {
      throw new Error(`Invalid configuration : loader #${index.toString()} is invalid`)
    }
  })
}

export const isConfiguration = isA<Configuration>(checkConfiguration)
