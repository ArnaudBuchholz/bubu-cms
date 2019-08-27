'use strict'

require('url')

const entities = require('./entities')
const metadata = require('./metadata')
const databases = require('../databases')

const sets = {}

entities.forEach(entity => {
  const Set = entity.Set
  if (Set) {
    sets[entity.name] = Set
  }
})

module.exports = async (request, response, relativeUrl) => {
  if (relativeUrl.startsWith('$metadata')) {
    return metadata(request, response)
  }
  const databaseName = request.headers.db || process.env.BUBU_CMS_DB_NAME || 'sample'
  const database = databases(databaseName)
  await database.open()

  const url = new URL(relativeUrl, 'http://localhost/')
  console.log(request.method, url)

  return 404
}
