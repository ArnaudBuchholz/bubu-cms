import { MemoryStorage } from '../../src/storages/memory'
import { Loader } from '../../src/loader/Loader'
import { saveTypeDefinition } from '../../src/types/TypeDefinition'
import { loadFromCSV } from '../../src/loader/csv'
import { StoredRecordType, $type, StoredRecordId, StorableRecord } from '../../src/types/StoredRecord'
import { IStorage } from '../../src/types/IStorage'

jest.mock('../../src/loader/readTextFile', () => {
  return {
    readTextFile: async function (path: string): Promise<string> {
      if (path === '/full.csv') {
        return `$name,string,number,date,$icon,$rating,$touched
record 1,abc,123,2021-10-03T21:56:00,test.ico,4,2021-10-08T23:15:00`
      }
      if (path === '/wrong_column.csv') {
        return `$name,string1,number,date
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
      csv: '/full.csv'
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
    const record = results.records[0]
    expect(record).toMatchObject({
      name: 'record 1',
      icon: 'test.ico',
      rating: 4,
      touched: new Date('2021-10-08T23:15:00'),
      fields: {
        string: 'abc',
        number: 123,
        date: new Date('2021-10-03T21:56:00')
      }
    })
  })

  describe('error cases', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('fails on invalid type', async () => {
      await expect(loadFromCSV(loader, {
        $type: 'unknown',
        csv: '/full.csv'
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

    it('fails on invalid column', async () => {
      await expect(loadFromCSV(loader, {
        $type: 'record',
        csv: '/wrong_column.csv'
      })).rejects.toMatchObject({
        message: 'Unknown column for type \'record\''
      })
    })

    it('fails upon creation failure', async () => {
      const failingStorage: IStorage = Object.create(storage)
      failingStorage.create = async function (record: StorableRecord): Promise<StoredRecordId> {
        throw new Error('fail')
      }
      const failingLoader = new Loader(failingStorage)
      await expect(loadFromCSV(failingLoader, {
        $type: 'record',
        csv: '/full.csv'
      })).rejects.toMatchObject({
        message: 'Error while storing record'
      })
    })
  })

  afterAll(() => {
    mockLog.mockRestore()
    mockError.mockRestore()
  })
})
