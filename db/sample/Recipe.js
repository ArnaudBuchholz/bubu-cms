"use strict";

module.exports = db => gpf.define({
    $class: "Recipe",
    $extend: db.Record,

    _statusState1: db.Record.STATE.show,

    constructor: function (raw) {
        const
            calories = parseInt(raw.calories, 10),
            portions = parseInt(raw.portions, 10);
        this._number = Math.floor(calories / portions);
        this._statusText1 = portions.toString();
        this.$super(raw);
    }
});
