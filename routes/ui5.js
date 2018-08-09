const
    express = require("express"),
    router = express.Router(),
    path = require("path"),
    fs = require("fs");

// Map OpenUI5 resources folder to bower_components (need to find the proper package)
router.get(/resources\/.*/, (req, res, next) => {
    fs.readdir("bower_components", (err, packages) => {
        if (err) {
            console.log(err);
            return next();
        }
        const checkInPackage = () => {
            if (!packages.length) {
                return next();
            }
            const
                packageName = packages.shift(),
                resourceFileName = path.join(__dirname + "/../bower_components", packageName, req.url);
            fs.access(resourceFileName, err => err ? checkInPackage() : res.sendFile(resourceFileName));
        }
        checkInPackage();
    });
});

module.exports = router;
