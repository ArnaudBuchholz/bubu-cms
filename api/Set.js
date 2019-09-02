'use strict'

const compare = require('./compare')

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
    return Promise.reject(new Error('abstract'))
  }

  sort (items, field, ascending) {
    const sign = ascending ? 1 : -1
    return items.sort((item1, item2) => sign * compare(item1[field], item2[field]))
  }

  query (search = '', sort = 'name', ascending = true) {
    return this.search(search).then(items => this.sort(items, sort, ascending))
  }

  constructor (database) {
    this._database = database
  }
}

module.exports = Set
