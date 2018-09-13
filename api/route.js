"use strict";
const
    express = require("express"),
    router = express.Router(),

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

entities.forEach(EntityClass => {
    const
        toJSON = gpf.serial.buildToJSON(EntityClass),
        keys = gpf.attributes.get(EntityClass, attributes.Key),
        serialProps = attributes.serializableProperties(EntityClass),
        keyProperty = serialProps[Object.keys(keys)[0]].name,
        toODataV2 = entity => {
            const json = toJSON(entity);
            json.__metadata = {
                uri: `${EntityClass.name}Set(${json[keyProperty]})`,
                type: `BUBU_CMS.${EntityClass.name}`
            };
            return json;
        };
    router.get(new RegExp(`\/${EntityClass.name}Set\?.*`), (req, res, next) =>
        db.open().then(() => {
            res.set("Content-Type", "application/json");
            res.send(JSON.stringify({
                d: {
                    results: EntityClass.get().map(toODataV2)
                }
            }));
        }));
});

router.get(/.*/, (req, res, next) => notImplemented(next));

module.exports = router;
