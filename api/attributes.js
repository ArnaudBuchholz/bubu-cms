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

    from: function () {
        return this.getClassConstructor();
    },

    _to: null,

    to: function (Entity) {
        if (!Entity) {
            return this._to;
        }
        this._to = Entity;
        return this;
    },

    _principal: "",

    getPrincipal: function () {
        return this._principal;
    },

    _dependent: "",

    getDependent: function () {
        return this._dependent;
    },

    on: function (on) {
        this._principal = Object.keys(on)[0];
        this._dependent = on[this._principal];
        return this;
    },

    getName: function () {
        return `to${this._to.name}`;
    },

    getRelationshipName: function () {
        return `${this.from().name}to${this.to().name}`;
    },

    getFromRoleName: function () {
        return `FromRole_${this.from().name}to${this.to().name}`;
    },

    getToRoleName: function () {
        return `ToRole_${this.from().name}to${this.to().name}`;
    }

});

attributes.serializableProperties = EntityClass => {
    const serializable = gpf.attributes.get(EntityClass, gpf.attributes.Serializable);
    return Object.keys(serializable).reduce((properties, name) => {
        properties[name] = serializable[name][0].getProperty();
        return properties;
    }, {});
};

attributes.navigationProperties = EntityClass => {
    const dictionary = gpf.attributes.get(EntityClass, attributes.NavigationProperty);
    return Object.keys(dictionary).map(name => dictionary[name][0]);
};

module.exports = attributes;
