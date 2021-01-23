'use strict'

const assert = require('assert')
const compare = require('../../../api/compare')

const now = new Date()

describe('/core/api/compare.js', () => {
  [
    [undefined, undefined, 0],
    [null, null, 0],
    [true, true, 0],
    [false, false, 0],
    [1, 1, 0],
    [0, 0, 0],
    ['Hello', 'Hello', 0],
    ['', '', 0],
    [now, now, 0],
    [now, new Date(now.getTime()), 0],
    ['123', '4', -1],
    ['123', 4, -1],
    ['123', '120', 1],
    ['123', 120, 1],
    [now, new Date(now.getTime() + 100), -100],
    [now, new Date(now.getTime() - 100), 100],
    [1, 100, -99],
    [100, 1, 99]

  ].forEach(([value1, value2, expected]) => {
    it(`${JSON.stringify(value1)} <-> ${JSON.stringify(value2)} = ${expected}`, () => {
      assert.strictEqual(compare(value1, value2), expected)
    })
  })
})
