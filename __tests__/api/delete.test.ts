/* eslint-disable @typescript-eslint/no-floating-promises */

import { StoredRecordType, StoredRecordId, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'
import { deleteRecord } from '../../src/api/delete'

describe('api/create', () => {
  class Storage implements IStorage {
    public deleted: null | StoredRecord = null
    async search (options: SearchOptions): Promise<SearchResult> {
      return { records: [], count: 0, refs: {} }
    }

    async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
      if (type === 'exists' && id === '123') {
        return {
          type: 'exists',
          id: '123',
          name: 'Already exists',
          fields: {},
          refs: {}
        }
      }
      return null
    }

    async create (record: StoredRecord): Promise<void> {}
    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {}

    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
      this.deleted = await this.get(type, id)
    }
  }

  const storage: Storage = new Storage()

  beforeAll(() => {
    storage.deleted = null
  })

  it('ensures the received type and id identifies an existing record', async () => {
    expect(async () => await deleteRecord(storage, 'unknown', '123')).rejects.toThrow(Error)
    expect(storage.deleted).toEqual(null)
  })

  it('ensures the existing record is deleted', async () => {
    await deleteRecord(storage, 'exists', '123')
    expect(storage.deleted).not.toEqual(null)
  })
})
