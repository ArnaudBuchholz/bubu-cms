'use strict'

require('colors')
require('dotenv').config()
const fs = require('fs')

if (process.env.BUBU_CMS_RESERVE_SRC) {
  const reserve = JSON.parse(fs.readFileSync('../reserve/package.json').toString())
  console.log(`REserve version ${reserve.version}`.gray)
  'configuration,log,mock,serve'
    .split(',')
    .forEach(api => require('mock-require')(`reserve/${api}`, require(`../reserve/${api}`)))
}
