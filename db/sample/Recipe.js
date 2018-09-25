"use strict";

module.exports = db => gpf.define({
    $class: "Recipe",
    $extend: db.Record,

    constructor: function (raw) {
        const
            calories = parseInt(raw.calories, 10),
            portions = parseInt(raw.portions, 10);
        this._number = Math.floor(calories / portions);
        this._statusText1 = portions;
        this._statusState1 = db.Record.STATE.show;
        this.$super(raw);
    }
});
