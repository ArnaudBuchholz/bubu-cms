"use strict";
const
    express = require("express"),
    parser = require("odata-parser"),
    path = require("path"),
    router = express.Router(),

    config = require("../config"),
    attributes = require("./attributes"),
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

router.get(/\/i18n(_\w+)?\.properties/, (req, res, next) => {
    res.sendFile(path.join(__dirname, "../db", config.db, req.url.substr(1)));
});

entities.forEach(EntityClass => {
    const
        keys = gpf.attributes.get(EntityClass, attributes.Key),
        serialProps = gpf.serial.get(EntityClass),
        keyProperty = serialProps[Object.keys(keys)[0]].name,
        toODataV2 = entity => {
            const raw = gpf.serial.toRaw(entity, function (value, property) {
                if (gpf.serial.types.datetime === property.type) {
                    if (value) {
                        return "/Date(" + value.getTime() + ")/";
                    } else {
                        return null;
                    }
                }
                if ("tags" === property.name) {
                    return value.join(" ");
                }
                return value;
            });
            raw.__metadata = {
                uri: `${EntityClass.name}Set(${raw[keyProperty]})`,
                type: `BUBU_CMS.${EntityClass.name}`
            };
            return raw;
        };
    router.get(new RegExp(`\/${EntityClass.name}Set\?.*`), (req, res, next) =>
        db.open().then(() => {
            const
                questionMarkPos = req.url.indexOf("?"),
                params = parser.parse(req.url.substr(questionMarkPos + 1)),
                top = params.$top,
                skip = params.$skip || 0,
                response = {d: {}};
            let
                results = EntityClass.get();

            // Paging
            if (params.$inlinecount === "allpages") {
                response.d.__count = results.length;
            }
            if (top || skip) {
                results = results.slice(skip, skip + top);
            }
            response.d.results = results.map(toODataV2);

            res.set("Content-Type", "application/json");
            res.send(JSON.stringify(response));
        }));
});

router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
