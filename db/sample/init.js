'use strict'

const gpf = global.gpf || require('gpf-js/source')
const nanoid = require('nanoid')
const path = require('path')

const _loadCSV = (db, name, RecordType) => {
  const
    csvFilePromise = gpf.fs.getFileStorage()
      .openTextStream(path.join(__dirname, `${name}.csv`), gpf.fs.openFor.reading)

  const lineAdapter = new gpf.stream.LineAdapter()

  const csvParser = new gpf.stream.csv.Parser()

  const map = new gpf.stream.Map(function (raw) {
    if (!raw.id) {
      raw.id = nanoid() // as of now
    }
    return new RecordType(raw)
  })

  const output = new gpf.stream.WritableArray()
  return csvFilePromise
    .then(csvFile => gpf.stream.pipe(csvFile, lineAdapter, csvParser, map, output)
      .then(function () {
        return db.loadRecords(output.toArray())
      }))
}

// const _fillDB = (db) => {
//   var Recipe = require('./Recipe')(db)
//
//   var array = []
//   for (var idx = 0; idx < 200000; ++idx) {
//     array.push(new Recipe({
//       id: nanoid(),
//       name: 'My recipe number #' + (idx + 1),
//       calories: '' + Math.floor(Math.random() * 600),
//       portions: '' + Math.floor(Math.random() * 8),
//       rating: idx % 6
//     }))
//   }
//   return db.loadRecords(array)
// }

module.exports = db => Promise.all([
  _loadCSV(db, 'recipe', require('./Recipe')(db)),
  _loadCSV(db, 'contact', require('./Contact')(db)),
  _loadCSV(db, 'address', require('./Address')(db))
  // require("./Pokemon")(db)
  // _fillDB(db)
])
