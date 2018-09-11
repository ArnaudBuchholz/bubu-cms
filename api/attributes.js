"use strict";

const
    gpf = global.gpf || require("gpf-js/source"),
    attributes = {};

attributes.Base = gpf.define({
    $extend: gpf.attributes.Attribute,
    $class: "Base",
    $attributes: [new gpf.attributes.MemberAttribute]
});

[
    "Key",
    "Sortable",
    "Filterable",
    "Updatable",
    "Creatable",
    "Hidden"

].forEach(name => {
    attributes[name] = gpf.define({
        $extend: attributes.Base,
        $class: name,
        $singleton: true,
        $attributes: [new gpf.attributes.UniqueAttribute]
    });
});

module.exports = attributes;
