'use strict'

const gpf = require('gpf-js')
const path = require('path')

async function fromCSV (name, RecordType) {
  const csvFile = await gpf.fs.getFileStorage()
    .openTextStream(path.join(__dirname, `${name}.csv`), gpf.fs.openFor.reading)
  const lineAdapter = new gpf.stream.LineAdapter()
  const csvParser = new gpf.stream.csv.Parser()
  const createRecord = new gpf.stream.Map(function (raw) {
    return new RecordType(raw)
  })
  return gpf.stream.pipe(csvFile, lineAdapter, csvParser, createRecord)
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
  fromCSV('movies', require('./Movie')(db))
  // fromCSV('recipe', require('./Recipe')(db))
  // _loadCSV(db, 'contact', require('./Contact')(db)),
  // _loadCSV(db, 'address', require('./Address')(db))
  // require("./Pokemon")(db)
  // _fillDB(db)
])
