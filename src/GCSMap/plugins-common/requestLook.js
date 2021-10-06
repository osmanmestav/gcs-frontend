var lookPoint;

function createLookPoint(params) {
	lookPoint = viewer.entities.add({
		name: "lookPoint",
		allowPicking: false,
		position: Cesium.Cartesian3.fromDegrees(params.coordinates.longitude,params.coordinates.latitude),
		billboard: {
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			image: new Cesium.ConstantProperty(pinBuilder.fromText(params.tag,Cesium.Color.DARKBLUE, 48))
		}
	});
}

function setLookPoint(params) {
	if (!lookPoint) createLookPoint(params);
	else {
		lookPoint.position = Cesium.Cartesian3.fromDegrees(params.coordinates.longitude,params.coordinates.latitude);
		lookPoint.billboard.image = new Cesium.ConstantProperty(pinBuilder.fromText(params.tag,Cesium.Color.DARKBLUE, 48));
	}
}

if (window.instantContextMenu)
	instantContextMenu.addItem(
		"Request look",
		(e)=> csharp.requestLook(e.coordinates.latitude.toFixed(7),e.coordinates.longitude.toFixed(7),e.coordinates.altitude.toFixed())
	);