'use strict'

require('url')

const entities = require('./entities')
const metadata = require('./metadata')

const sets = {}

entities.forEach(entity => {
  const Set = entity.Set
  if (Set) {
    sets[set.name] = Set
  }
})

module.exports = (request, response, relativeUrl) => {
  if (relativeUrl.startsWith('$metadata')) {
    return metadata(request, response)
  }

  const url = new URL(relativeUrl, 'http://localhost/')
  console.log(request.method, url)

  return 404
}
