'use strict'

const assert = require('assert')
const Set = require('../../../api/Set')

const unsortedArray = [{
  name: 'c',
  optional: 1,
  mixed: '1',
  date: new Date(2018, 11, 31)
}, {
  name: 'a',
  mixed: 2,
  date: new Date(2019, 6, 24)
}, {
  name: 'b',
  optional: 2,
  mixed: '3',
  date: new Date(2019, 0, 3)
}]

const checkNames = (result, expected) => {
  assert.strictEqual(result.map(item => item.name).join(''), expected)
}

describe('/api/Set.js', () => {
  describe('Generic sort function', () => {
    it('sorts by name ascending by default', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query()
        .then(result => checkNames(result, 'abc'))
    })
    it('supports descending sort', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', 'name', false)
        .then(result => checkNames(result, 'cba'))
    })
    it('supports optional fields (with integers)', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', 'optional', true)
        // empty value is always smaller
        .then(result => checkNames(result, 'acb'))
    })
    it('supports mixed types', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', 'mixed', true)
        .then(result => checkNames(result, 'cab'))
    })
    it('supports date types', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', 'date', false)
        .then(result => checkNames(result, 'abc'))
    })
  })
})
