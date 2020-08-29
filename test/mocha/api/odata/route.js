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

  const recordSet = '/api/odata/RecordSet'

  it('lists records', () => mock.request('GET', recordSet + '?$top=10&$skip=0', {
    db: 'sample'
  })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
    })
  )

  it('expand navigation properties', () => mock.request('GET', recordSet + '?$top=10&$skip=0&$expand=toContent', {
    db: 'sample'
  })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
    })
  )
})
