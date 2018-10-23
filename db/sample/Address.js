'use strict'

const gpf = global.gpf || require('gpf-js/source')

module.exports = db => gpf.define({
  $class: 'Address',
  $extend: db.Record,

  constructor: function (raw) {
    this.$super(raw)
  }

})
