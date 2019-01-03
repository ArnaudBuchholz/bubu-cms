'use strict'

const Set = require('./Set')

const records = []
const recordsById = {}

class RecordSet extends Set {

  function add (record) {
    records.push(record)
    recordsById[record.id] = record
  }

  function all () {
    return Promise.resolve(records)
  }

  function byId (id) {
    return Promise.resolve(recordsById[id])
  }

  function query (sort, search) {
    return Promise.resolve([]) // TO IMPLEMENT
  }

}

module.exports = new RecordSet()
