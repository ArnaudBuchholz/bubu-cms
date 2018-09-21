"use strict";

const
    attributes = require("./attributes.js"),
    key = new attributes.Key(),
    sortable = new attributes.Sortable(),
    filterable = new attributes.Filterable(),
    updatable = new attributes.Updatable(),
    creatable = new attributes.Creatable(),

    Record = gpf.define({
        $class: "Record",

        "[_id]": [key, new gpf.attributes.Serializable({
            name: "id",
            type: gpf.serial.types.string,
            required: true
        })],
        _id: "",

        "[_name]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "name",
            type: gpf.serial.types.string,
            required: true
        })],
        _name: "",

        "[_icon]": [creatable, updatable, new gpf.attributes.Serializable({
            name: "icon",
            type: gpf.serial.types.string
        })],
        _icon: "",

        "[_number]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "number",
            type: gpf.serial.types.string
        })],
        _number: "",

        "[_numberUnit]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "numberUnit",
            type: gpf.serial.types.string
        })],
        _numberUnit: "",

        "[_rating]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "rating",
            type: gpf.serial.types.integer
        })],
        _rating: "",

        "[_created]": [creatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "created",
            type: gpf.serial.types.datetime,
            required: true
        })],
        _created: null,

        "[_modified]": [creatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "modified",
            type: gpf.serial.types.datetime
        })],
        _modified: null
    }),

    records = [];

Object.assign(Record, {

    get: () => records,

    load: array => Promise.resolve([].splice.apply(records, [0,0].concat(array)))

});

module.exports = Record;
