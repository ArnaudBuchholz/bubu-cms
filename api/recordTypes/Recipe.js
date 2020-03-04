'use strict'

const gpf = require('gpf-js')
const { getAbsolutePath } = require('./helpers')

module.exports = db => {
  class Recipe extends db.Record {
    async buildContent () {
      return super.buildContent({
      })
    }
  }

  Recipe.load = async function (folderName) {
    const gpfFileStorage = gpf.fs.getFileStorage()
    const forReading = gpf.fs.openFor.reading

    async function load (path, name) {
      // const recipe = new Recipe()
      // recipe._id = recipe._buildId(`${path}#${name}`)

      console.log('RECRD'.magenta, 'Recipe'.blue, '200'.green, `${path}/${name}`.gray)
    }

    async function scan (path) {
      const fileNames = await gpfFileStorage.explore(path)
      const recipes = {}
      const splitter = /^(.*)(\.\w+)?$/
      while (fileNames.moveNext()) {
        const fileName = fileNames.getCurrent()
        console.log(fileName)
        const parts = splitter.exec(fileName)
        const name = parts[0]
        const extension = parts[1]
        if (['.md', '.json'].includes(extension)) {
          if (!Object.prototype.hasOwnProperty.call(recipes, name)) {
            recipes[name] = {}
          }
          recipes[name][extension] = true
        }
      }
      return Promise.all(Object.keys(recipes).map(name => load(path, name, recipes[name])))
    }

    await scan(getAbsolutePath(db, folderName))
  }


  return Recipe
}
