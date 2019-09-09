'use strict'

require('colors')
require('../../gpf-src')
const gpf = require('gpf-js/debug')
const path = require('path')

const titles = []
const imdbTitleBasicsTSV = path.join(__dirname, 'tmp/title.basics.tsv')
let imdbTitleBasicsTSVsize

gpf.fs.getFileStorage()
  .getInfo(imdbTitleBasicsTSV)
  .then(fileInfo => {
    if (fileInfo.type === gpf.fs.types.notFound) {
      console.error(`Please proceed to https://www.imdb.com/interfaces/ and download the title.basics
Then unzip it inside tmp/title.basics.tsv`.red)
      process.exit(-1)
    }
    imdbTitleBasicsTSVsize = fileInfo.size
  })
  .then(() => gpf.fs.getFileStorage().openTextStream(imdbTitleBasicsTSV, gpf.fs.openFor.reading))
  .then(csvFile => {
    console.log(`Loading IMDB titles...`.magenta)
    process.stdout.write('\x1B7')
    let bytes = 0
    let count = 0
    let start = new Date()
    const genres = []
    return gpf.stream.pipe(csvFile, new gpf.stream.Filter(data => {
        bytes += data.length
        return true
    }), new gpf.stream.LineAdapter(), new gpf.stream.Filter(line => {
        if (line.includes('|')) {
          console.log(line)
        }
        return true
    }), new gpf.stream.csv.Parser({ quote: '|' }), {
      write: async title => {
        ++count
        if (title.titleType === 'movie' && title.isAdult === '0' && parseInt(title.startYear, 10) > 1960) {
          title.genres = title.genres.split(',').map(genre => {
            const index = genres.indexOf(genre)
            if (index === -1) {
              genres.push(genre)
              return genre
            }
            return genres[index]
          })
          titles.push(title)
        }
        const ratio = bytes / imdbTitleBasicsTSVsize
        const timeSpent = new Date() - start
        const estimatedTotal = Math.floor(count / ratio / 1000)
        const estimatedTotalTime = Math.floor(((timeSpent / ratio) - timeSpent) / 6000) / 10
        const memory = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024)
        process.stdout.write('\x1B7')
        process.stdout.write(`${Math.floor(100 * ratio)} % read, ${count} titles, ${titles.length} kept, memory ${memory}Mb; estimated ${estimatedTotal}K records, completion ${estimatedTotalTime}mins    `.gray)
        process.stdout.write('\x1B8')
        if (titles.length === 32546) {
            debugger
        }
      }
    })
  })
  .then(() => console.log(`Loaded ${titles.length}) titles.`.green))
  .then(() => gpf.fs.getFileStorage().openTextStream(path.join(__dirname, 'raw_movies.csv'), gpf.fs.openFor.reading))
  .then(csvFile => gpf.stream.pipe(csvFile, new gpf.stream.LineAdapter(), new gpf.stream.csv.Parser(),
    new gpf.stream. Filter(raw => !!raw.title), {
      write: async raw => {
        console.log(raw.title.gray)
      }
    })
  )
  .then(() => {
    console.log('Done.'.magenta)
  })
