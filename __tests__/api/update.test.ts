/* eslint-disable @typescript-eslint/no-floating-promises */

import { StoredRecordType, StoredRecordId, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'
import { update } from '../../src/api/update'

describe('api/create', () => {
  const now = new Date()

  class Storage implements IStorage {
    public updateInstructions: undefined | UpdateInstructions = undefined
    async search (options: SearchOptions): Promise<SearchResult> {
      return { records: [], count: 0, refs: {} }
    }

    async get (type: StoredRecordType, id: StoredRecordId): Promise<undefined | StoredRecord> {
      if (type === 'modifiable' && id === '1') {
        return {
          type: 'modifiable',
          id: '1',
          name: 'initial',
          touched: now,
          fields: {
            a: 'a',
            b: 'b'
          },
          refs: {}
        }
      }
      return undefined
    }

    async create (record: StoredRecord): Promise<void> {}
    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
      this.updateInstructions = instructions
    }

    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {}
  }

  const storage: Storage = new Storage()

  beforeEach(() => {
    storage.updateInstructions = undefined
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
    expect(storage.updateInstructions).toEqual(undefined)
  })

  it('computes the update instructions (none)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'initial',
      fields: {},
      refs: {}
    })
    expect(storage.updateInstructions).toEqual(undefined)
  })

  it('computes the update instructions (name)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'modified',
      fields: {},
      refs: {}
    })
    expect(storage.updateInstructions).toEqual({
      name: 'modified',
      fields: {},
      refs: {
        add: {},
        del: {}
      }
    })
  })

  it('computes the update instructions (icon)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'initial',
      icon: 'test.jpg',
      fields: {},
      refs: {}
    })
    expect(storage.updateInstructions).toEqual({
      icon: 'test.jpg',
      fields: {},
      refs: {
        add: {},
        del: {}
      }
    })
  })

  it('computes the update instructions (rating)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'initial',
      rating: 4,
      fields: {},
      refs: {}
    })
    expect(storage.updateInstructions).toEqual({
      rating: 4,
      fields: {},
      refs: {
        add: {},
        del: {}
      }
    })
  })

  it('computes the update instructions (touched not changed)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'initial',
      touched: new Date(now),
      fields: {},
      refs: {}
    })
    expect(storage.updateInstructions).toEqual(undefined)
  })

  it('computes the update instructions (touched)', async () => {
    const touched = new Date(2021,6,25,0,10,25,0)
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'initial',
      touched,
      fields: {},
      refs: {}
    })
    expect(storage.updateInstructions).toEqual({
      touched,
      fields: {},
      refs: {
        add: {},
        del: {}
      }
    })
  })

  it('computes the update instructions (fields)', async () => {
    await update(storage, {
      type: 'modifiable',
      id: '1',
      name: 'initial',
      fields: {
        a: 'a',
        b: null,
        c: 'c'
      },
      refs: {}
    })
    expect(storage.updateInstructions).toEqual({
      fields: {
        b: null,
        c: 'c'
      },
      refs: {
        add: {},
        del: {}
      }
    })
  })
})
