var vtolLandingContainer = null;
var vtolLandingVisual = null;

function VtolLandingVisual(svgId) {
	var landingCircleRadiusInMeters = 5;
	var marginInMeters = 20;
	var minAirplaneScale = 0.5;
	var svg = this.svg = document.getElementById(svgId);
	var platform = svg.getElementById("platform");
	var height = this.height = svg.getAttribute("height");
	var width = this.width = svg.getAttribute("width")-height/2;
	var maxScale = Math.min(width/50,height/12);
	var minScale = Math.max(width/350,height/100);
	
	var distanceToWayPoint = svg.getElementById("distanceToWayPoint");
	var hoverTime = svg.getElementById("hoverTime");
	var aglAltitude = svg.getElementById("aglAltitude");
	var airplane = svg.getElementById("airplane");
	var landingPoint = svg.getElementById("landingPoint");
	var defaultScale = landingCircleRadiusInMeters/landingPoint.getAttribute("r");
	minScale *= defaultScale;
	maxScale *= defaultScale;
	var trace = svg.getElementById("trace");
	delete trace["id"];
	var traces = [trace];
	var count = 10;
	this.reference = null;
	for(var i=count-1;i>=1;i--) {
		var clone = trace.cloneNode();
		clone.setAttribute("r",1+(i-1)/2);
		clone.style.fillOpacity = i/count;
		svg.getElementById("traces").appendChild(clone);
		traces.push(clone);
	}
	var lastUpdate = new Date().getTime();
	this.reset = function() { this.reference = null; traces.forEach(function(t){ t.setAttribute("cx",-5000); }); }
	this.getXY = function(latitude,longitude) {
		var distance = GeoHelper.getDistance(latitude,longitude,values.latitudeSP,values.longitudeSP);
		var bearing = 0;
		if (distance>1) 
			bearing = GeoHelper.getBearing(latitude,longitude,values.latitudeSP,values.longitudeSP);
		var a = GeoHelper.toRadians(180+bearing);
		var result = { X: Math.cos(a)*distance, Y: Math.sin(a)*distance, bearing: bearing, distance: distance };
		return result;
	}
	this.updateReferences = function() {
		var r = this.getXY(values.latitude,values.longitude);
		r.scale = width/(r.distance+marginInMeters)*defaultScale;
		if (r.distance<landingCircleRadiusInMeters/2 && this.reference) r.bearing = this.reference.bearing;
		if (r.scale<minScale) r.scale = minScale;
		else if (r.scale>=maxScale) r.scale = maxScale;
		if (this.reference) {
			r.scale = (r.scale-this.reference.scale)*0.1+this.reference.scale;
			var dif = GeoHelper.mapAngleToPIRange(r.bearing-this.reference.bearing);
			r.bearing = dif*0.1+this.reference.bearing;
		}
		this.reference = r;
	}
	this.update = function() {
		if (vtolLandingContainer.style.visibility == "hidden") return;
		if (!values.currentCommand.endsWith("VtolLand")) {
			vtolLandingContainer.style.visibility = "hidden";
			dataTableContainer.style.visibility = "visible";
			this.reset();
			return;
		}
		this.updateReferences();
		
		// update texts
		distanceToWayPoint.innerHTML = units.getAltitudeSt(this.reference.distance);
		hoverTime.innerHTML = values.hoverTime;
		aglAltitude.innerHTML = values.aglAltitude;
		// update airplane
		var p = { X: this.reference.X/defaultScale, Y: this.reference.Y/defaultScale, scale: (this.reference.scale<minAirplaneScale)? (minAirplaneScale/this.reference.scale): 1 };
		airplane.setAttribute("transform","translate("+p.X+" "+p.Y+") rotate("+values.yaw+" 0 0) scale("+p.scale+" "+p.scale+")");
		
		// shift traces once in a second
		if (lastUpdate+1000<new Date().getTime()) {
			var c = { };
			for(var i=0;i<traces.length;i++)
			{
				var t = traces[i];
				c.X = t.getAttribute("cx")*1;
				c.Y = t.getAttribute("cy")*1;
				t.setAttribute("cx", p.X);
				t.setAttribute("cy", p.Y);
				p.X = c.X;
				p.Y = c.Y;
			};
		}
		platform.setAttribute("transform","rotate("+(-this.reference.bearing)+" 0 0) scale("+this.reference.scale+" "+this.reference.scale+") ");
	}
	gauges.push(this);
	return this;
}

loadSvg("vtolLandingContainer","svg/vtolLanding.svg",function() {
	vtolLandingContainer = document.getElementById("vtolLandingContainer");
	vtolLandingVisual = new VtolLandingVisual("vtolLanding");
});