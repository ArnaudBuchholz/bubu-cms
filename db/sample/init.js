"use strict";

const
    gpf = require("gpf-js/source"),
    nanoid = require("nanoid"),
    Record = require("../../api/Record"),
    path = require("path");

module.exports = db => {
    const
        csvFilePromise = gpf.fs.getFileStorage()
            .openTextStream(path.join(__dirname, "records.csv"), gpf.fs.openFor.reading),
        lineAdapter = new gpf.stream.LineAdapter(),
        csvParser = new gpf.stream.csv.Parser(),
        deserialize = gpf.serial.buildFromRaw(Record),
        map = new gpf.stream.Map(function (raw) {
            return deserialize(new Record(), Object.assign({
                id: nanoid()
            }, raw));
        }),
        output = new gpf.stream.WritableArray();

    return csvFilePromise
        .then(csvFile => gpf.stream.pipe(csvFile, lineAdapter, csvParser, map, output)
            .then(function () {
                return db.loadRecords(output.toArray());
            }));
};
