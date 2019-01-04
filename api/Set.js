'use strict'

class Set {
  all () {
    return Promise.resolve([])
  }

  byId (id) {
    return Promise.resolve()
  }

  search (criteria) {
    return Promise.resolve([])
  }

  sort (searchResult, { field, ascending }) {
    return searchResult.sort((item1, item2) => {
      const value1 = item1[field] || ''
      const typeofValue1 = typeof value1
      const value2 = item2[field] || ''
      let sign
      if (ascending) {
        sign = 1
      } else {
        sign = -1
      }
      if (typeof value1 === typeof value2 && (typeofValue1 instanceof Date || typeofValue1 === 'number')) {
        return sign * (value1 - value2)
      }
      return sign * value1.toString().localeCompare(value2.toString())
    })
  }

  query (search = '', sort = { field: 'name', ascending: true }) {
    return this._search(search).then(searchResult => this._sort(searchResult, sort))
  }
}

module.exports = Set
