'use strict'

const mime = require('mime')
const nanoid = require('nanoid')
const databases = require('./databases')

const textContentType = mime.getType('text')

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

  /*
  router.get(/\/i18n(_\w+)?\.properties/, (req, res, next) => {
    res.sendFile(path.join(__dirname, '../db', config.db, req.url.substr(1)))
  })
*/

  const databaseName = request.headers.db || process.env.BUBU_CMS_DB_NAME || 'sample'
  request.database = databases(databaseName)
  await request.database.open()
}
