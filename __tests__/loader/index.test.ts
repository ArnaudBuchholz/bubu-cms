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
      if (path === join('/invalid', '.bubu-cms.json')) {
        return '{}'
      }
      if (path === join('/unknown_storage', '.bubu-cms.json')) {
        return `{
  "serve": 3000,
  "storage": "unknown",
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
      if (path === join('/custom_loader', '.bubu-cms.json')) {
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
    "csv": "${join('/', 'tags.csv').replace(/\\/g, '\\\\')}"
  }, {
    "$type": "record",
    "csv": "../records.csv"
  }, {
    "custom": "${join(__dirname, 'check_loader.js').replace(/\\/g, '\\\\')}"
  }]
}`
      }
      if (path === join('/invalid_loader', '.bubu-cms.json')) {
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
    "csv": "../tags.csv"
  }, {
    "$type": "record",
    "csv": "../records.csv"
  }, {
    "custom": "${join(__dirname, 'invalid_loader.js').replace(/\\/g, '\\\\')}"
  }]
}`
      }
      console.error('unknown file path', path)
      return ''
    }
  }
})

describe('loader', () => {
  let logMock: jest.SpyInstance

  beforeAll(() => {
    logMock = jest.spyOn(console, 'log').mockImplementation()
  })

  describe('happy path', () => {
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

  describe('custom loader', () => {
    it('supports custom loader', async () => {
      await load('/custom_loader')
    })
  })

  describe('validation', () => {
    it('validates the configuration', async () => {
      await expect(load('/invalid')).rejects.toMatchObject({
        message: 'Invalid configuration'
      })
    })

    it('validates the loader', async () => {
      await expect(load('/invalid_loader')).rejects.toMatchObject({
        message: 'Custom loader not exposing a function'
      })
    })

    // it('validates the storage', async () => {
    //   await expect(load('/unknown_storage')).rejects.toMatchObject({
    //     message: 'Unknown or invalid storage'
    //   })
    // })
  })

  afterAll(() => {
    logMock.mockRestore()
  })
})
