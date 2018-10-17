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
    searcher = require("./search"),
    sorter = require("./sort"),
    Record = require("./Record"),
    Tag = require("./Tag"),

    fail = (status, text, next) => {
        var error = new Error(text);
        error.status = status;
        next(error);
    },

    notFound = next => fail(404, "Not found", next),
    notImplemented = next => fail(500, "Not implemented", next),

    sendRecords = (EntityClass, records, req, res, next) => {
        const
            params = odata.parseParams(req.url),
            response = {d: {}};
        if (params.$orderby) {
            records.sort(sorter(EntityClass, params.$orderby));
        }
        if (params.$inlinecount === "allpages") {
            response.d.__count = records.length;
        }
        if (params.$top || params.$skip) {
            records = records.slice(params.$skip, params.$skip + params.$top);
        }
        response.d.results = records.map(EntityClass.toODataV2);
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify(response));
    },

    odataSerializers = {};

router.all('*', function (req, res, next) {
    var memory = process.memoryUsage();
    res.set("x-memory-rss", memory.rss);
    res.set("x-memory-heapTotal", memory.heapTotal);
    res.set("x-memory-heapUsed", memory.heapUsed);
    res.set("x-memory-external", memory.external);
    res.set("x-count-records", Record.all().length);
    res.set("x-count-tags", Tag.all().length);
    next(); // pass control to the next handler
});

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

entities.forEach(EntityClass => {
    const
        toODataV2 = odata.buildToODataV2(EntityClass),
        navigationProperties = attributes.navigationProperties(EntityClass);
    EntityClass.toODataV2 = toODataV2;

    navigationProperties.forEach(property => {
        router.get(new RegExp(`\/${EntityClass.name}Set\\('([^']+)'\\)\\/${property.getName()}`), (req, res, next) =>
            db.open().then(() => {
                const
                    record = EntityClass.byId(req.params[0]);
                if (!record) {
                    return notFound(next);
                }
                record[property.getMemberName()]()
                    .then(records => sendRecords(EntityClass, records, req, res, next))
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
            res.set("Content-Type", "application/json");
            res.send(JSON.stringify({
                d: toODataV2(record)
            }));
        }));

    router.get(`/${EntityClass.name}Set`, (req, res, next) =>
        db.open().then(() => {
            const
                params = odata.parseParams(req.url);
            let
                records;
            if (EntityClass.searchable && params.search) {
                records = searcher(EntityClass, params.search);
            } else {
                records = EntityClass.all();
            }
            sendRecords(EntityClass, records, req, res, next)
        }));
});

router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
