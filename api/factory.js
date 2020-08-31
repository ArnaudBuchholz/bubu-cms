'use strict'

const { createWriteStream, mkdir } = require('fs')
const mkdirAsync = require('util').promisify(mkdir)
const { dirname, join } = require('path')
const { capture } = require('reserve')
const Database = rquire('./Database')

module.exports = ({ ui5, port, db }) => {
  const ui5version = /((?:open)ui5).*(\d+\.\d+\.\d+)$/.exec(ui5)
  const ui5cache = join(__dirname, '../cache', ui5version[1], ui5version[2])
  const database = new Database()
  

  return {
    port,
    mappings: [{
      method: 'GET',
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
      method: 'GET',
      match: /\/((?:test-)?resources\/.*)/,
      url: `${ui5}/$1`
    }, {
      match: /^\/api\/(.*)/,

    }, {
      method: 'GET',
      match: /^\/$/,
      file: join(__dirname, '../webapp/index.html')
    }, {
      method: 'GET',
      match: /(.*)/,
      file: join(__dirname, '../webapp', '$1')
    }]
  }
}
