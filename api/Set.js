'use strict'

class Set {
  get database () {
    return this._database
  }

  all () {
    return Promise.resolve([])
  }

  byId (id) {
    return Promise.resolve()
  }

  async search (criteria) {
    return []
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
    return this.search(search).then(searchResult => this.sort(searchResult, sort))
  }

  constructor (database) {
    this._database = database
  }
}

module.exports = Set
