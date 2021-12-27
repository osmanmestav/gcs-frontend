function isWaypointSelected(index) {
    return (selectedWaypointIndices.indexOf(index) >= 0);
}

function selectWaypoint(index) {
    if (selectedWaypointIndices.indexOf(index) >= 0) return;
    csharp.selectWaypoint(index);
}

function deselectWaypoint(index) {
    if (selectedWaypointIndices.indexOf(index) < 0) return;
    csharp.deselectWaypoint(index);
}

function reverseSelectionWaypoint(index) {
    if (index < 0 || !waypoints[index]) return;
    if (selectedWaypointIndices.indexOf(index) >= 0)
        csharp.deselectWaypoint(index);
    else
        csharp.selectWaypoint(index);
}

function findCommandStartAndEndAt(index) {
    var r = {start: index, end: index};

    if (r.start > 1 && waypoints[r.start - 2] && waypoints[r.start - 2].isLandingApproach) {
        r.start -= 2;
        return r;
    }
    if (r.start && waypoints[r.start - 1] && waypoints[r.start - 1].isLandingApproach) {
        r.start--;
        r.end++;
        return r;
    }
    if (waypoints[r.start] && waypoints[r.start].isLandingApproach) {
        r.end += 2;
        r.count += 2;
        return r;
    }
    if (waypoints[r.start] && waypoints[r.start].isTakeoff)
        r.start--;
    if (waypoints[r.start] && waypoints[r.start].isVtolSpeedUp)
        r.start--;
    if (waypoints[r.end] && waypoints[r.end].isVtolTakeOff)
        r.end++;
    if (waypoints[r.end] && waypoints[r.end].isVtolSpeedUp || waypoints[r.end].isTaxiSpeedUp)
        r.end++;
    return r;
}

var selectedWaypointIndices = [];

window.addEventListener("WaypointSelectionChanged", (e) => selectWaypoints(Array.from(e.detail)));

window.addEventListener('WaypointsCleared', function () {
    selectedWaypointIndices = [];
}, false);

function selectWaypoints(indices) {
    var selected = {};
    selectedWaypointIndices.forEach(function (index) {
        selected[index] = true;
    });
    indices.forEach(function (index) {
        var waypoint = waypoints[index];
        if (selected[index])
            delete selected[index];
        else if (waypoint)
            waypoint.marker.billboard.color = Cesium.Color.GRAY;
    });
    selectedWaypointIndices.forEach(function (index) {
        var waypoint = waypoints[index];
        if (selected[index] && waypoint)
            waypoint.marker.billboard.color = undefined;
    });
    selectedWaypointIndices = indices;
}


window.addEventListener("WaypointRemoved", (e) => deleteWaypointMap(e.detail));

function deleteWaypointMap(index) {
    var waypoint = waypoints[index];

    viewer.entities.remove(waypoint.marker);
    if (index < waypoints.length - 1) viewer.entities.remove(waypoint.line);
    if (waypoint.isLoiter || waypoint.isLandingApproach) viewer.entities.remove(waypoint.circle);
    if (waypoint.isLanding) viewer.entities.remove(waypoint.runway);
    waypoints.splice(index, 1);

    for (var i = index; i < waypoints.length; i++) {
        waypoints[i].index = i;
        waypoints[i].marker.name = "waypoint:" + i;
        if (i < waypoints.length - 1) waypoints[i].line.name = "waypointLine:" + i;
        waypoints[i].marker.billboard.image = new Cesium.ConstantProperty(pinBuilder.fromText((i + 1).toString(), Cesium.Color.DARKGREEN, 48));
    }

    if (index > 0) {
        if (index == waypoints.length) viewer.entities.remove(waypoints[index - 1].line);
        else {
            var first = waypoints[index - 1];
            var second = waypoints[index];
            delete waypoints[index - 1].line.wall.positions;
            waypoints[index - 1].line.wall.positions = new Cesium.CallbackProperty(function () {
                return Cesium.Cartesian3.fromDegreesArrayHeights([
                    first.data.longitude, first.data.latitude, first.data.altitude,
                    second.data.longitude, second.data.latitude, second.data.altitude
                ]);
            }, false);
            waypoints[index - 1].line.polyline.positions = new Cesium.CallbackProperty(function () {
                return Cesium.Cartesian3.fromDegreesArrayHeights([
                    first.data.longitude, first.data.latitude, first.data.altitude,
                    second.data.longitude, second.data.latitude, second.data.altitude
                ]);
            }, false);
        }
    }
}

// API integration

mouse.registerDragDropHandler("waypoint", {
    dragIndex: null,
    pickedWaypointIndex: null,
    dragWaypointIndices: null,
    start: () => {
        if (window.csharp.isMissionEditable === false) return;
        if (mouse.targetIndex < 0) return false;
        var selected = mouse.targetIndex;
        var dragIndex = this.dragIndex = findCommandStartAndEndAt(selected);
        this.pickedWaypointIndex = selected;
        this.dragWaypointIndices = null;
        this.dragStartCoor = mouse.coordinates;

        var wp = waypoints[this.pickedWaypointIndex];
        wp.latitudeOriginal = wp.data.latitude;
        wp.longitudeOriginal = wp.data.longitude;

        if (waypoints[selected].isLandingApproach || waypoints[selected].isLandingTaxi || waypoints[selected].isVtolLand || waypoints[selected].isChuteLand) {
            setWaypointWallPositionProperty(selected, false);
            dragIndex.mid = dragIndex.start + 1;
            if (waypoints[dragIndex.end].isVtolLand || waypoints[dragIndex.end].isChuteLand) {
                dragIndex.pivot = dragIndex.end;
                dragIndex.other = dragIndex.mid;
            } else {
                dragIndex.pivot = dragIndex.mid;
                dragIndex.other = dragIndex.end;
            }

            waypoints[dragIndex.start].latitudeOriginal = waypoints[dragIndex.start].data.latitude;
            waypoints[dragIndex.start].longitudeOriginal = waypoints[dragIndex.start].data.longitude;
            waypoints[dragIndex.mid].latitudeOriginal = waypoints[dragIndex.mid].data.latitude;
            waypoints[dragIndex.mid].longitudeOriginal = waypoints[dragIndex.mid].data.longitude;
            waypoints[dragIndex.end].latitudeOriginal = waypoints[dragIndex.end].data.latitude;
            waypoints[dragIndex.end].longitudeOriginal = waypoints[dragIndex.end].data.longitude;

            waypoints[dragIndex.start].bearingOriginal = GeoHelper.getBearing(waypoints[dragIndex.pivot].latitudeOriginal, waypoints[dragIndex.pivot].longitudeOriginal, waypoints[dragIndex.start].latitudeOriginal, waypoints[dragIndex.start].longitudeOriginal);
            waypoints[dragIndex.other].bearingOriginal = GeoHelper.getBearing(waypoints[dragIndex.pivot].latitudeOriginal, waypoints[dragIndex.pivot].longitudeOriginal, waypoints[dragIndex.other].latitudeOriginal, waypoints[dragIndex.other].longitudeOriginal);

            waypoints[dragIndex.start].distance = GeoHelper.getDistance(waypoints[dragIndex.pivot].latitudeOriginal, waypoints[dragIndex.pivot].longitudeOriginal, waypoints[dragIndex.start].latitudeOriginal, waypoints[dragIndex.start].longitudeOriginal);
            waypoints[dragIndex.other].distance = GeoHelper.getDistance(waypoints[dragIndex.pivot].latitudeOriginal, waypoints[dragIndex.pivot].longitudeOriginal, waypoints[dragIndex.other].latitudeOriginal, waypoints[dragIndex.other].longitudeOriginal);

            waypoints[dragIndex.start].loiterExitAngleOriginal = waypoints[dragIndex.start].data.parameter.loiterExitAngle;
        } else {
            this.dragWaypointIndices = [];
            if ((selected == dragIndex.start + 1 && waypoints[dragIndex.start].isLandingApproach) ||
                waypoints[selected].isTakeoff || waypoints[selected].isTaxiSpeedUp || waypoints[selected].isVtolTakeOff || waypoints[selected].isVtolSpeedUp) {
                for (var i = dragIndex.start; i <= dragIndex.end; i++)
                    this.dragWaypointIndices.push(i);
            } else {
                selectedWaypointIndices.forEach(function (i) {
                    var r = findCommandStartAndEndAt(i);
                    if (r.start != r.end) return;
                    this.dragWaypointIndices.push(i);
                });
                if (this.dragWaypointIndices.indexOf(this.pickedWaypointIndex) < 0)
                    this.dragWaypointIndices.push(this.pickedWaypointIndex);
            }
            this.dragWaypointIndices.forEach(function (index) {
                setWaypointWallPositionProperty(index, false);
                var wp = waypoints[index];
                wp.latitudeOriginal = wp.data.latitude;
                wp.longitudeOriginal = wp.data.longitude;
            });
        }
    },
    drag: () => {
        if (window.csharp.isMissionEditable === false) return;
        var dragIndex = this.dragIndex;
        var selected = this.pickedWaypointIndex;
        var point = mouse.coordinates;
        var latOff = point.latitude - this.dragStartCoor.latitude;
        var lngOff = point.longitude - this.dragStartCoor.longitude;

        if (this.dragWaypointIndices)
            this.dragWaypointIndices.forEach(function (index) {
                var wp = waypoints[index];
                wp.data.latitude = wp.latitudeOriginal + latOff;
                wp.data.longitude = wp.longitudeOriginal + lngOff;
                refreshMapObjects(wp);
            });
        else if (waypoints[selected].isLandingApproach) {
            var approachPoint = waypoints[dragIndex.start];
            var pivotPoint = waypoints[dragIndex.pivot];
            var otherPoint = waypoints[dragIndex.other];
            var bearing = GeoHelper.getBearing(pivotPoint.latitudeOriginal, pivotPoint.longitudeOriginal, point.latitude, point.longitude);
            var diff = bearing - approachPoint.bearingOriginal;

            if (otherPoint.distance > 1) {
                otherPoint.bearing = otherPoint.bearingOriginal + diff;
                destination = GeoHelper.getDestination(
                    pivotPoint.latitudeOriginal,
                    pivotPoint.longitudeOriginal,
                    otherPoint.bearing,
                    otherPoint.distance);
                otherPoint.data.latitude = destination.x;
                otherPoint.data.longitude = destination.y;
            }
            approachPoint.bearing = approachPoint.bearingOriginal + diff;
            destination = GeoHelper.getDestination(pivotPoint.latitudeOriginal, pivotPoint.longitudeOriginal, approachPoint.bearing, approachPoint.distance);
            approachPoint.data.latitude = destination.x;
            approachPoint.data.longitude = destination.y;

            var loiterExitAngle = approachPoint.loiterExitAngleOriginal + diff;
            while (loiterExitAngle > 360) loiterExitAngle -= 360;
            while (loiterExitAngle < 0) loiterExitAngle += 360;
            approachPoint.data.parameter.loiterExitAngle = loiterExitAngle;

            refreshMapObjects(approachPoint);
            refreshMapObjects(pivotPoint);
            refreshMapObjects(otherPoint);
        } else if (waypoints[selected].isLandingTaxi) {
            waypoints[selected].bearing = GeoHelper.getBearing(waypoints[selected - 1].latitudeOriginal, waypoints[selected - 1].longitudeOriginal, point.latitude, point.longitude);
            var angle = waypoints[selected].bearing - waypoints[selected].bearingOriginal;
            var distance = GeoHelper.getDistance(waypoints[selected - 1].latitudeOriginal, waypoints[selected - 1].longitudeOriginal, point.latitude, point.longitude);
            waypoints[selected].distance = Math.abs(Math.cos(GeoHelper.toRadians(angle))) * distance;
            var destination = GeoHelper.getDestination(waypoints[selected - 1].latitudeOriginal,
                waypoints[selected - 1].longitudeOriginal,
                waypoints[selected].bearingOriginal,
                waypoints[selected].distance);
            waypoints[selected].data.latitude = destination.x;
            waypoints[selected].data.longitude = destination.y;
            waypoints[selected - 1].data.parameter.landingLongitudinalTolerance = waypoints[selected].distance;

            refreshMapObjects(waypoints[selected]);
            refreshMapObjects(waypoints[selected - 1]);
        }
    },
    drop: () => {
        if (window.csharp.isMissionEditable === false) return;
        var selected = this.pickedWaypointIndex;
        var dragIndex = this.dragIndex;
        if (this.dragWaypointIndices)
            this.dragWaypointIndices.forEach(function (index) {
                setWaypointWallPositionProperty(index, true);
                var wp = waypoints[index];
                csharp.changeWaypoint(index, wp.data.latitude, wp.data.longitude, wp.data.altitude);
            });
        else {
            setWaypointWallPositionProperty(selected, true);
            var longitude = waypoints[selected].data.longitude;
            var latitude = waypoints[selected].data.latitude;
            var altitude = waypoints[selected].data.altitude;
            if (waypoints[selected].isLanding) csharp.changeLanding(selected, latitude, longitude, waypoints[selected].data.altitude);
            else if (waypoints[selected].isLandingApproach) {
                if (waypoints[selected + 2].isVtolLand || waypoints[selected + 2].isChuteLand) {
                    csharp.changeApproachLandingPoint(selected, waypoints[selected].data.latitude, waypoints[selected].data.longitude, waypoints[selected].data.altitude, waypoints[selected].data.parameter.loiterExitAngle.toFixed(2));
                    csharp.changeWaypoint(selected + 1, waypoints[selected + 1].data.latitude, waypoints[selected + 1].data.longitude, waypoints[selected + 1].data.altitude);
                    csharp.changeWaypoint(selected + 2, waypoints[selected + 2].data.latitude, waypoints[selected + 2].data.longitude, waypoints[selected + 2].data.altitude);
                } else
                    csharp.changeLandingBearing(selected + 1, waypoints[selected + 2].bearing);
            } else if (waypoints[selected].isLandingTaxi) csharp.changeLandingRunway(selected - 1, waypoints[selected - 1].data.parameter.landingLongitudinalTolerance);
            else if (dragIndex && (waypoints[dragIndex.end].isTakeoff || waypoints[dragIndex.end].isVtolLand || waypoints[dragIndex.end].isChuteLand)) {
                for (var i = dragIndex.start; i <= dragIndex.end; i++)
                    csharp.changeWaypoint(i, waypoints[i].data.latitude, waypoints[i].data.longitude, waypoints[i].data.altitude);
            }
        }
        this.dragIndex = null;
        this.pickedWaypointIndex = null;
        this.dragWaypointIndices = null;
        this.dragStartCoor = null;
    }
});

mouse.registerDragDropHandler("currentWaypoint", mouse.dragDropHandlers.waypoint);

eventHandler.setInputAction(function (click) {
    if (window.enableMouseEvents)
        if (mouse.targetIndex >= 0)
            reverseSelectionWaypoint(mouse.targetIndex);
        else
            csharp.clearSelection();
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

eventHandler.setInputAction(function (click) {
    if (window.enableMouseEvents)
        addWaypointData(mouse, "Waypoint");
}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

eval(csharp.getCommands())
    .forEach((c) => contextMenus.default.addItem(c, (e) => addWaypointData(e, c)));

contextMenus.waypoint = new ContextMenu();
contextMenus.waypoint.onshow = (e) => {
    if (!isWaypointSelected(e.targetIndex)) {
        csharp.clearSelection();
        selectWaypoint(e.targetIndex);
    }
}
contextMenus.waypoint.addItem("Edit waypoint", (e) => editWaypoint(e));
contextMenus.waypoint.addItem("Build Scan Path", () => buildScanPath());
contextMenus.waypoint.addItem("Delete waypoint", () => deleteWaypointData());
contextMenus.waypoint.addItem("Jump", (e) => jumpToWaypoint(e));

contextMenus.waypointLine = new ContextMenu();
eval(csharp.getCommands())
    .forEach((c) => contextMenus.waypointLine.addItem(c, (e) => addWaypointData(e, c)));

var items = [
    {title: "Takeoff-Runway", handler: () => setTakeoff()},
    {title: "Takeoff-Vtol", handler: () => setVtolTakeoff()},
    {title: "Takeoff-Launch", handler: () => setLaunch()},
    {title: "Land-Runway", handler: () => setLanding()},
    {title: "Land-Vtol", handler: () => setVtolLanding()},
    {title: "Land-Parachute", handler: () => setChuteLanding()}
];

if (!contextMenus.plane)
    contextMenus.plane = new ContextMenu();
items.forEach((i) => contextMenus.plane.addItem(i.title, i.handler));

instantContextMenu.addItem("Loiter here", (e) => {
    csharp.instantCommandIssue("LoiterUnlimited", e.coordinates.latitude, e.coordinates.longitude, plane.altitude, 1, 0);
});

//instantContextMenu.addItem("Taxi to here", (e)=> { csharp.instantCommandIssue("TaxiToPoint",e.coordinates.latitude,e.coordinates.longitude,plane.altitude,0,0); });

function addWaypointData(e, command) {
    if (!e.coordinates) return;
    var index = -1;
    if (e.targetIndex !== undefined) {
        if (findCommandStartAndEndAt(e.targetIndex).end !== e.targetIndex)
            return; // Trying to add inbetween a command group
        index = e.targetIndex + 1;
    }
    csharp.addWaypoint(index, command, e.coordinates.latitude, e.coordinates.longitude, e.coordinates.altitude, 0);
}

function setTakeoff() {
    csharp.setTakeoff(plane.latitude, plane.longitude, plane.altitude, plane.yaw);
}

function setLaunch() {
    csharp.setLaunch(plane.latitude, plane.longitude, plane.altitude, plane.yaw);
}

function setLanding() {
    csharp.setLanding(plane.latitude, plane.longitude, plane.altitude, plane.yaw);
}

function setVtolTakeoff() {
    csharp.setVtolTakeoff(plane.latitude, plane.longitude, plane.altitude, plane.yaw);
}

function setVtolLanding() {
    csharp.setVtolLanding(plane.latitude, plane.longitude, plane.altitude, plane.yaw);
}

function setChuteLanding() {
    csharp.setChuteLanding(plane.latitude, plane.longitude, plane.altitude, plane.yaw);
}

function editWaypoint(e) {
    csharp.editWaypoint(e.targetIndex);
}

function buildScanPath() {
    csharp.buildScanPath();
}

function deleteWaypointData() {
    csharp.deleteSelectedWaypoints();
}

function jumpToWaypoint(e) {
    csharp.jumpToWaypoint(e.targetIndex);
}
