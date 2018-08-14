"use strict";

const
    gpf = require("gpf-js/source"),
    attributes = {};

attributes.Base = gpf.define({
    $extend: gpf.attributes.Attribute,
    $class: "Base"
});

[
    "Sortable",
    "Filterable",
    "Updatable",
    "Creatable",
    "Hidden"

].forEach(name => {
    attributes[name] = gpf.define({
        $extend: gpf.attributes.Attribute,
        $class: attributes.Base
    });
});

attributes.Name = gpf.define({
    $extend: attributes.Base,
    $class: "Name",

    _name: "",

    constructor: function (name) {
        this._name = name;
    },

    getName: function () {
        return this._name;
    }

});

attributes.Name = gpf.define({
    $extend: attributes.Base,
    $class: "Length",

    _length: 0,

    constructor: function (length) {
        this._length = length;
    },

    getLength: function () {
        return this._length;
    }

});

module.exports = attributes;
