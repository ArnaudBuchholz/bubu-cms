'use strict'

require('url')

const mime = require('mime')
const metadata = require('./metadata')
require('./toJSON')
const NavigationProperty = require('./NavigationProperty')

const jsonContentType = mime.getType('json')

async function toJSONEntities (entities, url) {
  // if (url.searchParams.has('$expand')) {
  //   const expandOn = url.searchParams.has('$expand').split(',')
  //   const expanded = []
  //   const navigationProperties = NavigationProperty.list(entities[0])
  //
  //   return entities
  //     .map((entity, index) => {...entity.toJSON(), ...expanded[index]})
  // }
  return entities.map(entity => entity.toJSON())
}

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
  let entities = await set.query(url.searchParams.get('search') || '', sortCriteria, sortAscending)
  if (url.searchParams.has('$skip')) {
    entities = entities.slice(parseInt(url.searchParams.get('$skip'), 10))
  }
  if (url.searchParams.has('$top')) {
    entities = entities.slice(0, parseInt(url.searchParams.get('$top'), 10))
  }
  response.end(JSON.stringify({
    d: {
      results: await toJSONEntities(entities, url)
    }
  }))
}

async function getEntity (entity, url, response) {
  response.writeHead(200, {
    'Content-Type': jsonContentType
  })
  response.end(JSON.stringify({
    d: (await toJSONEntities([entity], url))[0]
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
