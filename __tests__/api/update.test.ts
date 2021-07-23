/* eslint-disable @typescript-eslint/no-floating-promises */

import { IStorage } from '../../src/types/IStorage'
import { MemoryStorage } from '../../src/storages/memory'
import { update } from '../../src/api/update'

describe('api/create', () => {
  const storage: IStorage = new MemoryStorage()

  beforeAll(async () => {
    await storage.create({
      type: 'modifiable',
      id: '1',
      name: 'initial',
      fields: {},
      refs: {}
    })
  })

  it('ensures the received body is a valid StoredRecord', async () => {
    expect(async () => await update(storage, {})).rejects.toThrow(Error)
  })

  it('ensures the received type and id identifies an existing record', async () => {
    expect(async () => await update(storage, {
      type: 'unknown',
      id: '123',
      name: 'initial',
      fields: {},
      refs: {}
    })).rejects.toThrow(Error)
  })

  it('computes the update instructions (name)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'modified',
      fields: {},
      refs: {}
    })
    const record = await storage.get('modifiable', '1')
    expect(record).not.toEqual(undefined)
    if (record !== undefined) {
      expect(record.name).toEqual('modified')
    }
  })
})
