'use strict'

const gpf = require('gpf-js')
const path = require('path')

module.exports = db => {
  class Movie extends db.Record {
  }

  Object.assign(Movie.prototype, {

    _icon: 'sap-icon://video'

  })

  Movie.load = async function (fileName) {
    const gpfFileStorage = gpf.fs.getFileStorage()
    const forReading = gpf.fs.openFor.reading

    // Read IMDB database
    const imdbFile = await gpfFileStorage.openTextStream(path.join(__dirname, `${fileName}.imdb.json`), forReading)
    const writableString = new gpf.stream.WritableString()
    await gpf.stream.pipe(imdbFile, writableString)
    const imdb = JSON.parse(writableString.toString())

    // Read movies
    let count = 0
    const csvFile = await gpfFileStorage.openTextStream(path.join(__dirname, `${fileName}.csv`), forReading)
    const lineAdapter = new gpf.stream.LineAdapter()
    const csvParser = new gpf.stream.csv.Parser()
    const factory = {
      write: async function (csvRecord) {
        const imdbId = imdb.select[count]
        if (!imdbId) {
          // console.log('record', '400', csvRecord.title)
          return // SKIP
        }
        const imdbMovie = imdb.movies[imdbId]
        if (!imdbMovie) {
          // console.log('record', '404', csvRecord.title)
          return // SKIP
        }
        const movie = new Movie(csvRecord)
        movie._id = movie._buildId(`${fileName}#${count++}`)
        movie._name = csvRecord.title
        movie._number = `${csvRecord.book} / ${csvRecord.page}`
        movie._statusText1 = imdbMovie.year
        imdbMovie.genres.forEach(genre => movie.addTag(genre))
        movie._statusText2 = movie.tags[1].name // First genre
        Object.keys(imdbMovie.cast).forEach(actorId => {
          movie.addTag(actorId)
        })
        movie._cast = imdbMovie.cast
        // console.log('record', '200', movie.name)
      }
    }
    await gpf.stream.pipe(csvFile, lineAdapter, csvParser, factory)
  }

  return Movie
}
