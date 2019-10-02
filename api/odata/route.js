'use strict'

require('url')
const gpf = require('gpf-js')
const mime = require('mime')
const metadata = require('./metadata')
require('./toJSON')
const NavigationProperty = require('./NavigationProperty')

const jsonContentType = mime.getType('json')

async function getEntitiesAsJSON (entities, url) {
  const jsonEntities = entities.map(entity => entity.toJSON())
  if (url.searchParams.has('$expand')) {
    const expandOn = url.searchParams.get('$expand').split(',')
    const navigationProperties = NavigationProperty.list(entities[0])
      .filter(navigationProperty => expandOn.includes(navigationProperty.name))
    await gpf.forEachAsync(navigationProperties, navigationProperty => {
      return gpf.forEachAsync(entities, async (entity, index) => {
        jsonEntities[index][navigationProperty.name] =
          (await entity[navigationProperty.getMemberName()]()).toJSON()
      })
    })
  }
  return jsonEntities
}

const methods = {

  GET_set: async (url, set, response) => {
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
        results: await getEntitiesAsJSON(entities, url)
      }
    }))
  },

  GET_entity: async (url, entity, response) => {
    response.writeHead(200, {
      'Content-Type': jsonContentType
    })
    response.end(JSON.stringify({
      d: (await getEntitiesAsJSON([entity], url))[0]
    }))
  }

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
  const match = /(Record|Tag)Set(?:\('([^']+)'\))?/.exec(url.pathname)
  if (!match) {
    return 404
  }
  const set = getDatabaseSet(request.database, match[1])
  if (match[2]) {
    const entity = await set.byId(match[2])
    if (!entity) {
      return 404
    }
    return methods[`${request.method}_entity`](url, entity, response)
  }
  return methods[`${request.method}_set`](url, set, response)
}
