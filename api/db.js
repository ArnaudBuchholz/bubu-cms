"use strict";

const
    DB_NAME = "sample",
    Record = require("./Record");

let
    opened;

module.exports = {

    open: () => {
        if (!opened) {
            try {
                opened = require(`../db/${DB_NAME}/init`)({
                    loadRecords: array => Record.load(array)
                });
            } catch (e) {
                console.error(e);
            }
        }
        return opened;
    }

};
