'use strict'

const gpf = require('gpf-js')
const { join } = require('path')

module.exports = {
  ui5: 'latest',
  port: 3000,
  types: {
    movie: {
      label: {
        type: "film", // { en: "movie", fr: "film" },
        status1: "Sortie",
        status2: "Longueur",
        "section.title": "IMDB",
        "section.OpenOnIMDB": "Ouvrir dans IMDB"
      },
      defaultIcon: "video",
      fragment: "movie.fragment.xml",
      async load ({ log, error, addI18nKey, addRecord }) {
        const gpfFileStorage = gpf.fs.getFileStorage()
        const forReading = gpf.fs.openFor.reading

        const imdbFile = await gpfFileStorage.openTextStream(join(__dirname, 'movies.csv.json'), forReading)
        const writableString = new gpf.stream.WritableString()
        await gpf.stream.pipe(imdbFile, writableString)
        const imdb = JSON.parse(writableString.toString())
    
        log('IMDB database loaded :')
        log('Mappings :', imdb.select.length)
        log('Movies :', Object.keys(imdb.movies).length)
        log('Actors :', Object.keys(imdb.actors).length)
        gpf.forEach(imdb.actors, (name, actorId) => addI18nKey(`tag.${actorId}`, name/*, language or all*/))

        let count = -1
        const csvFile = await gpfFileStorage.openTextStream(join(__dirname, 'movies.csv'), forReading)
        const lineAdapter = new gpf.stream.LineAdapter()
        const csvParser = new gpf.stream.csv.Parser()
        const factory = {
          async write (csvRecord) {
            ++count
            const imdbId = imdb.select[count]
            if (!imdbId) {
              error('Movie not found', csvRecord.title)
              return // SKIP
            }
            const imdbMovie = imdb.movies[imdbId]
            if (!imdbMovie) {
              error('Movie not found', csvRecord.title)
              return // SKIP
            }

            const record = {
              id: count,
              imdbId,
              name: csvRecord.title,
              number: `${csvRecord.book} / ${csvRecord.page}`,
              statusText1: imdbMovie.year,
            }

            // 'Format' duration
            const hours = Math.floor(imdbMovie.duration / 60)
            const mins = imdbMovie.duration - 60 * hours
            record.statusText2 = `${hours.toString()}:${mins.toString().padStart(2, '0')}`

            record.tags = imdbMovie.genres
            record.cast = Object.keys(imdbMovie.cast).map(actorId => {
              record.tags.push(actorId)
              return {
                id: tag.name,
                role: imdbMovie.cast[actorId]
              }
            })

            if(imdbMovie.image && imdbMovie.image.length) {
              record.image = imdbMovie.image[0]
              record.icon = imdbMovie.image[0].replace('.jpg', '._SX40_CR0,0,40,54_.jpg')
            }

            if (csvRecord.tags) {
              record.tags = record.tags.concat(csvRecord.tags.split(' '))
            }
            addRecord(record)
          }
        }
        await gpf.stream.pipe(csvFile, lineAdapter, csvParser, factory)
          .catch(reason => error(reason.toString()))
      },
      async content (record) {
        return {
          imdbId: record.imdbId,
          image: record.image ? this._image.replace('.jpg', '_SY1000_CR0,0,678,1000_.jpg') : '',
          cast: record.cast
        }
      }
    }
  }
}