const
    express = require("express"),
    router = express.Router(),
    path = require("path");

router.get("/js/gpf.js", (req, res, next) => {
    res.sendFile(path.join(__dirname + "/../node_modules/gpf-js/build/gpf.js"));
});

module.exports = router;
