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

module.exports = subPath => {
    const router = express.Router();

    router.get(/.*\.(css|woff2?)$/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-themelib_sap_belize", subPath, req.url));
    });

    router.get(/sap\/m\/.*/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.m", subPath, trimDbg(req.url)));
    });

    router.get(/sap\/ui\/layout\/.*/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.ui.layout", subPath, trimDbg(req.url)));
    });

    router.get(/sap\/ui\/unified\/.*/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.ui.unified", subPath, trimDbg(req.url)));
    });

    router.get(/sap\/uxap\/.*/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.uxap", subPath, trimDbg(req.url)));
    });

    router.get(/.*/, (req, res, next) => {
        res.sendFile(path.join(basePath, "openui5-sap.ui.core", subPath, trimDbg(req.url)));
    });

    return router;
};
