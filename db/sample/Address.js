'use strict'

const gpf = require('gpf-js')

module.exports = db => gpf.define({
  $class: 'Address',
  $extend: db.Record,

  constructor: function (raw) {
    this.$super(raw)
  }

})
