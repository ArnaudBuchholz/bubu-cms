import { MemoryStorage } from '../../src/storages/memory'
import { Loader } from '../../src/loader/Loader'
import { saveTypeDefinition } from '../../src/types/TypeDefinition'
import { loadFromCSV } from '../../src/loader/csv'
import { StoredRecordType, StoredRecordId, StorableRecord, STOREDRECORDTYPE_TAG, STOREDRECORDTYPE_TYPE } from '../../src/types/StoredRecord'
import { IStorage } from '../../src/types/IStorage'
import { Configuration } from '../../src/loader/types'

jest.mock('../../src/loader/readTextFile', () => {
  return {
    readTextFile: async function (path: string): Promise<string> {
      if (path === '/full.csv') {
        return `$name,string,number,date,$icon,$rating,$touched,$tags
record 1,abc,123,2021-10-03T21:56:00,test.ico,4,2021-10-08T23:15:00,tag 1|tag 2`
      }
      if (path === '/full_sep.csv') {
        return `$name;string;number;date;$icon;$rating;$touched;$tags
record 2;def;456;2021-12-03T05:46:00;test.ico;4;2021-10-08T23:15:00;tag 1,tag 2`
      }
      if (path === '/wrong_column.csv') {
        return `$name,string1,number,date
record 1,abc,123,2021-10-03T21:56:00`
      }
      if (path === '/unknown_tag.csv') {
        return `$name,string,number,date,$tags
record 1,abc,123,2021-10-03T21:56:00,tag 3`
      }
      return ''
    }
  }
})

const fakeConfiguration: Configuration = {
  storage: 'memory',
  types: [],
  loaders: []
}

describe('loader/csv', () => {
  const storage = new MemoryStorage()
  const loader = new Loader(fakeConfiguration, storage)
  let mockLog: jest.SpyInstance
  let mockError: jest.SpyInstance
  let recordTypeId: StoredRecordType
  const tags: string[] = ['tag 1', 'tag 2']
  const tagIds: StoredRecordId[] = []

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
    for await (const tag of tags) {
      tagIds.push(await storage.create({
        type: STOREDRECORDTYPE_TAG,
        name: tag,
        fields: {},
        refs: {}
      }))
    }
    await loadFromCSV(loader, {
      $type: 'record',
      csv: '/full.csv'
    })
  })

  it('has access to tag Ids', async () => {
    await expect(loader.getTagId('tag 1')).resolves.toBe(tagIds[0])
    await expect(loader.getTagId('tag 2')).resolves.toBe(tagIds[1])
    await expect(loader.getTagId('tag 3')).resolves.toBe(null)
  })

  it('loads records from CSV file', async () => {
    const results = await storage.search({
      paging: { top: 100, skip: 0 },
      refs: {
        [STOREDRECORDTYPE_TYPE]: [recordTypeId]
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
    expect(record.refs[STOREDRECORDTYPE_TAG].length).toBe(2)
    expect(record.refs[STOREDRECORDTYPE_TAG].includes(tagIds[0])).toBe(true)
    expect(record.refs[STOREDRECORDTYPE_TAG].includes(tagIds[1])).toBe(true)
  })

  it('supports different separators', async () => {
    await loadFromCSV(loader, {
      $type: 'record',
      csv: '/full_sep.csv',
      separator: ';',
      tagSeparator: ','
    })
    const results = await storage.search({
      paging: { top: 100, skip: 0 },
      refs: {
        [STOREDRECORDTYPE_TYPE]: [recordTypeId]
      }
    })
    expect(results.count).toBe(2)
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

    it('fails on invalid tag', async () => {
      await expect(loadFromCSV(loader, {
        $type: 'record',
        csv: '/unknown_tag.csv'
      })).rejects.toMatchObject({
        message: 'Unknown tag \'tag 3\''
      })
    })

    it('fails upon creation failure', async () => {
      const failingStorage: IStorage = Object.create(storage)
      failingStorage.create = async function (record: StorableRecord): Promise<StoredRecordId> {
        throw new Error('fail')
      }
      const failingLoader = new Loader(fakeConfiguration, failingStorage)
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
