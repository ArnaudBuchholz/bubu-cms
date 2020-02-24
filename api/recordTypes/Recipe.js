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

    // Read movies
    let count = -1
    const csvFile = await gpfFileStorage.openTextStream(getAbsolutePath(db, csvFileName), forReading)
    const lineAdapter = new gpf.stream.LineAdapter()
    const csvParser = new gpf.stream.csv.Parser()
    const factory = {
      write: async function (csvRecord) {
        ++count
        const imdbId = imdb.select[count]
        if (!imdbId) {
          console.log('RECRD'.magenta, 'Movie'.blue, '400'.red, csvRecord.title.gray)
          return // SKIP
        }
        const imdbMovie = imdb.movies[imdbId]
        if (!imdbMovie) {
          console.log('RECRD'.magenta, 'Movie'.blue, '404'.red, csvRecord.title.gray)
          return // SKIP
        }
        const movie = new Movie()
        movie._id = movie._buildId(`${csvFileName}#${count}`)
        movie._imdbId = imdbId
        movie._name = csvRecord.title
        movie._number = `${csvRecord.book} / ${csvRecord.page}`
        movie._statusText1 = imdbMovie.year
        // 'Format' duration
        const hours = Math.floor(imdbMovie.duration / 60)
        const mins = imdbMovie.duration - 60 * hours
        movie._statusText2 = `${hours.toString()}:${mins.toString().padStart(2, '0')}`
        imdbMovie.genres.forEach(genre => movie.addTag(genre))
        movie._cast = []
        Object.keys(imdbMovie.cast).forEach(actorId => {
          const tag = movie.addTag(actorId)
          movie._cast.push({
            id: tag.name,
            role: imdbMovie.cast[actorId]
          })
        })
        if (imdbMovie.image && imdbMovie.image.length) {
          movie._image = imdbMovie.image[0]
          movie._icon = imdbMovie.image[0].replace('.jpg', '._SX40_CR0,0,40,54_.jpg')
        }
        if (csvRecord.tags) {
          csvRecord.tags.split(' ').forEach(tag => {
            movie.addTag(tag)
          })
        }
        console.log('RECRD'.magenta, 'Movie'.blue, '200'.green, movie.name.gray)
      }
    }
    await gpf.stream.pipe(csvFile, lineAdapter, csvParser, factory)
      .catch(reason => {
        console.log('RECRD'.magenta, 'Movie'.blue, '500'.red, reason.toString())
      })
  }

  return Movie
}
