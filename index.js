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

const log = require('reserve/log')
const path = require('path')
const reserve = require('reserve/serve')

const configuration = {
  port: parseInt(process.env.BUBU_CMS_PORT, 10) || 3000,
  mappings: [{
    match: /\/resources\/(.*)/,
    url: `${process.env.BUBU_CMS_UI5_DIST}/resources/$1`
  }, {
    match: /\/test-resources\/(.*)/,
    url: `${process.env.BUBU_CMS_UI5_DIST}/test-resources/$1`
  }, {
    match: /^\/api\/(.*)/,
    custom: require('./api/route')
  }, {
    match: /^\/api\/odata\/(.*)/,
    custom: require('./api/odata/route')
  }, {
    match: /^\/$/,
    file: path.join(__dirname, 'webapp/index.html')
  }, {
    match: /(.*)/,
    file: path.join(__dirname, 'webapp', '$1')
  }]
}

log(reserve(configuration))
