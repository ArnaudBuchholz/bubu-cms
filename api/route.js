"use strict";
const
    express = require("express"),
    router = express.Router(),

    metadata = require("./metadata"),

    notImplemented = next => {
        var error = new Error("Not implemented");
        error.status = 500;
        next(error);
    };

router.get(/\/\$metadata.*/, (req, res, next) => {
    res.set("Content-Type", "application/xml");
    metadata().then(body => res.send(body))
});
router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
