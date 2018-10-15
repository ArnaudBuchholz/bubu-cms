"use strict";

const
    attributes = require("./attributes.js"),
    key = new attributes.Key(),

    Content = gpf.define({
        $class: "Content",

        "[_recordId]": [key, new gpf.attributes.Serializable({
            name: "recordId",
            type: gpf.serial.types.string,
            required: true
        })],
        _recordId: "",

        "[_type]": [key, new gpf.attributes.Serializable({
            name: "type",
            type: gpf.serial.types.string,
            required: true
        })],
        _type: "",

        "[_data]": [new gpf.attributes.Serializable({
            name: "data",
            type: gpf.serial.types.string,
            required: true
        })],
        _data: ""

    });

module.exports = Content;
