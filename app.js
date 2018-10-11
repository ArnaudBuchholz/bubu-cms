"use strict";
const
    express = require("express"),
    path = require("path"),
    favicon = require("serve-favicon"),
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),

    config = require("./config"),
    api = require("./api/route"),
    openui5 = require("./routes/openui5"),

    app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/resources", openui5("resources"));
// app.use("/test-resources", openui5("test-resources"));
app.use(express.static(path.join(__dirname, "webapp")));
app.use("/api", api);
app.use("/images", express.static(path.join(__dirname, `db/${config.db}/images`)));

app.disable("etag");

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(JSON.stringify(err));
});

module.exports = app;
