"use strict";
const
    express = require("express"),
    router = express.Router(),
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

router.get(/.*\.(css|woff2?)$/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-themelib_sap_belize", "resources", req.url));
});

router.get(/sap\/m\/.*/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-sap.m", "resources", trimDbg(req.url)));
});

router.get(/sap\/ui\/unified\/.*/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-sap.ui.unified", "resources", trimDbg(req.url)));
});

router.get(/.*/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-sap.ui.core", "resources", trimDbg(req.url)));
});

module.exports = router;
