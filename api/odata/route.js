'use strict'

const express = require('express')
const router = express.Router()
const metadata = require('./metadata')

// require('./entities').forEach(EntityClass => odata.route(router, EntityClass))
router.get(/\/\$metadata.*/, (req, res, next) => {
  res.set('Content-Type', 'application/xml')
  metadata().then(body => res.send(body))
})

module.exports = router
