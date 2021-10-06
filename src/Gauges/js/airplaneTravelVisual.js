const MinAirplaneScale = 0.5;
const MinDistanceToFollowBearing = 3;
const RotateSmoothingFilterCoef = 0.3;
const ZoomSmoothingFilterCoef = 0.3;

class AirplaneVisual {
	constructor(containerId,svgId) {
		this.container = document.getElementById(containerId);
		
		// Common variables
		this.initialRotation = 0;
		this.translateX = 0;
		this.translateY = 0;
		this.markCoor = { latitude: 0, longitude: 0 };
		this.reference = null;
		
		// Command based variables
		this.landingCircleRadiusInMeters = 5;
		this.marginInMeters = 20;
		this.minWidthInMeters = 50;
		this.maxWidthInMeters = 500;
		this.minHeightInMeters = 12;
		this.maxHeightInMeters = 100;
		
		// Other
		this.svg = document.getElementById(svgId);
		this.platform = this.svg.getElementById("platform");
		this.progressBar = this.svg.getElementById("progressBar");
		this.vtolUAV = this.svg.getElementById("vtolUAV");
		this.chute = this.svg.getElementById("chute");
		this.chuteUAV = this.svg.getElementById("chuteUAV");
		this.airplane = this.vtolUAV;
		this.landingPoint = this.svg.getElementById("landingPoint");
		this.landingCircleRadius = this.landingPoint.r.baseVal.value;
		this.initialScale = this.landingCircleRadius/this.landingCircleRadiusInMeters;
		this.track = this.svg.getElementById("track");
		this.height = this.svg.getAttribute("height");
		this.width = this.svg.getAttribute("width");
		
		this.ignitionLed = this.svg.getElementById("ignitionLed");
		this.chuteLed = this.svg.getElementById("chuteLed");
		this.airspeedText = this.svg.getElementById("airspeed");
		this.timeLabel = this.svg.getElementById("timeLabel");
		this.timeText = this.svg.getElementById("time");
		this.aglAltitudeText = this.svg.getElementById("aglAltitude");
		this.distanceText = this.svg.getElementById("distance");
		
		this.width-=this.height/2;
		this.maxScale = Math.min(this.width/this.minWidthInMeters,this.height/this.minHeightInMeters)/this.initialScale;
		this.minScale = Math.max(this.width/this.maxWidthInMeters,this.height/this.maxHeightInMeters)/this.initialScale;
		
		var trace = this.svg.getElementById("trace");
		delete trace["id"];
		this.traces = [trace];
		var count = 10;
		for(var i=count-1;i>=1;i--) {
			var clone = trace.cloneNode();
			clone.setAttribute("r",1+(i-1)/2);
			clone.style.fillOpacity = i/count;
			this.svg.getElementById("traces").appendChild(clone);
			this.traces.push(clone);
		}
		this.lastUpdate = new Date().getTime();
		
		this.isCommand = { };
		this.lastCommand = "";
		gauges.push(this);
	}
	resetToVtol() {
		if (this.isCommand.VtolSpeedUp)
			this.track.style.visibility = "visible";
		this.landingCircleRadiusInMeters = 5;
		this.marginInMeters = 40;
		this.minWidthInMeters = 50;
		this.maxWidthInMeters = 500;
		this.minHeightInMeters = 12;
		this.maxHeightInMeters = 100;
		this.airplane = this.vtolUAV;
		this.vtolUAV.style.visibility = "visible";
		this.chuteUAV.style.visibility = "hidden";
		this.timeLabel.innerHTML = "HoverTime";
		this.isVtol = true;
		this.isChute = false;
	}
	resetToChute() {
		this.landingCircleRadiusInMeters = 20;
		this.marginInMeters = 200;
		this.minWidthInMeters = 250;
		this.maxWidthInMeters = 2500;
		this.minHeightInMeters = 50;
		this.maxHeightInMeters = 400;
		this.chuteRotate = 0;
		this.chuteScale = 0.1;

		this.airplane = this.chuteUAV;
		this.vtolUAV.style.visibility = "hidden";
		this.chuteUAV.style.visibility = "visible";
		this.timeLabel.innerHTML = "Time";
		this.isVtol = false;
		this.isChute = true;
	}
	reset() {
		this.reference = null;
		this.traces.forEach(function(t){ t.setAttribute("cx",-5000); });
		if (this.isCommand.VtolLand || this.isCommand.ChuteLand) {
			this.initialRotation = 0;
			this.translateX = 0;
			this.markCoor = { };
		}
		else {
			this.initialRotation = 180;
			this.translateX = -400;
			this.markCoor = { latitude: values.latitude, longitude: values.longitude };
		}
		this.chute.style.visibility = "hidden";
		
		if (this.isCommand.ChuteLand)
			this.resetToChute();
		else
			this.resetToVtol();
		this.initialScale = this.landingCircleRadius/this.landingCircleRadiusInMeters;
	}
	getXY(latitude,longitude) {
		var distance = GeoHelper.getDistance(latitude,longitude,this.markCoor.latitude||values.latitudeSP,this.markCoor.longitude||values.longitudeSP);
		var bearing = -values.yaw;
		if (distance>1) 
			bearing = GeoHelper.getBearing(latitude,longitude,this.markCoor.latitude||values.latitudeSP,this.markCoor.longitude||values.longitudeSP);
		var a = GeoHelper.toRadians(180+bearing);
		var result = { X: Math.cos(a)*distance*this.initialScale, Y: Math.sin(a)*distance*this.initialScale, bearing: bearing, distance: distance };
		return result;
	}
	updateReferences() {
		var rotate = this.initialRotation-this.airplane.coor.bearing;
		var scale = this.width/(this.airplane.coor.distance+this.marginInMeters)/this.initialScale;
		var ref = { rotate: rotate, scale: scale };
		if (this.airplane.coor.distance<MinDistanceToFollowBearing)
			ref.rotate = this.reference? this.reference.rotate : -values.yaw;
		if (ref.scale<this.minScale) ref.scale = this.minScale;
		else if (ref.scale>=this.maxScale) ref.scale = this.maxScale;
		if (this.reference) {
			this.reference.scale = (ref.scale-this.reference.scale)*ZoomSmoothingFilterCoef+this.reference.scale;
			var dif = GeoHelper.mapAngleToPIRange(ref.rotate-this.reference.rotate);
			this.reference.rotate = dif*RotateSmoothingFilterCoef+this.reference.rotate;
		}
		else this.reference = ref;
	}
	shouldShowVisual() {
		var result = false;
		this.isCommand = { };
		["VtolTakeOff","VtolSpeedUp","VtolLand","ChuteLand"].forEach((s)=> { var v = this.isCommand[s] = values.currentCommand.endsWith(s); result = result || v; });
		return result;
	}
	isVisible() {
		return this.container.style.visibility != "hidden";
	}
	show() {
		this.reset();
		this.container.style.visibility = "visible";
		dataTable.hide();
	}
	hide() {
		this.container.style.visibility = "hidden";
		this.track.style.visibility = "hidden";
		this.airplane.style.visibility = "hidden";
		this.chute.style.visibility = "hidden";
		this.ignitionLed.style.visibility = "hidden";
		dataTable.show();
	}
	update() {
		if (!this.shouldShowVisual()) {
			if (this.isVisible())
				this.hide();
			return;
		}
		if (!this.isVisible())
			this.show();
		if (this.lastCommand!=values.currentCommand) {
			this.reset();
			this.lastCommand = values.currentCommand;
		}
		
		if (!this.markCoor) this.markCoor = { latitude: values.latitude, longitude: values.longitude };
		this.airplane.coor = this.getXY(values.latitude,values.longitude);

		this.updateReferences();
		if (this.isCommand.VtolSpeedUp) {
			var trackDirection = GeoHelper.getBearing(this.markCoor.latitude,this.markCoor.longitude,values.latitudeSP,values.longitudeSP);
			this.track.setAttribute("transform","rotate("+trackDirection+" 0 0)");
		}

		// update this.airplane
		var p = { X: this.airplane.coor.X, Y: this.airplane.coor.Y, scale: (this.reference.scale<MinAirplaneScale)? (MinAirplaneScale/this.reference.scale): 1 };
		if (isNaN(p.X)||isNaN(p.Y)||isNaN(p.scale)) return;
		this.airplane.setAttribute("transform","translate("+p.X+" "+p.Y+") rotate("+values.yaw+" 0 0) scale("+p.scale+" "+p.scale+")");
		
		// shift this.traces once in a second
		if (this.lastUpdate+1000<new Date().getTime()) {
			var c = { };
			for(var i=0;i<this.traces.length;i++)
			{
				var t = this.traces[i];
				c.X = t.getAttribute("cx")*1;
				c.Y = t.getAttribute("cy")*1;
				t.setAttribute("cx", p.X);
				t.setAttribute("cy", p.Y);
				p.X = c.X;
				p.Y = c.Y;
			};
		}
		this.platform.setAttribute("transform","translate("+this.translateX+" "+this.translateY+") rotate("+this.reference.rotate+" 0 0) scale("+this.reference.scale+" "+this.reference.scale+") ");
		
		// Update others
		this.progressBar.setAttribute("transform","translate("+(this.width*(values.percentCompleted/100.0))+" 0)");
		this.distanceText.innerHTML = units.getAltitude(this.airplane.coor.distance);
		
		this.ignitionLed.style.visibility = values.isIgnitionSwitchActive? "visible" : "hidden";
		if (this.isVtol)
			this.timeText.innerHTML = values.hoverTime;
		else {
			this.timeText.innerHTML = values.remainingAmount.toFixed(0)+"sec";
			if (values.isLandingSwitchActive) {
				this.chuteRotate++;
				if (this.chuteScale<1) this.chuteScale *= 1.5;
				this.chute.setAttribute("transform","rotate("+this.chuteRotate+" 0 0) scale("+this.chuteScale+" "+this.chuteScale+")");
				this.chute.style.visibility = "visible";
			}
		}
		this.aglAltitudeText.innerHTML = values.aglAltitude;
		this.airspeedText.innerHTML = units.getSpeedSt(values.indicatedAirspeed);
	}
}

loadSvg("airplaneTravelVisualContainer","svg/airplaneTravelVisual.svg",function() {
	new AirplaneVisual("airplaneTravelVisualContainer","airplaneTravelVisual");
});
