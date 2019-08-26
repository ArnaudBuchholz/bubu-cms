'use strict'

require('colors')
require('dotenv').config()

'BUBU_CMS_UI5_DIST'.split(',').forEach(requiredEnv => {
  if (!process.env[requiredEnv]) {
    console.error(`Missing ${requiredEnv}`.red)
    process.exit(-1)
  }
})

if (process.env.BUBU_CMS_GPF_SRC) {
  global.gpfSourcesPath = '../gpf-js/src/'
  require('../gpf-js/src/boot')
  console.log(`GPF-JS version ${global.gpf.version()}`.gray)
  require('mock-require')('gpf-js', global.gpf)
}

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
