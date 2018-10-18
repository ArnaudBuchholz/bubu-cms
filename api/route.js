"use strict";
const
    express = require("express"),
    path = require("path"),
    router = express.Router(),
    nanoid = require("nanoid"),

    config = require("../config"),
    attributes = require("./attributes"),
    metadata = require("./metadata"),
    entities = require("./entities"),
    db = require("./db"),
    odata = require("./odata"),
    Record = require("./Record"),
    Tag = require("./Tag"),

    fail = (status, text, next) => {
        var error = new Error(text);
        error.status = status;
        next(error);
    },

    notFound = next => fail(404, "Not found", next),
    notImplemented = next => fail(500, "Not implemented", next);

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
    [Record,Tag]
        .forEach(Type => res.set(`x-count-${Type.name.toLowerCase()}`, Type.all().length));
    // ODATA handler
    req.odata = odata.parse(req);
    next(); // pass control to the next handler
});

entities.forEach(EntityClass => {
    const
        navigationProperties = attributes.navigationProperties(EntityClass);
    EntityClass.toJSON = odata.buildToJSON(EntityClass);

    navigationProperties.forEach(property => {
        router.get(new RegExp(`\/${EntityClass.name}Set\\('([^']+)'\\)\\/${property.getName()}`), (req, res, next) =>
            db.open().then(() => {
                const
                    record = EntityClass.byId(req.params[0]);
                if (!record) {
                    return notFound(next);
                }
                record[property.getMemberName()]()
                    .then(records => req.odata.send(property.to(), records, res))
                    .catch(reason => fail(500, reason.toString, next));
            }));
    });

    router.get(new RegExp(`\/${EntityClass.name}Set\\('([^']+)'\\)`), (req, res, next) =>
        db.open().then(() => {
            const
                record = EntityClass.byId(req.params[0]);
            if (!record) {
                return notFound(next);
            }
            req.odata.send(EntityClass, record, res);
        }));

    router.get(`/${EntityClass.name}Set`, (req, res, next) =>
        db.open().then(() => {
            let
                records;
            if (EntityClass.searchable && req.params.search) {
                records = searcher(EntityClass, params.search);
            } else {
                records = EntityClass.all();
            }
            req.odata.send(EntityClass, records, res);
        }));
});

router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
