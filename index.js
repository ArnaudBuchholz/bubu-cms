'use strict'

require('colors')
require('dotenv').config()
require('./gpf-src')
require('./reserve-src')

'BUBU_CMS_UI5_DIST'.split(',').forEach(requiredEnv => {
  if (!process.env[requiredEnv]) {
    console.error(`Missing ${requiredEnv}`.red)
    process.exit(-1)
  }
})

const { createWriteStream, mkdir } = require('fs')
const { dirname, join } = require('path')
const { capture, log, serve } = require('reserve')

const mkdirAsync = require('util').promisify(mkdir)

const ui5version = /((?:open)ui5).*(\d+\.\d+\.\d+)$/.exec(process.env.BUBU_CMS_UI5_DIST)
const ui5cache = `./cache/${ui5version[1]}/${ui5version[2]}`

const configuration = {
  port: parseInt(process.env.BUBU_CMS_PORT, 10) || 3000,
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
    custom: require('./api/route')
  }, {
    match: /^\/api\/odata\/(.*)/,
    custom: require('./api/odata/route')
  }, {
    method: 'GET',
    match: /^\/$/,
    file: join(__dirname, 'webapp/index.html')
  }, {
    method: 'GET',
    match: /(.*)/,
    file: join(__dirname, 'webapp', '$1')
  }]
}

log(serve(configuration), process.argv.includes('--verbose'))
