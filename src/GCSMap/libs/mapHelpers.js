function getCoordinatesFromCartesian(cartesian) {
	if (Cesium.defined(cartesian)) {
		var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
		return {
			cartographic: cartographic,
			latitude: Cesium.Math.toDegrees(cartographic.latitude),
			longitude: Cesium.Math.toDegrees(cartographic.longitude),
			altitude: cartographic.height
		};
	}
	return null;
}

function getCoordinatesFromScreenPositionUsingTerrain(position,callback) {
	var cartesian;
	if (window.cameraMode=="Orthogonal")
		cartesian = scene.camera.pickEllipsoid(position, Cesium.Ellipsoid.WGS84);
	else {
		var ray = viewer.camera.getPickRay(position);
		cartesian = viewer.scene.globe.pick(ray, viewer.scene);
	}
	var c = getCoordinatesFromCartesian(cartesian);
	if (c) {
		var promise = Cesium.sampleTerrain(viewer.terrainProvider, window.terrainLevelUsed, [c.cartographic]);
		Cesium.when(promise, function(updatedPositions) {
			c.altitude = updatedPositions[0].height||0;
			if (callback) callback(c);
		});
	}
	return c;
}

function getCoordinatesFromScreenPositionUsingDepthBuffer(position) {
	var cartesian = viewer.scene.pickPosition(position);
	return getCoordinatesFromCartesian(cartesian);
}

function updateMapAltitude(coor,callback)
{
	var cartographic = Cesium.Cartographic.fromDegrees(coor.longitude, coor.latitude);
    var promise = Cesium.sampleTerrain(viewer.terrainProvider, window.terrainLevelUsed, [cartographic]);
	Cesium.when(promise, function(updatedPositions) {
		coor.mapAltitude = updatedPositions[0].height || 0;
		if (callback) callback();
	});
}

// Called from C# side
window.__mapAltitudeRequests = [];
window.__mapAltitudeRequestLimit = 300;
window.__mapAltitudeRequestProcessorActive = false;
function requestMapAltitude(latitude,longitude,tag)
{
	var count = __mapAltitudeRequests.push({ latitude: latitude, longitude: longitude, tag: tag });
//	console.log("Adding request "+tag+"  count = "+count);
	if (!__mapAltitudeRequestProcessorActive) {
		__mapAltitudeRequestProcessorActive = true;
//		console.log("Started request processor");
		processMapAltitudeRequest(__mapAltitudeRequests.shift());
	}
	else
		while(__mapAltitudeRequests.length>__mapAltitudeRequestLimit)
			csharp.setMapAltitudeResponse(null,__mapAltitudeRequests.shift().tag);
}

function processMapAltitudeRequest(request) {
	__mapAltitudeRequestProcessorActive = true;
	var cartographic = Cesium.Cartographic.fromDegrees(request.longitude, request.latitude);
	var promise = Cesium.sampleTerrain(viewer.terrainProvider, window.terrainLevelUsed, [cartographic]);
	Cesium.when(promise, function(updatedPositions) {
		var altitude = updatedPositions[0].height;
		if (typeof(altitude)=="number")
			csharp.setMapAltitudeResponse(altitude.toFixed(1),request.tag);
		else
			csharp.setMapAltitudeResponse(null,request.tag);
//		console.log("Processed request "+request.tag);
		request = __mapAltitudeRequests.shift();
		if (request)
			processMapAltitudeRequest(request);
		else {
			__mapAltitudeRequestProcessorActive = false;
//			console.log("Stopped request processor");
		}
	});
}