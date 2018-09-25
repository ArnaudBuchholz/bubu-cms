"use strict";

const
    capitalize = str => str.charAt(0).toUpperCase() + str.substr(1)
;

module.exports = db => gpf.define({
    $class: "Contact",
    $extend: db.Record,

    _statusState1: db.Record.STATE.show,

    constructor: function (raw) {
        this._number = raw.phone;
        this._name = `${capitalize(raw.firstname)} ${capitalize(raw.lastname)}`;
        this._statusText1 = `${raw.firstname}.${raw.lastname}@starship-troopers.movie.com`;
        this.$super(raw);
    }

});
