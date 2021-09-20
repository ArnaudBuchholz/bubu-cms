import { IStorage } from '../types/IStorage'
import { MemoryStorage } from './memory'
import { SQLiteStorage } from './sqlite'

export type StorageType = 'memory' | 'sqlite'
export function isStorageType (value: any): value is StorageType {
  return ['memory', 'sqlite'].includes(value)
}

export function storageFactory (type: StorageType): IStorage | undefined {
  if (type === 'memory') {
    return new MemoryStorage()
  }
  if (type === 'sqlite') {
    return new SQLiteStorage()
  }
}
