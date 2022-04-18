import { StorageType, isStorageType, storageFactory } from '.'
import { MemoryStorage } from './memory'
import { SQLiteStorage } from './sqlite'

describe('storages/factory', () => {
  it('returns memory storage', () => {
    const storage = storageFactory('memory')
    expect(isStorageType('memory')).toBe(true)
    expect(storage instanceof MemoryStorage).toBe(true)
  })

  it('returns sqlite storage', () => {
    const storage = storageFactory('sqlite')
    expect(isStorageType('sqlite')).toBe(true)
    expect(storage instanceof SQLiteStorage).toBe(true)
  })

  it('fails on unknown storage type', () => {
    const storage = storageFactory('unknown' as StorageType)
    expect(isStorageType('unknown')).toBe(false)
    expect(storage).toBeNull()
  })
})
