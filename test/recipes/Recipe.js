/* eslint-disable */
'use strict'

const gpf = require('gpf-js')
const { getAbsolutePath, getRelativePath } = require('../../api/recordTypes/helpers')

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

    async function load (path, name, { md, json, img }) {
      const relativePath = getRelativePath(db, path)
      const baseId = `${relativePath}#${name}`
      let info
      if (json) {
        info = JSON.parse(await gpf.read(json.filePath))
      } else {
        info = { name }
      }
      info.md = getRelativePath(db, md.filePath)
      const recipe = new Recipe()
      recipe._id = recipe._buildId(baseId)
      recipe._name = info.name
      if (info.calories && info.portions) {
        recipe._number = Math.floor(info.calories / info.portions)
      }
      if (img) {
        recipe._icon = getRelativePath(db, img.filePath)
      }
      recipe._icon = `/images/recipe/${raw.id}.jpg`
      if (info.portions) {
        recipe._statusText1 = portions.toString()
      }
      if (info.time) {
        recipe._statusText2 = Object.keys(info.time).reduce((total, time) => total + time, 0) + 'm'
      }
      console.log('RECRD'.magenta, 'Recipe'.blue, '200'.green, baseId.gray)
    }

    async function buildFileNamesMap (fileNames) {
      const map = {}
      const splitter = /^(.*)\.(\w+)?$/
      while (await fileNames.moveNext()) {
        const file = fileNames.getCurrent()
        const fileName = file.fileName
        const { _, name, extension } = splitter.exec(fileName)
        map[file.fileName] = Object.extend({}, file, {
          name,
          extension
        })
      }
      return map
    }

    async function scan (path) {
      const fileNames = await gpfFileStorage.explore(path)
      const recipes = {}
      const subs = []
      // Either multiples  md + json? + jpg|jpeg|png
      // or single txt named like the folder name (+ time stamp) with Links &Aattachments
      while (await fileNames.moveNext()) {
        const file = fileNames.getCurrent()
        if (file.type === gpf.fs.types.directory) {
          subs.push(scan(file.filePath))
        } else if (file.type === gpf.fs.types.file) {
          const parts = []
          const name = parts[1]
          let extension = parts[2]
          if (['jpg', 'jpeg', 'png'].includes(extension)) {
            extension = 'img'
          }
          if (['md', 'json', 'img'].includes(extension)) {
            if (!Object.prototype.hasOwnProperty.call(recipes, name)) {
              recipes[name] = {}
            }
            recipes[name][extension] = file
          }
        }
      }
      return Promise.all(subs.concat(Object.keys(recipes).map(name => load(path, name, recipes[name]))))
    }

    await scan(getAbsolutePath(db, folderName))
  }

  return Recipe
}
