"use strict";

const
    attributes = require("./attributes.js");

gpf.define({
    $class: "Record",

    "[_id]": [new attributes.Hidden(), new attributes.Length(10)],
    _id: "",

    "[_name]": [new attributes.Length(128), new attributes.Sortable(), new attributes.Filterable()],
    _name: ""

});
