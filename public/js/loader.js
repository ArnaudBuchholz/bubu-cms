(function () {
    "use strict";

    document.body.innerHTML = "<table width=\"100%\" height=\"100%\"><tr valign=\"center\"><td align=\"center\">"
        + "<progress id=\"progress\"></progress></td></tr></table>";
    var progress = document.getElementById("progress");
    progress.value = 1;
    progress.max = 10;

}());
