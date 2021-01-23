'use strict'

const { log, serve } = require('reserve')
const loader = require('./loader')
const mappingsBuilder = require('./api/mappings')

const fileName = process.argv.filter(arg => !arg.startsWith('--'))[0] || 'index.js'
loader(fileName)
  .then(settings => mappingsBuilder(settings))
  .then(mappings => {
    log(serve(mappings), process.argv.includes('--verbose'))
  })
