const
    express = require("express"),
    router = express.Router(),
    path = require("path");

router.get("/js/gpf.js", (req, res, next) => {
    res.sendFile(path.join(__dirname + "/../node_modules/gpf-js/build/gpf.js"));
});

router.get("/js/jquery.js", (req, res, next) => {
    res.redirect("https://code.jquery.com/jquery-3.3.1.min.js");
});

router.get("/js/bootstrap.js", (req, res, next) => {
    res.redirect("https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.bundle.min.js");
});

router.get("/css/bootstrap.css", (req, res, next) => {
    res.redirect("https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css");
});

router.get("/js/showdown.js", (req, res, next) => {
    res.redirect("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.8.6/showdown.js");
});

module.exports = router;
