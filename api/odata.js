"use strict";

const
    gpf = global.gpf || require("gpf-js/source"),
    attributes = require("./attributes"),
    mapOfODataParamTypes = {
        "undefined": () => {},
        "number": (aggregated, key, value) => {
            aggregated[key] = parseInt(value, 10);
        },
        "string": (aggregated, key, value) => {
            aggregated[key] = value;
        }
    }
;

module.exports = {

    buildToODataV2: EntityClass => {
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

    parseParams: url => url
        .substr(url.indexOf("?") + 1)
        .split("&")
        .reduce((aggregated, param) => {
            const
                equalPos = param.indexOf("="),
                key = param.substr(0, equalPos),
                defaultValue = aggregated[key];
            mapOfODataParamTypes[typeof defaultValue](aggregated, key, decodeURIComponent(param.substr(equalPos + 1)));
            return aggregated;
        }, {
            $top: 0,
            $skip: 0,
            $inlinecount: "",
            $orderby: "",
            search: ""
        })

};
