'use strict'

const gpf = require('gpf-js')
const openUI5cdn = process.env.OPENUI5_CDN || 'https://openui5.hana.ondemand.com'

module.exports = async () => {
  const neoAppUrl = openUI5cdn + '/neo-app.json'
  const neoAppResponse = gpf.http.get(neoAppUrl)
  if (neoAppResponse.statusCode !== 200) {
    throw new Error(`Unable to GET ${neoAppUrl}`)
  }
  const neoApp = JSON.parse(neoAppResponse.responseText)
  return openUI5cdn + neoApp.routes[0].path
}
