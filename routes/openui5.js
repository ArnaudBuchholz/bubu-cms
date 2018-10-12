"use strict";
const
    express = require("express"),
    path = require("path"),
    fs = require("fs"),
    basePath = path.join(__dirname, "/../bower_components"),
    trimURL = url => {
        const pos = url.indexOf("?");
        if (-1 !== pos) {
            url = url.substr(0, pos);
        }
        if (url.endsWith("sap-ui-core-dbg.js")) {
            return url;
        }
        if (url.endsWith("-dbg.js")) {
            return url.substr(0, url.length - 7) + ".js";
        }
        return url;
    };

module.exports = subFolder => {
    const
        TYPE_THEME = 0,
        TYPE_NAMESPACE = 1,
        router = express.Router();

    fs.readdirSync(basePath)
        .map(folder => -1 !== folder.indexOf("themelib_")
            ? {type: TYPE_THEME, folder: folder, relativePath: folder.substr(17/*openui5-themelib_*/)}
            : {type: TYPE_NAMESPACE, folder: folder, relativePath: folder.substr(8/*openui5-*/)}
        )
        .sort((a, b) => a.type - b.type)
        .forEach(item => [

            // TYPE_THEME (must be processed first)
            () => {
                router.get(`*/themes/${item.relativePath}*`, (req, res, next) => {
                    res.sendFile(path.join(basePath, item.folder, subFolder, trimURL(req.url)));
                });
            },

            // TYPE_NAMESPACE
            () => {
                router.get(`/${item.relativePath.replace(/\./g, "/")}/*`, (req, res, next) => {
                    res.sendFile(path.join(basePath, item.folder, subFolder, trimURL(req.url)));
                });
            }

        ][item.type]());

    // Default
    router.get("*", (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.ui.core", subFolder, trimURL(req.url)));
    });

    return router;
};
