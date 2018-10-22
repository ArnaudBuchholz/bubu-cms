"use strict";

const
    fs = require("fs"),
    path = require("path"),
    showdown  = require('showdown'),
    md = new showdown.Converter();

module.exports = db => gpf.define({
    $class: "Recipe",
    $extend: db.Record,

    _statusState1: db.Record.STATE.show,
    _statusState2: db.Record.STATE.show,

    constructor: function (raw) {
        const
            calories = parseInt(raw.calories, 10),
            portions = parseInt(raw.portions, 10);
        this._number = Math.floor(calories / portions);
        this._icon = `/images/recipe/${raw.id}.jpg`;
        this._statusText1 = portions.toString();
        this._statusText2 = raw.ready + "m";
        this.$super(raw);
    },

    getContent: function () {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, "recipe", `${this._id}.md`), (err, content) => err
                ? reject(err)
                : resolve(content.toString())
            );
        }).then(content => this._allocateContent({
            _type: "html",
            _data: md.makeHtml(content)
        }));
    }

});
