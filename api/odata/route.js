'use strict'

require('url')

const mime = require('mime')
const entities = require('./entities')
const metadata = require('./metadata')
const databases = require('../databases')

const jsonContentType = mime.getType('json')

async function getEntitySet (set, url, response) {
  response.writeHead(200, {
    'Content-Type': jsonContentType
  })
  response.end(JSON.stringify({
    d: []
  }))
}

module.exports = async (request, response, relativeUrl) => {
  if (relativeUrl.startsWith('$metadata')) {
    return metadata(request, response)
  }
  const databaseName = request.headers.db || process.env.BUBU_CMS_DB_NAME || 'sample'
  const database = databases(databaseName)
  await database.open()

  const url = new URL(relativeUrl, 'http://localhost/')
  if (request.method ==='GET') {
    if (url.pathname === '/RecordSet') {
      return getEntitySet(database.records, url, response)
    }
    if (url.pathname === '/TagSet') {
      return getEntitySet(database.tags, url, response)
    }
  }

  return 404
}
