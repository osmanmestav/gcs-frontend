var rtkBase = null;

function createRTKBase() {
	return viewer.entities.add({
		name: "RTK Base",
		billboard: {
			image: pinBuilder.fromText("RTK", Cesium.Color.BLUE, 64),
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			eyeOffset: new Cesium.Cartesian3(0,0,-1000)
		},
		polyline: {
			width: 1,
			followSurface: false,
			material: Cesium.Color.WHITE
		},
		ellipse: {
			semiMinorAxis : 0,
			semiMajorAxis : 0,
			outline : true,
			outlineColor : Cesium.Color.WHITE,
			fill: false
		},
		allowPicking: false
	});
}

function setRTKBaseCoordinates(coor, accuracy)
{
	var zoom = false;
	if (!rtkBase) {
		rtkBase = createRTKBase();
		zoom = true;
	}
	if (accuracy>100) accuracy = 100;
	rtkBase.coordinates = coor;
    rtkBase.position = Cesium.Cartesian3.fromDegrees(coor.longitude,coor.latitude,coor.altitude);
    rtkBase.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([coor.longitude,coor.latitude,coor.altitude,coor.longitude,coor.latitude,-1000]);
	rtkBase.ellipse.semiMinorAxis = rtkBase.ellipse.semiMajorAxis = accuracy;
	
	if (zoom)
		viewer.zoomTo(viewer.entities);
}

(contextMenus["RTK Base"] = new ContextMenu())
.addItem(
	"Set home",
	()=> setHomePointFromMap({ latitude: rtkBase.coordinates.latitude, longitude: rtkBase.coordinates.longitude, altitude: rtkBase.coordinates.altitude })
);