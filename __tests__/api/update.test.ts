import { StoredRecordType, StoredRecordId, StoredRecord, $tag } from '../../src/types/StoredRecord'
import { IStorage, UpdateInstructions } from '../../src/types/IStorage'
import { update } from '../../src/api/update'
import { fakeStorage } from './fakeStorage.helper'

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
    refs: {
      [$tag]: ['tag0', 'tag1', 'tag2'],
      any: ['any0', 'any1']
    }
  }

  const record2: StoredRecord = {
    ...record1,
    id: '2',
    icon: 'initial.jpg',
    rating: 3,
    touched: now
  }

  let updateInstructions: null | UpdateInstructions = null

  const storage: IStorage = {
    ...fakeStorage,

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
    },

    async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
      updateInstructions = instructions
    }
  }

  beforeEach(() => {
    updateInstructions = null
  })

  const baseInstructions: UpdateInstructions = {
    fields: {},
    refs: {
      add: {},
      del: {}
    }
  }

  it('ensures the received body is a valid StoredRecord', async () => {
    return await expect(update(storage, {})).rejects.toThrow(Error)
  })

  it('ensures the received type and id identifies an existing record', async () => {
    await expect(update(storage, {
      type: 'unknown',
      id: '123',
      name: 'initial',
      fields: {},
      refs: {}
    })).rejects.toThrow(Error)
    expect(updateInstructions).toEqual(null)
  })

  it('computes the update instructions (none with record1)', async () => {
    await expect(update(storage, {
      ...record1
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual(null)
  })

  it('computes the update instructions (none with record2)', async () => {
    await expect(update(storage, {
      ...record2
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual(null)
  })

  it('computes the update instructions (name)', async () => {
    await expect(update(storage, {
      ...record1,
      name: 'modified'
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      name: 'modified'
    })
  })

  it('computes the update instructions (create icon)', async () => {
    await expect(update(storage, {
      ...record1,
      icon: 'test.jpg'
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      icon: 'test.jpg'
    })
  })

  it('computes the update instructions (remove icon)', async () => {
    await expect(update(storage, {
      ...record2,
      icon: undefined
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      icon: null
    })
  })

  it('computes the update instructions (create rating)', async () => {
    await expect(update(storage, {
      ...record1,
      rating: 4
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      rating: 4
    })
  })

  it('computes the update instructions (remove rating)', async () => {
    await expect(update(storage, {
      ...record2,
      rating: undefined
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      rating: null
    })
  })

  it('computes the update instructions (touched not changed)', async () => {
    await expect(update(storage, {
      ...record2,
      touched: new Date(now)
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual(null)
  })

  it('computes the update instructions (create touched)', async () => {
    const touched = new Date(2021, 6, 25, 0, 10, 25, 0)
    await expect(update(storage, {
      ...record1,
      touched
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      touched
    })
  })

  it('computes the update instructions (remove touched)', async () => {
    await expect(update(storage, {
      ...record2,
      touched: undefined
    })).resolves.toBeUndefined()
    expect(updateInstructions).toEqual({
      ...baseInstructions,
      touched: null
    })
  })

  describe('fields update', () => {
    it('computes new and removed fields', async () => {
      await expect(update(storage, {
        ...record1,
        fields: {
          a: 'a',
          c: 'c',
          date: now
        }
      })).resolves.toBeUndefined()
      expect(updateInstructions).toEqual({
        ...baseInstructions,
        fields: {
          b: null,
          c: 'c'
        }
      })
    })

    it('handles date fields (not changed)', async () => {
      await expect(update(storage, {
        ...record1,
        fields: {
          ...record1.fields,
          date: new Date(now)
        }
      })).resolves.toBeUndefined()
      expect(updateInstructions).toEqual(null)
    })

    it('handles date fields (changed)', async () => {
      const changed = new Date(2021, 6, 27, 0, 13, 18, 0)
      await expect(update(storage, {
        ...record1,
        fields: {
          ...record1.fields,
          date: changed
        }
      })).resolves.toBeUndefined()
      expect(updateInstructions).toEqual({
        ...baseInstructions,
        fields: {
          date: changed
        }
      })
    })
  })

  describe('refs update', () => {
    it('ignores refs order', async () => {
      await expect(update(storage, {
        ...record1,
        refs: {
          any: ['any1', 'any0'],
          [$tag]: ['tag2', 'tag0', 'tag1']
        }
      })).resolves.toBeUndefined()
      expect(updateInstructions).toEqual(null)
    })

    it('adds and removes refs', async () => {
      await expect(update(storage, {
        ...record1,
        refs: {
          [$tag]: ['tag2', 'tag3', 'tag4'],
          another: ['another1', 'another2']
        }
      })).resolves.toBeUndefined()
      expect(updateInstructions).toEqual({
        ...baseInstructions,
        refs: {
          del: {
            [$tag]: ['tag0', 'tag1'],
            any: ['any0', 'any1']
          },
          add: {
            [$tag]: ['tag3', 'tag4'],
            another: ['another1', 'another2']
          }
        }
      })
    })
  })
})
