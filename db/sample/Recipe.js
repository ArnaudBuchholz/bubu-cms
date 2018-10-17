"use strict";

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
        return Promise.resolve([
            this._allocateContent({
                _type: "text/html",
                _data: `<h1>${this._name}</h1>`
            })
        ]);
    }
});
