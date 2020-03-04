'use strict'

const path = require('path')

module.exports = {
  getAbsolutePath (db, fileName) {
    if (path.isAbsolute(fileName)) {
      return fileName
    }
    return path.join(db.path, fileName)
  },

  getRelativePath (db, fileName) {
    if (path.isAbsolute(fileName)) {
      return path.relative(db.path, fileName)
    }
    return fileName
  },

  async addAllKeys (db, i18nFileName) {
  }
}
