'use strict'

require('url')

const mime = require('mime')
const metadata = require('./metadata')
require('./toJSON')

const jsonContentType = mime.getType('json')

async function getEntitySet (set, url, response) {
  response.writeHead(200, {
    'Content-Type': jsonContentType
  })
  var all = await set.all()
  response.end(JSON.stringify({
    d: {
      results: all.map(entity => entity.toJSON())
    }
  }))
}

async function getEntity (entity, url, response) {
  response.writeHead(200, {
    'Content-Type': jsonContentType
  })
  response.end(JSON.stringify({
    d: entity.toJSON()
  }))
}

function getSet (database, setName) {
  if (setName === 'Record') {
    return database.records
  }
  if (setName === 'Tag') {
    return database.tags
  }
}

module.exports = async (request, response, relativeUrl) => {
  if (relativeUrl.startsWith('$metadata')) {
    return metadata(request, response)
  }

  const url = new URL(relativeUrl, 'http://localhost/')
  if (request.method === 'GET') {
    const match = /(Record|Tag)Set(?:\('([^']+)'\))?/.exec(url.pathname)
    const set = getSet(request.database, match[1])
    if (match[2]) {
      return getEntity(await set.byId(match[2]), url, response)
    }
    return getEntitySet(set, url, response)
  }

  return 404
}
