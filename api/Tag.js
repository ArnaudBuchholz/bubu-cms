"use strict";

const
    Record = require("./Record"),
    MinDate = new Date(0)
;

const
    Tag = gpf.define({
        $class: "Tag",
        $extend: Record,

        _type: "tag",
        _records: [],
        _number: "0",

        usedBy: function (record) {
            this._records.push(record);
            this._number = this._records.length.toString();
        },

        records: function (RecordType) {
            if (RecordType) {
                return this._records.filter(record => record instanceof RecordType);
            } else {
                return this._records;
            }
        },

        constructor: function (name) {
            this._records = [];
            this._id = "#" + name;
            this._name = name;
            this._created = MinDate;
            this._modified = MinDate;
            Record.load([this]);
        },

        toString: function () {
            return this._name;
        }

    }),

    tags = [],
    tagsByTag = {};

Object.assign(Tag, {

    all: () => tags,
    get: tag => tagsByTag[tag.toLowerCase()],

    allocate: tag => {
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

// X-dependency
Record.Tag = Tag;

module.exports = Tag;
