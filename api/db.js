"use strict";

const
    config = require("../config"),
    Record = require("./Record");

let
    opened;

module.exports = {

    open: () => {
        if (!opened) {
            try {
                opened = require(`../db/${config.db}/init`)({
                    loadRecords: array => Record.load(array)
                });
            } catch (e) {
                console.error(e);
            }
        }
        return opened;
    }

};
