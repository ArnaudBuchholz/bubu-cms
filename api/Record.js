"use strict";

const
    attributes = require("./attributes.js"),
    key = new attributes.Key(),
    sortable = new attributes.Sortable(),
    filterable = new attributes.Filterable(),
    updatable = new attributes.Updatable(),
    creatable = new attributes.Creatable(),
    Tag = require("./Tag"),

    Record = gpf.define({
        $class: "Record",

        "[_id]": [key, new gpf.attributes.Serializable({
            name: "id",
            type: gpf.serial.types.string,
            required: true
        })],
        _id: "",

        "[_name]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "name",
            type: gpf.serial.types.string,
            required: true
        })],
        _name: "",

        "[_icon]": [creatable, updatable, new gpf.attributes.Serializable({
            name: "icon",
            type: gpf.serial.types.string
        })],
        _icon: "",

        "[_number]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "number",
            type: gpf.serial.types.string
        })],
        _number: "",

        "[_numberUnit]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "numberUnit",
            type: gpf.serial.types.string
        })],
        _numberUnit: "",

        "[_rating]": [creatable, updatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "rating",
            type: gpf.serial.types.integer
        })],
        _rating: "",

        "[_created]": [creatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "created",
            type: gpf.serial.types.datetime,
            required: true
        })],
        _created: null,

        "[_modified]": [creatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "modified",
            type: gpf.serial.types.datetime
        })],
        _modified: null,

        "[_statusTitle1]": [new gpf.attributes.Serializable({
            name: "statusTitle1",
            type: gpf.serial.types.string
        })],
        _statusTitle1: "",

        "[_statusText1]": [creatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "statusText1",
            type: gpf.serial.types.string
        })],
        _statusText1: "",

        "[_statusState1]": [new gpf.attributes.Serializable({
            name: "statusState1",
            type: gpf.serial.types.string
        })],
        _statusState1: "None",

        "[_statusTitle2]": [new gpf.attributes.Serializable({
            name: "statusTitle2",
            type: gpf.serial.types.string
        })],
        _statusTitle2: "",

        "[_statusText2]": [creatable, sortable, filterable, new gpf.attributes.Serializable({
            name: "statusText2",
            type: gpf.serial.types.string
        })],
        _statusText2: "",

        "[_statusState2]": [new gpf.attributes.Serializable({
            name: "statusState2",
            type: gpf.serial.types.string
        })],
        _statusState2: "None",

        "[_tags]": [new gpf.attributes.Serializable({
            name: "tags",
            type: gpf.serial.types.string
        })],
        _tags: [],

        addTag: function (tag) {
            const tagRecord = Tag.normalize(tag);
            this._tags.push(tagRecord);
            tagRecord.usedBy(this);
        },

        constructor: function (raw) {
            this._tags = [];
            if (raw.tags) {
                raw.tags.split(" ").forEach(tag => this.addTag(tag));
                delete raw.tags;
            }
            if ("string" === typeof raw.rating) {
                raw.rating = parseInt(raw.rating, 10);
            }
            gpf.serial.fromRaw(this, raw);
        }

    }),

    records = [],
    recordsById = {},
    recordsByTag = {};

Object.assign(Record, {

    STATE: {
        error: "Error",
        none: "None",
        success: "Success",
        warning: "Warning"
    },

    get: () => records,

    load: array => {
        [].splice.apply(records, [0,0].concat(array));
        array.forEach(record => {
            recordsById[record._id] = record;
        })
        return Promise.resolve();
    }

});

module.exports = Record;
