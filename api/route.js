"use strict";
const
    express = require("express"),
    router = express.Router(),

    metadata = require("./metadata"),
    entities = require("./entities"),
    db = require("./db"),

    notImplemented = next => {
        var error = new Error("Not implemented");
        error.status = 500;
        next(error);
    };

router.get(/\/\$metadata.*/, (req, res, next) => {
    res.set("Content-Type", "application/xml");
    metadata().then(body => res.send(body))
});

entities.forEach(EntityClass => {
    router.get(new RegExp(`\/${EntityClass.name}Set\?.*`), (req, res, next) =>
        db.open().then(() => {
            res.set("Content-Type", "application/json");
            res.send(JSON.stringify(EntityClass.get()));
        }));
});

router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
