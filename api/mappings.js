'use strict'

const { createWriteStream, mkdir } = require('fs')
const mkdirAsync = require('util').promisify(mkdir)
const { basename, dirname, join } = require('path')
const { capture } = require('reserve')
const mime = require('mime')
const RecordType = require('./RecordType')
const Record = require('./Record')
const Content = require('./Content')
const Tag = require('./Tag')

const textContentType = mime.getType('text')
const xmlContentType = mime.getType('xml')

module.exports = ({ ui5, port, db }) => {
  const ui5version = /((?:open)ui5).*(\d+\.\d+\.\d+)$/.exec(ui5)
  const ui5cache = join(__dirname, '../cache', ui5version[1], ui5version[2])
  const fragments = (db.fragments || []).map(fragment => {
    return {
      match: new RegExp(basename(fragment).replace(/\./g, '\\.')),
      file: fragment
    }
  })
  return {
    port,
    handlers: [{
      odata: "reserve-odata"
    }],
    mappings: [{
      match: /\/((?:test-)?resources\/.*)/,
      file: `${ui5cache}/$1`,
      'ignore-if-not-found': true
    }, {
      method: 'GET',
      match: /\/((?:test-)?resources\/.*)/,
      custom: async (request, response, path) => {
        const cachePath = join(ui5cache, path)
        const cacheFolder = dirname(cachePath)
        await mkdirAsync(cacheFolder, { recursive: true })
        const file = createWriteStream(cachePath)
        capture(response, file)
        .catch(reason => {
          console.error(`Unable to cache ${cachePath}`, reason)
        })
      }
    }, {
      method: ['GET', 'HEAD'],
      match: /\/((?:test-)?resources\/.*)/,
      url: `${ui5}/$1`
    }, {
      custom: async (request, response) => {
        request.db = db
        const memory = process.memoryUsage()
        'rss,heapTotal,heapUsed,external'
          .split(',')
          .forEach(type => response.setHeader(`x-memory-${type.toLowerCase()}`, memory[type]))
      }
    }, {
      match: /^\/api\/odata\/(.*)/,
      odata: '$1',
      'service-namespace': 'bubu-cms',
      'use-sap-extension': true,
      'data-provider-classes': () => [RecordType, Record, Content, Tag]
    }, {
      match: /^\/$/,
      file: join(__dirname, '../webapp/index.html')
    }, {
      match: /db_i18n(?:_(\w+))?\.properties/,
      custom: async (request, response, lang) => {
        const { db } = request
        const i18n = db.getI18n(lang)
        if (i18n) {
          response.writeHead(200, {
            'Content-Type': textContentType,
            'Content-Length': i18n.length
          })
          response.end(i18n)
        } else {
          return 404
        }
      }
    }, ...fragments, {
      match: /(.*)/,
      file: join(__dirname, '../webapp', '$1')
    }]
  }
}
