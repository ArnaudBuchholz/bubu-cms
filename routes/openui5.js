'use strict'

const TYPE_THEME = 0
const TYPE_NAMESPACE = 1

const express = require('express')
const path = require('path')
const fs = require('fs')
const basePath = path.join(__dirname, '/../bower_components')

const trimURL = url => {
  const pos = url.indexOf('?')
  if (pos !== -1) {
    url = url.substr(0, pos)
  }
  if (url.endsWith('sap-ui-core-dbg.js')) {
    return url
  }
  if (url.endsWith('-dbg.js')) {
    return url.substr(0, url.length - 7) + '.js'
  }
  return url
}

module.exports = subFolder => {
  const router = express.Router()

  fs.readdirSync(basePath)
    .map(folder => folder.indexOf('themelib_') !== -1
      ? { type: TYPE_THEME, folder: folder, relativePath: folder.substr(17/* openui5-themelib_ */) }
      : { type: TYPE_NAMESPACE, folder: folder, relativePath: folder.substr(8/* openui5- */) }
    )
    .sort((a, b) => a.type - b.type)
    .forEach(item => [

      // TYPE_THEME (must be processed first)
      () => {
        router.get(`*/themes/${item.relativePath}*`, (req, res, next) => {
          res.sendFile(path.join(basePath, item.folder, subFolder, trimURL(req.url)))
        })
      },

      // TYPE_NAMESPACE
      () => {
        router.get(`/${item.relativePath.replace(/\./g, '/')}/*`, (req, res, next) => {
          res.sendFile(path.join(basePath, item.folder, subFolder, trimURL(req.url)))
        })
      }

    ][item.type]())

  // Default
  router.get('*', (req, res, next) => {
    res.sendFile(path.join(basePath, 'openui5-sap.ui.core', subFolder, trimURL(req.url)))
  })

  return router
}
