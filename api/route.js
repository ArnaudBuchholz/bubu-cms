"use strict";
const
    express = require("express"),
    path = require("path"),
    router = express.Router(),

    config = require("../config"),
    metadata = require("./metadata"),
    entities = require("./entities"),
    db = require("./db"),
    odata = require("./odata"),
    searcher = require("./search"),
    sorter = require("./sort"),

    notFound = next => {
        var error = new Error("Not found");
        error.status = 404;
        next(error);
    },

    notImplemented = next => {
        var error = new Error("Not implemented");
        error.status = 500;
        next(error);
    };

router.get(/\/\$metadata.*/, (req, res, next) => {
    res.set("Content-Type", "application/xml");
    metadata().then(body => res.send(body))
});

router.get(/\/i18n(_\w+)?\.properties/, (req, res, next) => {
    res.sendFile(path.join(__dirname, "../db", config.db, req.url.substr(1)));
});

entities.forEach(EntityClass => {
    const toODataV2 = odata.buildToODataV2(EntityClass);

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
                params = odata.parseParams(req.url),
                response = {d: {}};
            let
                records;
            if (params.search) {
                records = searcher(EntityClass, params.search);
            } else {
                records = EntityClass.all();
            }
            if (params.$orderby) {
                records.sort(sorter(EntityClass, params.$orderby));
            }
            if (params.$inlinecount === "allpages") {
                response.d.__count = records.length;
            }
            if (params.$top || params.$skip) {
                records = records.slice(params.$skip, params.$skip + params.$top);
            }
            response.d.results = records.map(toODataV2);
            res.set("Content-Type", "application/json");
            res.send(JSON.stringify(response));
        }));
});

router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
