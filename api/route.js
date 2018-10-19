"use strict";

const
    express = require("express"),
    path = require("path"),
    router = express.Router(),
    nanoid = require("nanoid"),

    config = require("../config"),
    metadata = require("./metadata"),
    odata = require("./odata")
;

router.get("/id", (req, res, next) => {
    res.set("Content-Type", "text/plain");
    res.send(nanoid());
});

router.get(/\/\$metadata.*/, (req, res, next) => {
    res.set("Content-Type", "application/xml");
    metadata().then(body => res.send(body))
});

router.get(/\/i18n(_\w+)?\.properties/, (req, res, next) => {
    res.sendFile(path.join(__dirname, "../db", config.db, req.url.substr(1)));
});

router.get("*", (req, res, next) => {
    // Performance values
    var memory = process.memoryUsage();
    "rss,heapTotal,heapUsed,external"
        .split(",")
        .forEach(type => res.set(`x-memory-${type.toLowerCase()}`, memory[type]));
    next(); // pass control to the next handler
});

require("./entities").forEach(EntityClass => odata.route(router, EntityClass));

// Default
router.get("*", (req, res, next) => {
    var error = new Error("Not implemented");
    error.status = 500;
    next(error);
});

module.exports = router;
