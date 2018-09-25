"use strict";

module.exports = db => gpf.define({
    $class: "Address",
    $extend: db.Record,

    constructor: function (raw) {
        this.$super(raw);
    }

});
