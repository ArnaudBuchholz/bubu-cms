'use strict'

const { createWriteStream, mkdir } = require('fs')
const { dirname, join } = require('path')
const { capture } = require('reserve')

const mkdirAsync = require('util').promisify(mkdir)

module.exports = ({ ui5, port }) => {
  const ui5version = /((?:open)ui5).*(\d+\.\d+\.\d+)$/.exec(ui5)
  const ui5cache = `./cache/${ui5version[1]}/${ui5version[2]}`

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
      url: `${process.env.BUBU_CMS_UI5_DIST}/$1`
    }, {
      match: /^\/api\/(.*)/,
      custom: require('../api/route')
    }, {
      match: /^\/api\/odata\/(.*)/,
      custom: require('../api/odata/route')
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
