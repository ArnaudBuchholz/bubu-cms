'use strict'

require('colors')
require('dotenv').config()

if (process.env.BUBU_CMS_GPF_SRC) {
  global.gpfSourcesPath = '../gpf-js/src/'
  require('../gpf-js/src/boot')
  console.log(`GPF-JS version ${global.gpf.version()}`.gray)
  require('mock-require')('gpf-js', global.gpf)
}
