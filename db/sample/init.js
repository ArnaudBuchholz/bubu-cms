"use strict";

const
    COUNT = 100,
    nanoid = require("nanoid"),
    Record = require("../../api/Record"),
    records = [];

module.exports = db => {
    console.log("Generating sample database...");
    for (let idx = 0; idx < COUNT; ++idx) {
        const record = new Record();
        record._id = nanoid();
        record._name = `Generated record ${idx}`;
        records.push(record);
    }
    return db.loadRecords(records);
};
