import { IStorage } from '../types/IStorage'
import { MemoryStorage } from './memory'
import { SQLiteStorage } from './sqlite'
import { isA } from '../types/helpers'

export type StorageType = 'memory' | 'sqlite'

export function checkStorageType (value: any): void {
  if (typeof value !== 'string') {
    throw new Error('Invalid storage type : expected string')
  }
  if (!['memory', 'sqlite'].includes(value)) {
    throw new Error('Invalid storage type : unexpected value')
  }
}

export const isStorageType = isA<StorageType>(checkStorageType)

export function storageFactory (type: StorageType): IStorage | null {
  if (type === 'memory') {
    return new MemoryStorage()
  }
  if (type === 'sqlite') {
    return new SQLiteStorage()
  }
  return null
}
