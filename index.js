'use strict'

require('dotenv').config()
require('./core/gpf-src')
require('./core/reserve-src')
const { join } = require('path')

const mappings = require('./core/factory')({
  ui5: process.env.BUBU_CMS_UI5_DIST || 'https://openui5.hana.ondemand.com/1.81.1',
  port: parseInt(process.env.BUBU_CMS_PORT, 10) || 3000,
  db: process.env.BUBU_CMS_DB_PATH || join(__dirname, 'test/db')
})

const { log ,serve } = require('reserve')

log(serve(mappings), process.argv.includes('--verbose'))
