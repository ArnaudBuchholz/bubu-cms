import { MemoryStorage } from '../../src/storages/memory'
import { Loader } from '../../src/loader/Loader'
import { readTextFile } from '../../src/loader/__mocks__/readTextFile'
import { saveTypeDefinition } from '../../src/types/TypeDefinition'
import { loadFromCSV } from '../../src/loader/csv'
import { StoredRecordType, $type } from '../../src/types/StoredRecord'

describe('csv/loader', () => {
  const storage = new MemoryStorage()
  const loader = new Loader(storage)
  let mockLog: jest.SpyInstance
  let recordTypeId: StoredRecordType

  beforeAll(async () => {
    mockLog = jest.spyOn(console, 'log').mockImplementation()
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
    readTextFile.set('/test.csv', `$name,string,number,date
record 1,abc,123,2021-10-03T21:56:00`)
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
    expect(results.count).toBe(1)
  })

  afterAll(() => {
    mockLog.mockRestore()
  })
})
