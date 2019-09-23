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
  let sortCriteria
  let sortAscending
  if (url.searchParams.has('$orderby')) {
    const orderBy = url.searchParams.get('$orderby').split(' ')
    sortCriteria = orderBy[0]
    sortAscending = orderBy[1] === 'asc'
  }
  let results = await set.query(url.searchParams.get('search') || '', sortCriteria, sortAscending)
  if (url.searchParams.has('$skip')) {
    results = results.slice(parseInt(url.searchParams.get('$skip'), 10))
  }
  if (url.searchParams.has('$top')) {
    results = results.slice(0, parseInt(url.searchParams.get('$top'), 10))
  }
  response.end(JSON.stringify({
    d: {
      results: results.map(entity => entity.toJSON())
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

function getDatabaseSet (database, setName) {
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
    const set = getDatabaseSet(request.database, match[1])
    if (match[2]) {
      return getEntity(await set.byId(match[2]), url, response)
    }
    return getEntitySet(set, url, response)
  }

  return 404
}
