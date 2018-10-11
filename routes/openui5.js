"use strict";
const
    express = require("express"),
    path = require("path"),
    fs = require("fs"),
    basePath = path.join(__dirname, "/../bower_components"),
    trimDbg = url => {
        if (url.endsWith("sap-ui-core-dbg.js")) {
            return url;
        }
        if (url.endsWith("-dbg.js")) {
            return url.substr(0, url.length - 7) + ".js";
        }
        return url;
    };

module.exports = subFolder => {
    const router = express.Router();

    router.get(/.*\.(css|woff2?)$/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-themelib_sap_belize", subFolder, req.url));
    });

    fs.readdirSync(basePath).forEach(folder => {
        if (-1 !== folder.indexOf("themelib")) {
            return;
        }
        const relativePath = folder.substr(8/*openui5-*/);
        router.get(`/${relativePath.replace(/\./g, "/")}/*`, (req, res, next) => {
            res.sendFile(path.join(basePath, folder, subFolder, trimDbg(req.url)));
        });
    });

    router.get("*", (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.ui.core", subFolder, trimDbg(req.url)));
    });

    return router;
};
