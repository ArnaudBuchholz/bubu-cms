'use strict'

module.exports = [{
  match: /^\/api\/odata\/\$metadata.*/,
  custom: require('./metadata')
}]
