'use strict'

const config = require('../config')
const Record = require('./Record')

let opened

module.exports = {

  open: () => {
    if (!opened) {
      try {
        opened = require(`../db/${config.db}/init`)({
          Record: Record,
          loadRecords: array => Record.load(array)
        })
      } catch (e) {
        console.error(e)
      }
    }
    return opened
  }

}
