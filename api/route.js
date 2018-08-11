"use strict";
const
    gpf = require("gpf-js"),
    express = require("express"),
    router = express.Router();

router.get("/", (req, res, next) => {
    res.type("json");
    res.json({
        test: true
    });
});

module.exports = router;
