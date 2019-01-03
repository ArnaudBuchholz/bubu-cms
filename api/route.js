'use strict'

const express = require('express')
const path = require('path')
const router = express.Router()
const nanoid = require('nanoid')
const config = require('../config')
// const odata = require('./odata/route')
const db = require('./db')

router.get('/id', (req, res, next) => {
  res.set('Content-Type', 'text/plain')
  res.send(nanoid())
})

router.get(/\/i18n(_\w+)?\.properties/, (req, res, next) => {
  res.sendFile(path.join(__dirname, '../db', config.db, req.url.substr(1)))
})

router.all('*', (req, res, next) => {
  // Performance values
  const memory = process.memoryUsage()
  'rss,heapTotal,heapUsed,external'
    .split(',')
    .forEach(type => res.set(`x-memory-${type.toLowerCase()}`, memory[type]))
  // database selector
  const urlDb = /(?:\?|&)db=([^&]+)(?:$|&)/.exec(req.url)[1]
  req.db = db(urlDb || config.defaultDB)
  next() // pass control to the next handler
})

// router.use('/odata', odata)

// Default
router.get('*', (req, res, next) => {
  var error = new Error('Not implemented')
  error.status = 500
  next(error)
})

module.exports = router
