"use strict";
const
    express = require("express"),
    router = express.Router();

router.get("/", function(req, res, next) {
    res.type("json");
    res.json({
        test: true
    });
});

module.exports = router;
