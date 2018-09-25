"use strict";

const
    attributes = require("./attributes.js"),
    key = new attributes.Key(),
    sortable = new attributes.Sortable(),
    filterable = new attributes.Filterable(),
    updatable = new attributes.Updatable(),
    creatable = new attributes.Creatable(),

    Tag = gpf.define({
        $class: "Tag",

        "[_name]": [key, sortable, filterable, new gpf.attributes.Serializable({
            name: "name",
            type: gpf.serial.types.string,
            required: true
        })],
        _name: "",

        _records: [],

        usedBy: function (record) {
            this._records.push(record);
        },

        constructor: function (name) {
            this._name = name;
        },

        toString: function () {
            return this._name;
        }

    }),

    tags = [],
    tagsByTag = {};

Object.assign(Tag, {

    get: () => tags,

    normalize: tag => {
        const loweredTag = tag.toLowerCase();
        let tagRecord = tagsByTag[loweredTag];
        if (!tagRecord) {
            tagRecord = new Tag(loweredTag);
            tags.push(tagRecord);
            tagsByTag[loweredTag] = tagRecord;
        }
        return tagRecord;
    }

});

module.exports = Tag;
