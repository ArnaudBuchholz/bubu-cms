'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const NavigationProperty = require('./NavigationProperty')

const Record = require('../Record')
const Content = require('../Content')

attribute(new NavigationProperty(Content, 1).on({ id: 'recordId' }))(Record, 'buildContent')

module.exports = [
  require('../Tag'),
  Record,
  Content
]
