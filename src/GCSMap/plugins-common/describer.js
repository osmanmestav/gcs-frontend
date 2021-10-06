
var describer = {
	model: null,
	material: null,
	outlineColor: null,
	handlers: {},
	defaultHandler: null,
	register: function(targetType,handler) {
		this.handlers[targetType] = handler;
	},
	getCoordinatesDescription: function(coordinates) {
		var result = "Latitude: "+coordinates.latitude.toFixed(7)+"<br/>Longitude: "+coordinates.longitude.toFixed(7);
		if (coordinates.altitude) result += "</br>Altitude: "+convert("Altitude",coordinates.altitude);
		return result;
	},
	getDistanceAndDirectionDescription: function(A,B) {
		if (A && B) {
			var lineDistance = GeoHelper.getDistance(A.latitude,A.longitude,B.latitude,B.longitude);
			var lineBearing = GeoHelper.getBearing(A.latitude,A.longitude,B.latitude,B.longitude);
			return "Distance: " + convert("Distance",lineDistance) + "<br/>Bearing: " + lineBearing.toFixed(1);
		}
		return null;
	},
	clear: function() {
		if(this.model)
		{
			this.model.material = this.material;
			this.model.outlineColor = this.outlineColor;
		}
		this.target = this.model = this.material = this.outlineColor = null;
		if (window.tooltip)
			tooltip.hide();
	},
	describe: function() {
		if (!this.target && !mouse.target) return;
		this.target = mouse.target;
		var result = { description: mouse.targetType, model: mouse.target };
		if (this.target) {
			var handler = this.handlers[mouse.targetType]||this.defaultHandler;
			if (handler) {
				if (jQuery.type(handler)=="object") {
					result.description = handler.description || result.description;
					result.model = handler.model || result.model;
				}
				else result.description = handler;
				if(jQuery.isFunction(result.description))
					result.description = result.description(mouse.target,mouse.targetType,mouse.targetIndex);
				if(jQuery.isFunction(result.model))
					result.model = result.model(mouse.target,mouse.targetType,mouse.targetIndex);
			}
		}
		
		if (window.tooltip)
			if (jQuery.type(result.description)==="string")
				tooltip.show(mouse.position.x,mouse.position.y,result.description);
			else
				tooltip.hide();
			
		if (this.model!==result.model) {
			if(this.model)
			{
				this.model.material = this.material;
				this.model.outlineColor = this.outlineColor;
			}
			this.model = this.material = this.outlineColor = null;
			if (result.model && Cesium.defined(result.model)) {
				this.model = result.model;
				this.material = this.model.material;
				this.outlineColor = this.model.outlineColor;
				this.model.material = Cesium.Color.YELLOW.withAlpha(0.3);
				this.model.outlineColor = Cesium.Color.BLACK;
			}
		}
	}
};