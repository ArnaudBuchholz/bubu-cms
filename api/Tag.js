"use strict";

module.exports = Record => {

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

            constructor: function (name) {
                this._records = [];
                this._id = "#" + name;
                this._name = name;
                Record.load([this]);
            },

            toString: function () {
                return this._name;
            }

        }),

        tags = [],
        tagsByTag = {};

    Tag.allocate = tag => {
        const loweredTag = tag.toLowerCase();
        let tagRecord = tagsByTag[loweredTag];
        if (!tagRecord) {
            tagRecord = new Tag(loweredTag);
            tags.push(tagRecord);
            tagsByTag[loweredTag] = tagRecord;
        }
        return tagRecord;
    };

    return Tag;
};
