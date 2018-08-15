"use strict";

const
    gpf = global.gpf || require("gpf-js/source"),
    attributes = {},

    valueAttribute = name => {
        const definition = {
            $extend: attributes.Base,
            $class: name,

            constructor: function (value) {
                this._value = value;
            }
        };
        definition[`get${name.charAt(0).toUpperCase()}${name.substr(1)}`] = function () {
            return this._value;
        };
        attributes[name] = gpf.define(definition);
    };

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
        $extend: attributes.Base,
        $class: name
    });
});

valueAttribute("Name");
valueAttribute("Length");

module.exports = attributes;
