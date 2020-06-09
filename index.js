'use strict'

require('colors')
require('dotenv').config()
require('./core/gpf-src')
require('./core/reserve-src')

'BUBU_CMS_UI5_DIST'.split(',').forEach(requiredEnv => {
  if (!process.env[requiredEnv]) {
    console.error(`Missing ${requiredEnv}`.red)
    process.exit(-1)
  }
})

const configuration = require('./core/configuration')({
  ui5: process.env.BUBU_CMS_UI5_DIST,
  port: parseInt(process.env.BUBU_CMS_PORT, 10) || 3000
})

const { log ,serve } = require('reserve')

log(serve(configuration), process.argv.includes('--verbose'))
