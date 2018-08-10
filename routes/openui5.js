"use strict";
const
    express = require("express"),
    router = express.Router(),
    path = require("path"),
    fs = require("fs"),
    basePath = path.join(__dirname, "/../bower_components");

router.get(/.*\.(css|woff2)$/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-themelib_sap_belize", "resources", req.url));
});

router.get(/sap\/m\/.*/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-sap.m", "resources", req.url));
});

router.get(/.*/, (req, res, next) => {
    res.sendFile(path.join(basePath, "openui5-sap.ui.core", "resources", req.url));
});

module.exports = router;
