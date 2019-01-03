'use strict'

const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const config = require('./config')
const api = require('./api/route')
const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/resources', express.static(path.join(__dirname, 'dist/resources')))
app.use(express.static(path.join(__dirname, 'webapp')))
app.use('/api', api)
app.use('/images', express.static(path.join(__dirname, `db/${config.db}/images`)))

app.disable('etag')

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(JSON.stringify(err))
})

module.exports = app
