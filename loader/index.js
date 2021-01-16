'use strict'

const { isAbsolute, join } = require('path')

async function check (configuration) {

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
