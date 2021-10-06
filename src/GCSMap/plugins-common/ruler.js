function createRuler() {
	var activeShapePoints = [];
	var activeShape;
	var floatingPoint;
	var mouseMoveHandler = null;
	var lastCoor = null;
	var lastSum = 0;
	var newSum = 0;
	
	eventHandler.setInputAction(function(event) {
		if (!window.enableMouseEvents) return;
		// We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
		// we get the correct point when mousing over terrain.
		var earthPosition = viewer.scene.pickPosition(event.position);
		// `earthPosition` will be undefined if our mouse is not over the globe.
		if (Cesium.defined(earthPosition)) {
			if (activeShapePoints.length === 0) {
				floatingPoint = viewer.entities.add({
					position : earthPosition,
					point : {
						color : Cesium.Color.WHITE,
						pixelSize : 5,
						heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
					}
				});
				activeShapePoints.push(earthPosition);
				var dynamicPositions = new Cesium.CallbackProperty(function () {
					return activeShapePoints;
				}, false);
				activeShape = viewer.entities.add({
					polyline : {
						positions : dynamicPositions,
						clampToGround : true,
						eyeOffset: 500,
						width : 3
					}
				});
				eventHandler.setInputAction(rulerMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.ALT);
				mouseMoveHandler = eventHandler.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
				eventHandler.setInputAction(releaseMouse, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			}
			activeShapePoints.push(earthPosition);
			lastCoor = Cesium.Ellipsoid.WGS84.cartesianToCartographic(earthPosition);
			lastCoor = {
				latitude: Cesium.Math.toDegrees(lastCoor.latitude),
				longitude: Cesium.Math.toDegrees(lastCoor.longitude)
			};
			lastSum = newSum;
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.ALT);

	function rulerMouseMove(event) {
		var newPosition = viewer.scene.pickPosition(event.endPosition);
		if (Cesium.defined(newPosition)) {
			floatingPoint.position.setValue(newPosition);
			activeShapePoints.pop();
			activeShapePoints.push(newPosition);
			var newCoor = Cesium.Ellipsoid.WGS84.cartesianToCartographic(newPosition);
			newCoor = {
				latitude: Cesium.Math.toDegrees(newCoor.latitude),
				longitude: Cesium.Math.toDegrees(newCoor.longitude)
			};
			var distance = GeoHelper.getDistance(lastCoor.latitude,lastCoor.longitude,newCoor.latitude,newCoor.longitude);
			var bearing = GeoHelper.getBearing(lastCoor.latitude,lastCoor.longitude,newCoor.latitude,newCoor.longitude);
			newSum = lastSum+distance;
			var info = "Total "+convert((newSum<20000)?"Distance":"LongDistance",newSum)+"<br/>Distance "+convert((distance<20000)?"Distance":"LongDistance",distance) + "<br/>Bearing: " + bearing.toFixed(1);
			tooltip.show(event.endPosition.x, event.endPosition.y, info)
		}
	}

	function releaseMouse() {
		viewer.entities.remove(floatingPoint);
		viewer.entities.remove(activeShape);
		floatingPoint = undefined;
		activeShape = undefined;
		activeShapePoints = [];
		eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.ALT);
		eventHandler.setInputAction(mouseMoveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		lastSum = newSum = 0;
		lastCoor = null;
		tooltip.hide();
	}
	
};

createRuler();