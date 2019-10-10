'use strict'

const assert = require('assert')
const mockReserve = require('reserve/mock')

describe('/api/odata/route.js', () => {
  let mock

  before(() => mockReserve({
    match: /^\/api\/odata\/(.*)/,
    custom: require('../../../../api/odata/route')
  })
    .then(mockedReserve => {
      mock = mockedReserve
    })
  )

  it('lists records', () => mock.request('GET', '/api/odata/RecordSet?$top=10&$skip=0')
    .then(response => {
      assert(() => response.statusCode === 200)
    })
  )
})
