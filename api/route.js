'use strict'

const mime = require('mime')
const nanoid = require('nanoid')
const databases = require('./databases')

const textContentType = mime.getType('text')
const xmlContentType = mime.getType('xml')

module.exports = async (request, response, relativeUrl) => {
  const memory = process.memoryUsage()
  'rss,heapTotal,heapUsed,external'
    .split(',')
    .forEach(type => response.setHeader(`x-memory-${type.toLowerCase()}`, memory[type]))

  if (relativeUrl === 'id') {
    response.writeHead(200, {
      'Content-Type': textContentType
    })
    response.end(nanoid())
    return
  }

  const databaseName = request.headers.db || process.env.BUBU_CMS_DB_NAME || 'sample'
  request.database = databases(databaseName)
  await request.database.open()

  const i18nMatch = /i18n(?:_(\w+))?\.properties/.exec(relativeUrl)
  if (i18nMatch) {
    const i18n = await request.database.getI18n(i18nMatch[1])
    if (i18n) {
      response.writeHead(200, {
        'Content-Type': textContentType
      })
      response.end(i18n)
      return
    }
    return 404
  }

  const fragmentMatch = /(\w+)\.fragment\.xml/.exec(relativeUrl)
  if (fragmentMatch) {
    const fragment = await request.database.getFragment(fragmentMatch[1])
    if (fragment) {
      response.writeHead(200, {
        'Content-Type': xmlContentType
      })
      response.end(fragment)
      return
    }
    return 404
  }
}
