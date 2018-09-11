"use strict";

const
    COUNT = 100,
    nanoid = require("nanoid"),
    Record = require("../../api/Record"),
    records = [];

for (let idx = 0; idx < COUNT; ++idx) {
    const record = new Record();
    record._id = nanoid();
    record._name = `Generated record ${idx}`;
    records.push(record);
}

module.exports = records;
