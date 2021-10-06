
var mouse = {
	position: null,
	target: null,
	targetType: null,
	targetIndex: null,
	coordinates: null,
	dragDropHandlers: {},
	currentDragHandler: null,
	init: function() {
		eventHandler.setInputAction((e)=>this.mouseMove(e), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		eventHandler.setInputAction((e)=>this.leftDown(e), Cesium.ScreenSpaceEventType.LEFT_DOWN);
	},
	registerDragDropHandler: function(targetType,handler) {
		this.dragDropHandlers[targetType] = handler; // { start(),drag(),drop() }
	},
	updateCoordinates: function(position) {
		this.position = position;
		this.coordinates = getCoordinatesFromScreenPositionUsingTerrain(position,(c)=> { this.coordinates.altitude=c.altitude; });
	},
	update: function(position) {
		this.updateCoordinates(position);
		var target = this.target = viewer.scene.pick(position);
		var targetType,targetIndex;
		if(target != undefined)
		{
			var id = target.id.name;
			if (id!=undefined) {
				var parts = id.split(":");
				targetType = parts[0];
				targetIndex = parts[1];
				var i = parseInt(targetIndex);
				if (targetIndex==i) targetIndex=i;
			}
		}
		this.targetType = targetType;
		this.targetIndex = targetIndex;
	},
	mouseMove: function (movement) {
		this.update(movement.endPosition);
		if (window.updateMouseInfoBar) updateMouseInfoBar();
		if (window.describer) describer.describe();
	},
	leftDown: function(movement) {
		this.update(movement.position);
		this.currentDragHandler = this.dragDropHandlers[this.targetType];
		if (this.currentDragHandler) {
			if (this.currentDragHandler.start && this.currentDragHandler.start(this.coordinates,this.target)===false)
				return;
			if (window.tooltip) tooltip.hide();
			viewer.scene.screenSpaceCameraController.enableInputs = false;
			eventHandler.setInputAction((e)=>this.drag(e), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			eventHandler.setInputAction((e)=>this.drop(e), Cesium.ScreenSpaceEventType.LEFT_UP);
		}
	},
	drag: function(movement) {
		if (!this.currentDragHandler) return;		
		this.updateCoordinates(movement.endPosition);
		if (window.updateMouseInfoBar) updateMouseInfoBar();
		if (this.currentDragHandler.drag)
			this.currentDragHandler.drag(this.coordinates,this.target);
	},
	drop: function(movement) {
		this.updateCoordinates(movement.position);
		if (!this.currentDragHandler) return;
		if (this.currentDragHandler.drop)
			this.currentDragHandler.drop(this.coordinates,this.target);
		this.currentDragHandler = null;
		eventHandler.setInputAction((e)=>this.mouseMove(e), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		viewer.scene.screenSpaceCameraController.enableInputs = true;
	}
};

mouse.init();