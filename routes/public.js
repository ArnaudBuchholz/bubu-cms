const
    express = require("express"),
    router = express.Router(),
    path = require("path"),
    fs = require("fs");

router.get("/js/gpf.js", (req, res, next) => {
    res.sendFile(path.join(__dirname + "/../node_modules/gpf-js/build/gpf.js"));
});

router.get(/resources\/.*/, (req, res, next) => {
    console.log(req.url);
    const resourceName = req.url.substr(11); // /resources/
    fs.readdir("bower_components", (err, files) => {
        if (err) {
            console.log(err);
            next(err);
        }
        const test = () => {
            if (!files.length) {
                next();
            }
            const
                openui5Folder = files.shift(),
                openui5Resource = path.join(openui5Folder, resourceName);
            console.log(openui5Resource);
            fs.access(openui5Resource, err => err
                ? test
                : res.sendFile(openui5Resource)
            );
        }
    });
});

module.exports = router;
