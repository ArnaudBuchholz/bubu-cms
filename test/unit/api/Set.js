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
  const names = result.map(item => item.name)
  assert(names.length === expected.length)
  names.forEach((name, index) => assert(name === expected[index]))
}

describe('Set.js', () => {
  describe('Generic sort function', () => {
    it('sorts by name ascending by default', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query()
        .then(result => checkNames(result, 'abc'))
    })
    it('supports descending sorting', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', { field: 'name', ascending: false })
        .then(result => checkNames(result, 'cba'))
    })
    it('supports optional fields (with integers)', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', { field: 'optional', ascending: true })
        // empty value is always smaller
        .then(result => checkNames(result, 'acb'))
    })
    it('supports mixed types', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', { field: 'mixed', ascending: true })
        .then(result => checkNames(result, 'cab'))
    })
    it('supports date types', () => {
      var set = new Set()
      set.search = () => Promise.resolve(unsortedArray)
      return set.query('', { field: 'date', ascending: false })
        .then(result => checkNames(result, 'abc'))
    })
  })
})
