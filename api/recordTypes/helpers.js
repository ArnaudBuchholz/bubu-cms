'use strict'

const path = require('path')

module.exports = {
  getAbsolutePath (db, fileName) {
    if (path.isAbsolute(fileName)) {
      return fileName
    }
    return path.join(db.path, fileName)
  },

  async addAllKeys (db, i18nFileName) {
  }
}
