"use strict";

const
    gpf = require("gpf-js/source"),
    nanoid = require("nanoid"),
    Record = require("../../api/Record"),
    path = require("path"),

    _loadCSV = (db, name, RecordType) => {
        const
            csvFilePromise = gpf.fs.getFileStorage()
                .openTextStream(path.join(__dirname, `${name}.csv`), gpf.fs.openFor.reading),
            lineAdapter = new gpf.stream.LineAdapter(),
            csvParser = new gpf.stream.csv.Parser(),
            map = new gpf.stream.Map(function (raw) {
                return new RecordType(Object.assign({
                    id: nanoid() // as of now
                }, raw));
            }),
            output = new gpf.stream.WritableArray();
        return csvFilePromise
            .then(csvFile => gpf.stream.pipe(csvFile, lineAdapter, csvParser, map, output)
                .then(function () {
                    return db.loadRecords(output.toArray());
                }));
    }
;

module.exports = db => Promise.all([
    _loadCSV(db, "recipe", require("./Recipe")(db))
]);
