import { StoredRecordType, StoredRecordId, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage } from '../../src/types/IStorage'
import { deleteRecord } from '../../src/api/delete'
import fakeStorage from './fakeStorage'

describe('api/create', () => {
  let deleted: null | StoredRecord = null
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

    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
      deleted = await this.get(type, id)
    }
  })

  beforeAll(() => {
    deleted = null
  })

  it('ensures the received type and id identifies an existing record', async () => {
    await expect(deleteRecord(storage, 'unknown', '123')).rejects.toThrow(Error)
    expect(deleted).toEqual(null)
  })

  it('ensures the existing record is deleted', async () => {
    await expect(deleteRecord(storage, 'exists', '123')).resolves.toBeUndefined()
    expect(deleted).not.toEqual(null)
  })
})
