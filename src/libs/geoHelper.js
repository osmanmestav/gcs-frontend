
var GeoHelper = {
	toDegrees: function(rad) { return rad * (180 / Math.PI); },
	toRadians: function(degrees) { return degrees * (Math.PI / 180); },

	mapAngleToPIRange: function(angle) { while (angle > 180) angle -= 360; while (angle <= -180) angle += 360; return angle; },

	// Following functions are adapted from http://www.movable-type.co.uk/scripts/latlong.html

	// Receives and returns degrees
	getBearing: function(lat1, lng1, lat2, lng2)
	{
		lat1 = this.toRadians(lat1);
		lng1 = this.toRadians(lng1);
		lat2 = this.toRadians(lat2);
		lng2 = this.toRadians(lng2);
		var y = Math.sin(lng1-lng2) * Math.cos(lat2);
		var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng1-lng2);
		var result = -this.toDegrees(Math.atan2(y, x));
		if(result < 0) result += 360;
		return result;
	},

	// Receives degrees, returns meters
	getDistance: function(lat1, lng1, lat2, lng2)
	{
		lat1 = this.toRadians(lat1);
		lat2 = this.toRadians(lat2);
		var a = Math.sin(lat1) * Math.sin(lat2);
		var b = Math.cos(lat1) * Math.cos(lat2) * Math.cos(this.toRadians(lng2 - lng1));
		return 6371000 * Math.acos(a + b);
	},

	getDestination: function(lat, lon, bearing, distance)
	{
		distance /= 6371000; // divide by earth radius to convert meters to radians
		bearing = this.toRadians(bearing);
		var lat1 = this.toRadians(lat);
		var lon1 = this.toRadians(lon);
	
		var lat2 = Math.asin(Math.sin(lat1)*Math.cos(distance) + Math.cos(lat1)*Math.sin(distance)*Math.cos(bearing));
		var lon2 = lon1 + Math.atan2(Math.sin(bearing)*Math.sin(distance)*Math.cos(lat1),Math.cos(distance)-Math.sin(lat1)*Math.sin(lat2));
		lat = this.toDegrees(lat2);
		lon = this.toDegrees(lon2);
		return { lat: lat, lon: lon, latitude: lat, longitude: lon, x: lat, y: lon };
	}

};
window.GeoHelper=GeoHelper;