'use strict'

const assert = require('assert')
const mockReserve = require('reserve/mock')

describe('/api/odata/route.js', () => {
  let mock

  before(() => mockReserve({
    mappings: [{
      match: /^\/api\/(.*)/,
      custom: require('../../../../api/route')
    }, {
      match: /^\/api\/odata\/(.*)/,
      custom: require('../../../../api/odata/route')
    }]
  })
    .then(mockedReserve => {
      mock = mockedReserve
    })
  )

  it('lists records', () => mock.request('GET', '/api/odata/RecordSet?$top=10&$skip=0')
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
    })
  )

  it('expand navigation properties', () => mock.request('GET', '/api/odata/RecordSet?$top=10&$skip=0&$expand=toContent')
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
    })
  )
})
