"use strict";
const
    express = require("express"),
    path = require("path"),
    router = express.Router(),

    config = require("../config"),
    attributes = require("./attributes"),
    metadata = require("./metadata"),
    entities = require("./entities"),
    db = require("./db"),

    buildToODataV2 = EntityClass => {
        const
            keys = gpf.attributes.get(EntityClass, attributes.Key),
            serialProps = gpf.serial.get(EntityClass),
            keyProperty = serialProps[Object.keys(keys)[0]].name;
        return entity => {
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
    },

    mapOfODataParamTypes = {
        "undefined": () => {},
        "number": (aggregated, key, value) => {
            aggregated[key] = parseInt(value, 10);
        },
        "string": (aggregated, key, value) => {
            aggregated[key] = value;
        }
    },

    parseODataParams = url => url
        .substr(url.indexOf("?") + 1)
        .split("&")
        .reduce((aggregated, param) => {
            const
                equalPos = param.indexOf("="),
                key = param.substr(0, equalPos),
                defaultValue = aggregated[key];
            mapOfODataParamTypes[typeof defaultValue](aggregated, key, param.substr(equalPos + 1));
            return aggregated;
        }, {
            $top: 0,
            $skip: 0,
            $inlinecount: ""
        }),

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
    const toODataV2 = buildToODataV2(EntityClass);
    router.get(new RegExp(`\/${EntityClass.name}Set\?.*`), (req, res, next) =>
        db.open().then(() => {
            const
                params = parseODataParams(req.url),
                response = {d: {}};
            let
                records = EntityClass.get();
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
