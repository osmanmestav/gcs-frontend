
var beacon;

function createBeacon() {
	beacon = {};
	beacon.model = viewer.entities.add({
		name: "Beacon",
        billboard: {
            image: pinBuilder.fromText("B", Cesium.Color.BLUE, 48),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			eyeOffset: new Cesium.Cartesian3(0,0,-100)
        },
        polyline: {
            width: 1,
            followSurface: false,
            material: Cesium.Color.WHITE
        }
    });
}

function setBeacon(info)
{
	if (!beacon)
		createBeacon();
    beacon.model.position = Cesium.Cartesian3.fromDegrees(info.longitude,info.latitude,info.altitude);
    beacon.model.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([info.longitude,info.latitude,info.altitude,info.longitude,info.latitude,-1000]);
	
	for(var p in info) 
		if(info.hasOwnProperty(p))
			beacon[p] = info[p];

    window.dispatchEvent(new CustomEvent('beaconChanged', { detail: info }));
}