/* eslint-disable @typescript-eslint/no-floating-promises */

import { StoredRecordType, StoredRecordId, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'
import { create } from '../../src/api/create'

describe('api/create', () => {
  class Storage implements IStorage {
    public created: null | StoredRecord = null
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

    async create (record: StoredRecord): Promise<void> {
      this.created = record
    }

    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {}
    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {}
  }

  const storage: Storage = new Storage()

  beforeAll(() => {
    storage.created = null
  })

  it('ensures the received body is a valid StoredRecord', async () => {
    expect(async () => await create(storage, {})).rejects.toThrow(Error)
    expect(storage.created).toEqual(null)
  })

  it('ensures an existing StoredRecord can not be recreated', async () => {
    expect(async () => await create(storage, {
      type: 'exists',
      id: '123',
      name: 'Attempt',
      fields: {},
      refs: {}
    })).rejects.toThrow(Error)
    expect(storage.created).toEqual(null)
  })

  it('creates new StoredRecord', async () => {
    await create(storage, {
      type: 'new',
      id: '123',
      name: 'Should work',
      fields: {},
      refs: {}
    })
    expect(storage.created).not.toEqual(null)
  })
})
