(function () {
    "use strict";

    document.body.innerHTML = "<table width=\"100%\" height=\"100%\"><tr valign=\"center\"><td align=\"center\">"
        + "<progress id=\"progress\"></progress></td></tr></table>";
    var progress = document.getElementById("progress");
    progress.value = 0;
    progress.max = 10;

    var script = document.createElement("script");
    script.src = "js/gpf.js";
    document.body.appendChild(script);

}());
