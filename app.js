const
    express = require("express"),
    path = require("path"),
    favicon = require("serve-favicon"),
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),

    api = require("./routes/api"),
    publicOverrides = require("./routes/public"),

    app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", publicOverrides);
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", api);

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
