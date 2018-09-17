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
        if (idx) {
            record._icon = "sap-icon://business-one";
            record._number = "" + idx;
            record._numberUnit = "EACH";
        } else {
            record._icon = "/images/recipe.jpg";
            record._number = "320";
            record._numberUnit = "kCal/portion";
        }
        const rating = idx % 6;
        if (rating) {
            record._rating = "" + rating;
        }
        records.push(record);
    }
    return db.loadRecords(records);
};
