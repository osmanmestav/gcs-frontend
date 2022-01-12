var geoFenceMinAlt, geoFenceMaxAlt, geoFence = [];

var geoFenceReturn = viewer.entities.add({
    name: "geoFenceReturn:0",
    billboard: {
        image: pinBuilder.fromText("R", Cesium.Color.BLACK, 48),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    },
    polyline: {
        width: 0.5,
        followSurface: false,
        material: Cesium.Color.WHITE
    }
});

window.addEventListener("GeoFenceChanged", (e) => {
    refreshGeoFence(e.detail);
});

window.addEventListener("GeoFenceVisible", (e) => {
    refreshGeoFence(e.detail);
});

function refreshGeoFence(pGeoFence) {
    while (pGeoFence.points.length < geoFence.length && geoFence.length) {
        var item = geoFence.pop();
        viewer.entities.remove(item.marker);
        viewer.entities.remove(item.line);
    }

    if (pGeoFence.points.length < 3) geoFenceReturn.show = false;
    else {
        geoFenceReturn.show = true;
        geoFenceMinAlt = pGeoFence.minAltitude;
        geoFenceMaxAlt = pGeoFence.maxAltitude;
        geoFenceReturn.latitude = pGeoFence.returnPoint.latitude;
        geoFenceReturn.longitude = pGeoFence.returnPoint.longitude;
        geoFenceReturn.altitude = (geoFenceMinAlt + geoFenceMaxAlt) / 2;
        geoFenceReturn.position = Cesium.Cartesian3.fromDegrees(pGeoFence.returnPoint.longitude, pGeoFence.returnPoint.latitude, geoFenceReturn.altitude);
        geoFenceReturn.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([
            pGeoFence.returnPoint.longitude, pGeoFence.returnPoint.latitude, geoFenceReturn.altitude,
            pGeoFence.returnPoint.longitude, pGeoFence.returnPoint.latitude, -1000
        ]);

        while (pGeoFence.points.length > geoFence.length) {
            var point = {};

            point.marker = viewer.entities.add({
                name: "geoFenceMarker:" + (geoFence.length),
                billboard: {
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                },
                polyline: {
                    width: 0.5,
                    followSurface: false,
                    material: Cesium.Color.WHITE
                }
            });

            point.line = viewer.entities.add({
                name: "geoFenceSide:" + geoFence.length,
                wall: {
                    material: Cesium.Color.BLACK.withAlpha(0.3),
                    outline: true,
                    outlineColor: Cesium.Color.WHITE
                }
            });

            geoFence.push(point);
        }

        for (var i = 0; i < pGeoFence.points.length; i++) {
            var inext = (i + 1) % (pGeoFence.points.length);
            var latitude = geoFence[i].latitude = pGeoFence.points[i].latitude;
            var longitude = geoFence[i].longitude = pGeoFence.points[i].longitude;
            var latitudeNext = geoFence[inext].latitude = pGeoFence.points[inext].latitude;
            var longitudeNext = geoFence[inext].longitude = pGeoFence.points[inext].longitude;
            var g = geoFence[i];

            g.marker.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, geoFenceMaxAlt);
            g.marker.billboard.image = new Cesium.ConstantProperty(pinBuilder.fromText((i + 1).toString(), Cesium.Color.BLACK, 48));
            g.marker.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, geoFenceMaxAlt, longitude, latitude, -1000]);
            g.line.wall.positions = Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, geoFenceMaxAlt, longitudeNext, latitudeNext, geoFenceMaxAlt]);
            g.line.wall.minimumHeights = [geoFenceMinAlt, geoFenceMinAlt];
        }
    }
}



