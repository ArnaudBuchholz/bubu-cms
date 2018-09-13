"use strict";

const
    DB_NAME = "sample",
    Record = require("./Record");

let
    opened;

module.exports = {

    open: () => {
        if (!opened) {
            opened = require(`../db/${DB_NAME}/init`)({
                loadRecords: array => Record.load(array)
            });
        }
        return opened;
    }

};
