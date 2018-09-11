"use strict";

const
    attributes = require("./attributes.js"),
    key = new attributes.Key(),
    sortable = new attributes.Sortable(),
    filterable = new attributes.Filterable(),
    updatable = new attributes.Updatable(),
    creatable = new attributes.Creatable();

module.exports = gpf.define({
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
    _name: ""

});
