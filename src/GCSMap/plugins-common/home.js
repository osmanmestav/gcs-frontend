var home = viewer.entities.add({
	name: "Home",
	billboard: {
		image: pinBuilder.fromText("H", Cesium.Color.RED, 48),
		verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		eyeOffset: new Cesium.Cartesian3(0,0,-100)
	},
	polyline: {
		width: 1,
		followSurface: false,
		material: Cesium.Color.WHITE
	}
});


window.addEventListener("HomeChanged", (e)=> {
    setMapHome(e.detail);
});

function setMapHome(coordinates)
{
	home.coordinates = coordinates;
    home.position = Cesium.Cartesian3.fromDegrees(coordinates.longitude,coordinates.latitude,coordinates.altitude);
    home.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([coordinates.longitude,coordinates.latitude,coordinates.altitude,coordinates.longitude,coordinates.latitude,-1000]);
}

// API integrations

describer.register(home.name,()=> (home.name+"<br/>"+describer.getCoordinatesDescription(home.coordinates)) );
