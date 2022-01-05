var dataTable = null;
var CommandSourceType = {
    0: "NONE",
    1: "INITIAL",
    2: "MISSION",
    3: "IDLE",
    4: "RC",
    5: "INSTANT",
    6: "GEOFENCE",
    7: "FAILSAFE",
    8: "FAILSAFEFLIGHTCMDONGROUND",
    9: "FAILSAFERESCUE",
    10: "FAILSAFEGPSLOSS",
    11: "FAILSAFEGCSLOSS",
    12: "FAILSAFERCLOSS",
};


loadSvg("dataTableContainer", "svg/dataTable.svg", function () {
    var dataTableContainer = document.getElementById("dataTableContainer");
    var svg = document.getElementById("dataTable");
    var dataNames = ["currentCommand", "commandSource", "retractStatus", "distanceToWayPoint", "distanceToHome", "bearingFromHome", "systemTime", "hoverTime", "flightTime", "gpsTime", "latitudeSt", "longitudeSt", "aglAltitude", "mslAltitude"];
    var elements = dataNames.map(function (id) {
        return document.getElementById(id);
    });

    var progressBar = svg.getElementById("progressBar");
    var maxWidth = progressBar.getAttribute("width") * 1;

    gauges.push(dataTable = {
        svg: svg,
        visibilityCounter: 0,
        isVisible: function () {
            return dataTableContainer.style.visibility != "hidden";
        },
        show: function () {
            dataTableContainer.style.visibility = "visible";
        },
        hide: function () {
            dataTableContainer.style.visibility = "hidden";
        },
        update: function () {
            if (!dataTable.isVisible()) return;
            progressBar.setAttribute("width", maxWidth * (values.percentCompleted / 100.0));
            dataNames.forEach(function (name, i) {
                switch (name) {
                    case 'currentCommand':
                        elements[i].innerHTML = values['index'] + ' - ' + values[name];
                        break;
                    case 'commandSource':
                        elements[i].innerHTML = CommandSourceType[values[name]];
                        break;

                    default:
                        elements[i].innerHTML = values[name];
                        break;
                }
            });
        }
    });
});
