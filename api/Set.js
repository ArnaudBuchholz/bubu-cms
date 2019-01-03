'use strict'

class Set {

  function all () {
    return Promise.resolve([])
  }

  function byId (id) {
    return Promise.resolve()
  }

  function search (criteria) {
    return Promise.resolve([])
  }

  function sort (searchResult) {
    return searchResult
  }

  function query (search, sort) {
    return this._search(search).then(this._sort.bind(this))
  }

}

module.exports = Set
