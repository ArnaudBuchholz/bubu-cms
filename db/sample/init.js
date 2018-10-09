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
                if (!raw.id) {
                    raw.id = nanoid(); // as of now
                }
                return new RecordType(raw);
            }),
            output = new gpf.stream.WritableArray();
        return csvFilePromise
            .then(csvFile => gpf.stream.pipe(csvFile, lineAdapter, csvParser, map, output)
                .then(function () {
                    return db.loadRecords(output.toArray());
                }));
    },

    _fillDB = (db) => {
        var Recipe = require("./Recipe")(db),
            array = [];
        for (var idx = 0; idx < 200000; ++idx) {
            array.push(new Recipe({
                id: nanoid(),
                name: "My recipe number #" + (idx + 1),
                calories: "" + Math.floor(Math.random() * 600),
                portions: "" + Math.floor(Math.random() * 8),
                rating: idx % 6
            }));
        }
        return db.loadRecords(array);
    }
;

module.exports = db => Promise.all([
    _loadCSV(db, "recipe", require("./Recipe")(db)),
    _loadCSV(db, "contact", require("./Contact")(db)),
    _loadCSV(db, "address", require("./Address")(db))
    // _fillDB(db)
]);
