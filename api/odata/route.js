'use strict'

require('url')

const mime = require('mime')
const entities = require('./entities')
const metadata = require('./metadata')

const jsonContentType = mime.getType('json')

async function getEntitySet (set, url, response) {
  response.writeHead(200, {
    'Content-Type': jsonContentType
  })
  var all = await set.all()
  response.end(JSON.stringify({
    d: []
  }))
}

module.exports = async (request, response, relativeUrl) => {
  if (relativeUrl.startsWith('$metadata')) {
    return metadata(request, response)
  }

  const url = new URL(relativeUrl, 'http://localhost/')
  if (request.method ==='GET') {
    if (url.pathname === '/RecordSet') {
      return getEntitySet(request.database.records, url, response)
    }
    if (url.pathname === '/TagSet') {
      return getEntitySet(request.database.tags, url, response)
    }
  }

  return 404
}
