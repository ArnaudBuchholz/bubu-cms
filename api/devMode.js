'use strict'

require('colors')
const fs = require('fs')
const mockRequire = require('mock-require')

// GPF-JS
global.gpfSourcesPath = '../gpf-js/src/'
require('../gpf-js/src/boot')
console.log(`GPF-JS version ${global.gpf.version()}`.gray)
mockRequire('gpf-js', global.gpf)

// REserve
const reserve = JSON.parse(fs.readFileSync('../reserve/package.json').toString())
console.log(`REserve version ${reserve.version}`.gray)
require('mock-require')(`reserve`, require(`../reserve`))

// REserve-ODATA
const reserveODATA = JSON.parse(fs.readFileSync('../reserve-odata/package.json').toString())
console.log(`REserve-ODATA version ${reserveODATA.version}`.gray)
require('mock-require')(`reserve-odata`, require(`../reserve-odata`))
