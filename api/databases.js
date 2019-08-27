'use strict'

const Database = require('./Database')

const databases = {}

module.exports = name => {
  if (!databases[name]) {
    databases[name] = new Database(name)
  }
  return databases[name]
}
