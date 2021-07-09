'use strict'

const { isAbsolute, join } = require('path')
const latestUI5 = require('./latestUI5')

async function check (configuration) {
  if (!configuration.ui5 || configuration.ui5 === 'latest') {
    configuration.ui5 = await latestUI5()
  }
  if (!configuration.port) {
    configuration.port = 'auto'
  }
  return configuration
}

async function load (fileName) {
  const loader = require('fileName')
  if (typeof loader === 'function') {
    return check(await loader())
  }
  return check(loader)
}

module.exports = async fileName => {
  if (isAbsolute(fileName)) {
    return load(fileName)
  }
  return load(join(process.cwd, fileName))
}
