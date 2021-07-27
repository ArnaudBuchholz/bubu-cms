/* eslint-disable @typescript-eslint/no-floating-promises */

import { StoredRecordType, StoredRecordId, StoredRecord } from '../../src/types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../../src/types/IStorage'
import { update } from '../../src/api/update'

describe('api/create', () => {
  const now = new Date()

  const record1: StoredRecord = {
    type: 'modifiable',
    id: '1',
    name: 'initial',
    fields: {
      a: 'a',
      b: 'b',
      date: now
    },
    refs: {}
  }

  const record2: StoredRecord = {
    ...record1,
    id: '2',
    icon: 'initial.jpg',
    rating: 3,
    touched: now
  }

  class Storage implements IStorage {
    public updateInstructions: null | UpdateInstructions = null
    async search (options: SearchOptions): Promise<SearchResult> {
      return { records: [], count: 0, refs: {} }
    }

    async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
      if (type === 'modifiable') {
        if (id === '1') {
          return record1
        }
        if (id === '2') {
          return record2
        }
      }
      return null
    }

    async create (record: StoredRecord): Promise<void> {}
    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
      this.updateInstructions = instructions
    }

    async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {}
  }

  const storage: Storage = new Storage()

  beforeEach(() => {
    storage.updateInstructions = null
  })

  const baseInstructions: UpdateInstructions = {
    fields: {},
    refs: {
      add: {},
      del: {}
    }
  }

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
    expect(storage.updateInstructions).toEqual(null)
  })

  it('computes the update instructions (none with record1)', async () => {
    await update(storage, {
      ...record1
    })
    expect(storage.updateInstructions).toEqual(null)
  })

  it('computes the update instructions (none with record2)', async () => {
    await update(storage, {
      ...record2
    })
    expect(storage.updateInstructions).toEqual(null)
  })

  it('computes the update instructions (name)', async () => {
    await update(storage, {
      ...record1,
      name: 'modified'
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      name: 'modified'
    })
  })

  it('computes the update instructions (create icon)', async () => {
    await update(storage, {
      ...record1,
      icon: 'test.jpg'
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      icon: 'test.jpg'
    })
  })

  it('computes the update instructions (remove icon)', async () => {
    await update(storage, {
      ...record2,
      icon: undefined
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      icon: null
    })
  })

  it('computes the update instructions (create rating)', async () => {
    await update(storage, {
      ...record1,
      rating: 4
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      rating: 4
    })
  })

  it('computes the update instructions (remove rating)', async () => {
    await update(storage, {
      ...record2,
      rating: undefined
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      rating: null
    })
  })

  it('computes the update instructions (touched not changed)', async () => {
    await update(storage, {
      ...record2,
      touched: new Date(now)
    })
    expect(storage.updateInstructions).toEqual(null)
  })

  it('computes the update instructions (create touched)', async () => {
    const touched = new Date(2021, 6, 25, 0, 10, 25, 0)
    await update(storage, {
      ...record1,
      touched
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      touched
    })
  })

  it('computes the update instructions (remove touched)', async () => {
    await update(storage, {
      ...record2,
      touched: undefined
    })
    expect(storage.updateInstructions).toEqual({
      ...baseInstructions,
      touched: null
    })
  })

  describe('fields update', () => {
    it('computes new and removed fields', async () => {
      await update(storage, {
        ...record1,
        fields: {
          a: 'a',
          c: 'c',
          date: now
        }
      })
      expect(storage.updateInstructions).toEqual({
        ...baseInstructions,
        fields: {
          b: null,
          c: 'c'
        }
      })
    })

    it('handles date fields (not changed)', async () => {
      await update(storage, {
        ...record1,
        fields: {
          ...record1.fields,
          date: new Date(now)
        }
      })
      expect(storage.updateInstructions).toEqual(null)
    })

    it('handles date fields (changed)', async () => {
      const changed = new Date(2021, 6, 27, 0, 13, 18, 0)
      await update(storage, {
        ...record1,
        fields: {
          ...record1.fields,
          date: changed
        }
      })
      expect(storage.updateInstructions).toEqual({
        ...baseInstructions,
        fields: {
          date: changed
        }
      })
    })
  })

  describe('refs update', () => {
  })
})
