var plane = null;
var planes = {};
var planeModels = [];
var planeModelsFolder = "models/";
var planeModelFileExt = ".glb";

// Load .glb model file names into planeModels array
jQuery.ajax(planeModelsFolder).then((e) => window.planeModels = e.split('addRow("').map((s) => s.split('",')[0]).filter((s) => s.endsWith(planeModelFileExt)).map((s) => s.split('.')[0]));

function getPlaneModelFile(aircraftName) {
    var file = "default";
    if (aircraftName)
        file = planeModels.filter((s) => aircraftName.startsWith(s))[0] || file;
    return planeModelsFolder + file + planeModelFileExt;
}

function createPlaneModel(plane) {
    var modelsFolder = document.location.href.substring(0, document.location.href.lastIndexOf("/")) + "/models/";
    var modelFile = getPlaneModelFile(plane.aircraftName);
    plane.model = viewer.entities.add({
        name: "plane:" + plane.aircraftId,
        model: {
            uri: modelFile,
            minimumPixelSize: 128,
            color: Cesium.Color.YELLOW,
            colorBlendMode: Cesium.ColorBlendMode.MIX
        },
        billboard: {
            image: "Common/plane-top-view.png",
            eyeOffset: new Cesium.Cartesian3(0, 0, -999),
            show: (cameraMode == CameraMode.Orthogonal)
        },
        label: {
            text: plane.aircraftName || plane.aircraftId.toString(),
            font: '20px sans-serif',
            fillColor: Cesium.Color.YELLOW,
            eyeOffset: new Cesium.Cartesian3(5, -3, -100)
        }
    });
    plane.trace = new Trace();
    plane.trace.init({
        wall: Cesium.Color.LIGHTGREY.withAlpha(0.3),
        line: Cesium.Color.WHITE
    }, 200);
    plane.mapAltitude = 0;
}

function clearPlaneTrace() {
    if (plane && plane.trace && plane.trace.clear) {
        plane.trace.clear();
    }
}

var needToGoToPlane = false;

window.addEventListener("AircraftSelectionChanged", (e) => {
    selectAirplane(e.detail);
});

window.addEventListener("AircraftAdded", (e) => {
    addAirplane(e.detail);
});

window.addEventListener("AircraftRemoved", (e) => {
    removeAirplane(e.detail);
});

window.addEventListener('AircraftChanged', (e) => {
    updatePlane(e.detail);
});

function selectAirplane(aircraftId) {
    //console.log(aircraftId);
    needToGoToPlane = window.selectedAircraftId !== aircraftId; // checkForInitial
    window.selectedAircraftId = aircraftId;
    window.plane = planes[aircraftId];
}

function addAirplane(aircraftId) {
    if (planes[aircraftId]) return planes[aircraftId];
    var plane = planes[aircraftId] = {aircraftId: aircraftId};
    return plane;
}

function removeAirplane(aircraftId) {
    if (!planes[aircraftId]) return;
    if (plane && aircraftId == plane.aircraftId) {
        plane = null;
    }
    if (planes[aircraftId].trace)
        planes[aircraftId].trace.clear();
    viewer.entities.remove(planes[aircraftId].model);
    airplaneSelect.remove(aircraftId);
    delete planes[aircraftId];
}

function updatePlane(values) {
    var plane = planes[values.aircraftId];
    if (!plane) return;
    if (plane.latitude || plane.longitude)
        updateMapAltitude(plane, function () {
            if (window.plane == plane)
                csharp.setMapAltitude(plane.aircraftId, plane.mapAltitude);
        });

    if (values.aircraftName && !plane.aircraftName)
        airplaneSelect.add(values.aircraftId, values.aircraftName);
    Object.assign(plane, values);
    /*
for(var p in values)
    if(values.hasOwnProperty(p)) {
        plane[p] = values[p];
    }*/

    if (!plane.model)
        createPlaneModel(plane);

    if (!window.plane)
        selectAirplane(plane.aircraftId);

    plane.altitudeShown = plane.altitude;
    if (plane.altitudeShown < plane.mapAltitude) plane.altitudeShown = plane.mapAltitude;
    plane.model.position = Cesium.Cartesian3.fromDegrees(plane.longitude, plane.latitude, plane.altitudeShown);
    var heading = plane.yaw + 270;
    if (heading >= 360) heading -= 360;

    plane.model.label.text = plane.aircraftName || plane.aircraftId.toString();
    plane.model.billboard.rotation = viewer.camera.heading - Cesium.Math.toRadians(plane.yaw);
    plane.model.orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(plane.longitude, plane.latitude, plane.altitudeShown),
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading),
            Cesium.Math.toRadians(plane.pitch),
            Cesium.Math.toRadians(plane.roll)
        )
    );
    plane.trace.add(plane.latitude, plane.longitude, plane.altitudeShown);
    if (needToGoToPlane) {
        needToGoToPlane = false;
        goToPlane();
    }
}

function goToPlane() {
    if (plane && (plane.longitude || plane.latitude))
        if (cameraMode == CameraMode.Free || cameraMode == CameraMode.Orthogonal) {
            viewer.camera.lookAt(
                Cesium.Cartesian3.fromDegrees(plane.longitude, plane.latitude, plane.altitudeShown),
                new Cesium.HeadingPitchRange(Cesium.Math.toRadians(plane.yaw), Cesium.Math.toRadians(-30), 100)
            );
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        }
}

describer.register("plane", () => {
    var p = planes[mouse.targetIndex];
    if (!p) return null;
    return (p.aircraftName + " (" + p.aircraftId + ")<br/>" + describer.getCoordinatesDescription(p));
});

airplaneSelect = {
    init: function () {
        this.selectItem = $("<select></select>", {
            id: "airplaneSelect",
            style: "float:left;"
        }).addClass("cesium-button");
        for (var aircraftId in planes)
            this.add(aircraftId, planes[aircraftId].aircraftName);
        $('#left-toolbar').prepend(this.selectItem);
        this.selectItem.change(function (e) {
            selectAirplane(e.target.value * 1);
            csharp.aircraftSelectionChanged(selectedAircraftId);
        });
    },
    add: function (aircraftId, aircraftName) {
        this.selectItem.append($('<option>', {value: aircraftId, text: aircraftName}));
    },
    remove: function (aircraftId) {
        this.selectItem.children("option[value=" + aircraftId + "]").remove();
    }
}

airplaneSelect.init();

$('#left-toolbar').append(
    $("<button></button>", {style: "float:left;"})
        .addClass("cesium-button")
        .text("Go to plane")
        .click(goToPlane)
);


var connectButton = $("<button></button>", {style: "float:left;"})
    .addClass("cesium-button")
    .text("Manage")
    .click(() => {
        csharp.manageAircrafts();
    });
$('#left-toolbar').prepend(connectButton);
connectButton.attr("disabled", false);
// Called from C#
// function setConnectionStatus(status) {
//     connectButton.attr("disabled", false);
//     isConnected = (status != "Disconnected");
//     connectButton.text(isConnected ? "Disconnect" : "Connect");
// }
