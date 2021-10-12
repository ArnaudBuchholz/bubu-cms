import { join } from 'path'
import { load } from '../../src/loader/index'
import { Loader } from '../../src/loader/Loader'

jest.mock('../../src/loader/readTextFile', () => {
  return {
    readTextFile: async function (path: string): Promise<string> {
      if (path === join('/', '.bubu-cms.json')) {
        return `{
  "serve": 3000,
  "storage": "memory",
  "types": [{
    "name": "record",
    "fields": [{
      "name": "string",
      "type": "string"
    }, {
      "name": "number",
      "type": "number"
    }, {
      "name": "date",
      "type": "date"
    }]
  }],
  "loaders": [{
    "$type": "$tag",
    "csv": "tags.csv"
  }, {
    "$type": "record",
    "csv": "records.csv"
  }]
}`
      }
      if (path === join('/', 'tags.csv')) {
        return `$name
tag 1
tag 2
`
      }
      if (path === join('/', 'records.csv')) {
        return `$name,string,number,date,$icon,$rating,$touched,$tags
record 1,abc,123,2021-10-03T21:56:00,test.ico,4,2021-10-08T23:15:00,tag 1|tag 2
record 2,def,456,2021-10-12T06:12:00,test.ico,4,2021-10-08T23:15:00,tag 1`
      }
      console.log(path)
      return ''
    }
  }
})

describe('loader', () => {
  let loader: Loader

  beforeAll(async () => {
    loader = await load('/')
  })

  it('loads the tags', async () => {
    await expect(loader.getTagId('tag 1')).resolves.not.toBe(null)
    await expect(loader.getTagId('tag 2')).resolves.not.toBe(null)
    await expect(loader.getTagId('tag 3')).resolves.toBe(null)
  })

  it('loads the records', async () => {
    const result = await loader.search({
      paging: {
        skip: 0,
        top: 10
      },
      refs: {},
      search: 'record'
    })
    expect(result.count).toBe(3)
  })
})
