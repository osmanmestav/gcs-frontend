
function Trace() {
	this.init = function(style,limit) {
		this.visible = true;
		this.style = style;
		this.limit = limit;
		this.points = [];
		this.walls = [];
		this.__ready = true;
	};
	
	this.add = function(latitude, longitude, altitude) {
		var point = {
			latitude: latitude,
			longitude: longitude,
			altitude: altitude
		};
		this.addPoint(point);
	};
	
	this.addPoint = function(point) {
		if (!this.__ready) return;
		if(this.points.length==0 || !(this.isClose(point,this.points[this.points.length-1]))) {
			var count = this.points.push(point);
			if (count > 1) this.walls.push(this.createLine(this.points[count - 1], this.points[count - 2]));
			if (count == this.limit) {
				viewer.entities.remove(this.walls[0]);
				this.points.shift();
				this.walls.shift();
			}

		}
	};

	this.setVisibility = function(value) {
		if(this.visible == value) return;
		this.visible = value;
		for(var i=0; i < this.walls.length; i++)
		 this.walls[i].show = value;		
	};
	
	this.show = function() {
		this.setVisibility(true);
	};
	
	this.hide = function() {
		this.setVisibility(false);
	};
	
	this.toggle = function() {
		this.setVisibility(!(this.visible));
	};
	
	this.createLine = function(point1, point2) {
		var result = viewer.entities.add({
			wall: {
				positions : Cesium.Cartesian3.fromDegreesArrayHeights([
					point1.longitude, point1.latitude, point1.altitude,
					point2.longitude, point2.latitude, point2.altitude
				]),
				material : this.style.wall
			},
			polyline: {
				positions : Cesium.Cartesian3.fromDegreesArrayHeights([
					point1.longitude, point1.latitude, point1.altitude,
					point2.longitude, point2.latitude, point2.altitude
				]),
				followSurface : false,
				material : this.style.line
			},
			show : this.visible
		});
		return result;
	};

	this.clear = function() {
		if (this.walls) {
			for(var i=0; i < this.walls.length; i++)
				viewer.entities.remove(this.walls[i]);
			this.walls.length = 0;
		}
		if (this.points)
			this.points.length = 0;
	};
	
	this.isClose = function(a,b) {
		var lat = a.latitude-b.latitude;
		var lng = a.longitude-b.longitude;
		var alt = Math.abs(a.altitude-b.altitude);
		var dis = Math.sqrt(lat*lat + lng*lng);
		if(parseFloat(dis) > 0.0001) return false;
		if(parseInt(alt) > 5) return false;
		return true;
	};
	return this;
}
