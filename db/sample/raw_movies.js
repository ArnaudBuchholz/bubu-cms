'use strict'

require('colors')
// require('../../gpf-src')
const gpf = require('gpf-js/debug')
const path = require('path')

const titles = []
const imdbTitleBasicsTSV = path.join(__dirname, 'tmp/title.basics.tsv')
let imdbTitleBasicsTSVsize

gpf.fs.getFileStorage()
  .getInfo(imdbTitleBasicsTSV)
  .catch(() => {
    console.error(`Please proceed to https://www.imdb.com/interfaces/ and download the title.basics
Then unzip it inside tmp/title.basics.tsv`.red)
      process.exit(-1)
  })
  .then(fileInfo => {
    imdbTitleBasicsTSVsize = fileInfo.size
  })
  .then(() => gpf.fs.getFileStorage().openTextStream(imdbTitleBasicsTSV, gpf.fs.openFor.reading))
  .then(csvFile => {
    console.log(`Loading IMDB titles...`.magenta)
    process.stdout.write('\x1B7')
    let bytes = 0
    return gpf.stream.pipe(csvFile, new gpf.stream.Filter(data => {
        bytes += data.length
        return true
    }), new gpf.stream.LineAdapter(), new gpf.stream.Filter(line => {
        if (line.includes('`')) {
          console.log(line)
        }
        return true
    }), new gpf.stream.csv.Parser({ quote: '`' }), {
      write: async title => {
        titles.push(title)
        process.stdout.write('\x1B7')
        process.stdout.write(`${Math.floor(100 * bytes / imdbTitleBasicsTSVsize)} % read, ${titles.length} titles`.gray)
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
