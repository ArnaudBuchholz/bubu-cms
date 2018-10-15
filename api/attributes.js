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

attributes.NavigationProperty = gpf.define({
    $extend: attributes.Base,
    $class: "NavigationProperty",
    $attributes: [new gpf.attributes.UniqueAttribute],

    fromEntity: function () {
        return this.getClassConstructor();
    },

    _toEntity: null,

    toEntity: function () {
        return this._toEntity;
    },

    constructor: function (ToEntity) {
        this._toEntity = ToEntity;
    }

});

attributes.serializableProperties = EntityClass => {
    const serializable = gpf.attributes.get(EntityClass, gpf.attributes.Serializable);
    return Object.keys(serializable).reduce((properties, name) => {
        properties[name] = serializable[name][0].getProperty();
        return properties;
    }, {});
};

module.exports = attributes;
