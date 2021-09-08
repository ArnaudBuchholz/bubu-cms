import { StoredRecordType, StoredRecordId, StorableRecord, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage } from '../../src/types/IStorage'
import { create } from '../../src/api/create'
import fakeStorage from './fakeStorage.helper'

describe('api/create', () => {
  let created: null | StoredRecord = null

  const storage: IStorage = Object.assign(fakeStorage, {
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
    },

    async create (record: StorableRecord): Promise<StoredRecordId> {
      created = { ...record, id: '123' }
      return '123'
    }
  })

  beforeAll(() => {
    created = null
  })

  it('ensures the received body is a valid StorableRecord', async () => {
    await expect(create(storage, {})).rejects.toThrow(Error)
    expect(created).toEqual(null)
  })

  it('creates new StoredRecord', async () => {
    const id = await create(storage, {
      type: 'new',
      name: 'Should work',
      fields: {},
      refs: {}
    })
    expect(id).toEqual('123')
    expect(created).not.toEqual(null)
  })
})
