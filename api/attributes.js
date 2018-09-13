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

attributes.serializableProperties = EntityClass => {
    const serializable = gpf.attributes.get(EntityClass, gpf.attributes.Serializable);
    return Object.keys(serializable).reduce((properties, name) => {
        properties[name] = serializable[name][0].getProperty();
        return properties;
    }, {});
};

module.exports = attributes;
