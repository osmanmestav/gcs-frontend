
contextMenus.default.addItem("Add geofence", (e)=> csharp.addGeoFence(e.coordinates.latitude,e.coordinates.longitude,e.coordinates.altitude) );

contextMenus.geoFenceSide = new ContextMenu();
contextMenus.geoFenceSide.addItem("Add geofence point", (e)=> csharp.addGeoFencePoint(e.targetIndex+1,e.coordinates.latitude,e.coordinates.longitude) );

contextMenus.geoFenceMarker = new ContextMenu();
contextMenus.geoFenceMarker.addItem("Delete geofence point", (e)=> csharp.deleteGeoFencePoint(e.targetIndex) );

mouse.registerDragDropHandler("geoFenceMarker",{
	start: function() {
		var i = mouse.targetIndex;
		var g = geoFence[i];
		var b = geoFence[(i-1+geoFence.length)%geoFence.length];
		var n = geoFence[(i+1)%geoFence.length];

		g.marker.position = new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegrees(g.longitude, g.latitude,geoFenceMaxAlt);
		}, false);

		g.marker.polyline.positions = new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegreesArrayHeights([
				g.longitude, g.latitude,geoFenceMaxAlt,
				g.longitude, g.latitude,-1000
			]);
		}, false);

		g.line.wall.positions = new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegreesArrayHeights([
				g.longitude, g.latitude, geoFenceMaxAlt,
				n.longitude, n.latitude, geoFenceMaxAlt
			]);
		}, false);

		b.line.wall.positions = new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegreesArrayHeights([
				b.longitude, b.latitude, geoFenceMaxAlt,
				g.longitude, g.latitude, geoFenceMaxAlt
			]);
		}, false);
	},
	drag: function(coordinates) {
		var i = mouse.targetIndex;
		geoFence[i].latitude = coordinates.latitude;
		geoFence[i].longitude = coordinates.longitude;
	},
	drop: function(coordinates) {
		csharp.changeGeoFencePoint(mouse.targetIndex, coordinates.latitude, coordinates.longitude);
	}
});

mouse.registerDragDropHandler("geoFenceReturn",{
	start: function() {
		geoFenceReturn.position = new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegrees(geoFenceReturn.longitude, geoFenceReturn.latitude, geoFenceReturn.altitude);
		}, false);
		geoFenceReturn.polyline.positions = new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegreesArrayHeights([
				geoFenceReturn.longitude, geoFenceReturn.latitude, geoFenceReturn.altitude,
				geoFenceReturn.longitude, geoFenceReturn.latitude, -1000
			]);
		}, false);
	},
	drag: function(coordinates) {
		geoFenceReturn.latitude = coordinates.latitude;
		geoFenceReturn.longitude = coordinates.longitude;
		geoFenceReturn.altitude = coordinates.altitude;
	},
	drop: function(coordinates) {
		csharp.changeGeoFenceReturn(coordinates.latitude,coordinates.longitude);
	}
});