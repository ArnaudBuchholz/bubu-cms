import { MemoryStorage } from '../../src/storages/memory'
import { Loader } from '../../src/loader/Loader'
import { saveTypeDefinition } from '../../src/types/TypeDefinition'
import { loadFromCSV } from '../../src/loader/csv'
import { StoredRecordType, $type } from '../../src/types/StoredRecord'

jest.mock('../../src/loader/readTextFile', () => {
  return {
    readTextFile: async function (path: string): Promise<string> {
      if (path === '/test.csv') {
        return `$name,string,number,date
record 1,abc,123,2021-10-03T21:56:00`
      }
      return ''
    }
  }
})

describe('csv/loader', () => {
  const storage = new MemoryStorage()
  const loader = new Loader(storage)
  let mockLog: jest.SpyInstance
  let mockError: jest.SpyInstance
  let recordTypeId: StoredRecordType

  beforeAll(async () => {
    mockLog = jest.spyOn(console, 'log').mockImplementation()
    mockError = jest.spyOn(console, 'error').mockImplementation()
    recordTypeId = await saveTypeDefinition(storage, {
      name: 'record',
      fields: [{
        name: 'string',
        type: 'string'
      }, {
        name: 'number',
        type: 'number'
      }, {
        name: 'date',
        type: 'date'
      }]
    })
    await loadFromCSV(loader, {
      $type: 'record',
      csv: '/test.csv'
    })
  })

  it('loads records from CSV file', async () => {
    const results = await storage.search({
      paging: { top: 100, skip: 0 },
      refs: {
        [$type]: [recordTypeId]
      }
    })
    expect(mockError).not.toBeCalled()
    expect(results.count).toBe(1)
  })

  describe('error cases', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('fails on invalid type', async () => {
      await expect(loadFromCSV(loader, {
        $type: 'unknown',
        csv: '/test.csv'
      })).rejects.toMatchObject({
        message: 'Unknown type \'unknown\''
      })
    })

    it('fails on empty file', async () => {
      await expect(loadFromCSV(loader, {
        $type: 'record',
        csv: '/empty.csv'
      })).rejects.toMatchObject({
        message: 'Empty file'
      })
    })
  })

  afterAll(() => {
    mockLog.mockRestore()
    mockError.mockRestore()
  })
})
