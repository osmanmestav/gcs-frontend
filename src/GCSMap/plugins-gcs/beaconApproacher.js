
new PulldownMenu("Approach",[
	{ title: "Plan", handler: function() { 
		beaconApproacher.createSolution();
		// Restart approach if plan is inaction
		if (beaconApproacher.status!="Inactive")
			beaconApproacher.issueApproachTrack();
	} },
	{ title: "Execute", handler: function() {
		if (beaconApproacher.hasSolution && beaconApproacher.status=="Inactive")
			beaconApproacher.issueApproachTrack();
	} },
	{ title: "Stop", handler: function() {
		beaconApproacher.clearSolution();
		if (plane && plane.aircraftName.indexOf("SIM")>=0)
			resetDummyBeacon();
	} }
]);

function dummyBeacon() {
	if (beacon) {
		var c = GeoHelper.getDestination(beacon.latitude, beacon.longitude, beacon.groundCourse, beacon.groundSpeed);
		setBeacon({ latitude: c.latitude, longitude: c.longitude, groundSpeed: beacon.averageGroundSpeed-0.5+Math.random(), groundCourse: beacon.averageGroundCourse+Math.random() });
	}
	else
		resetDummyBeacon();
	if (beacon)
		setTimeout("dummyBeacon()",1000);
}

function resetDummyBeacon() {
	if (!plane || plane.latitude==0) return;
	var direction = Math.random()*360;
	c = GeoHelper.getDestination(plane.latitude, plane.longitude, direction, 10000);
	var info = {};
	info.latitude = c.latitude;
	info.longitude = c.longitude;
	info.groundSpeed = info.averageGroundSpeed = 5;
	info.groundCourse = info.averageGroundCourse = direction+80;
	info.altitude = 0;
	info.climbRate = 0;
    beaconApproacher.ship.groundCourseFilter.coefSum = 0;
	setBeacon(info);
}

function LowPassFilter(coef) {
	this.value = 0;
	this.coef = coef || 0.02;
	this.coefSum = 0;
	this.update = function(newValue) {
		this.coefSum += this.coef;
		if (this.coefSum>1) this.coefSum = 1;
		var scale = this.coef/this.coefSum;
		var diff = GeoHelper.mapAngleToPIRange(newValue-this.value);
		newValue = diff*scale+this.value;
		if (isFinite(newValue)) this.value = newValue;
		return this.value;
	};
	return this;
}

window.addEventListener('beaconChanged', function () {
	setTimeout(function() {
		beaconApproacher.filterBeaconInfo();
		beaconApproacher.update();
	},0);
});

window.addEventListener('planeChanged', function (e) {
	var plane = e.plane;
	if (plane!=window.plane) return;
	setTimeout(function() {
		if (!plane) return;
		beaconApproacher.filterWindInfo();
		if (plane.aircraftName && plane.aircraftName.indexOf("SIM")>=0 && !beacon)
			dummyBeacon();
	},0);
});

window.addEventListener('airplaneRemoved', function () {
	if (!plane)
		beaconApproacher.clearSolution();
});

window.addEventListener('currentWaypointChanged', function () {
	if (currentWaypoint.name!="LoiterUnlimited" || currentWaypoint.commandSource!="Instant" || beaconApproacher.status == "Inactive") return;
	
	if (beaconApproacher.status=="Started") {
		var distance = GeoHelper.getDistance(
				beaconApproacher.targetPoint.latitude, 
				beaconApproacher.targetPoint.longitude, 
				currentWaypoint.data.latitude, 
				currentWaypoint.data.longitude
			)+Math.abs(currentWaypoint.data.altitude-beaconApproacher.targetPoint.altitude);
		
		if (distance<5) {
			beaconApproacher.status = "IssuingApproach";
			beaconApproacher.issueApproachTarget();
		}
		return;
	}
	distance = GeoHelper.getDistance(
		beaconApproacher.endPoint.latitude, 
		beaconApproacher.endPoint.longitude, 
		currentWaypoint.data.latitude, 
		currentWaypoint.data.longitude
	)+Math.abs(currentWaypoint.data.altitude-beaconApproacher.endPoint.altitude);
	if (distance<5) {
		if (beaconApproacher.status=="IssuingApproach")
			beaconApproacher.status = "ApproachingTrack";
		beaconApproacher.adjustAirspeedForApproach();
	}
	else
		beaconApproacher.clearSolution();
});

var beaconApproacher = {
	// settings
	requiredShipDistance: 200, // meters
	crossPointPassDistance: 2500, // meters
	approachTrackDistanceTolerance: 150, // meters
	approachTrackAngleTolerance: 30, // degrees
	planeMinSpeed: 30,
	planeCruiseSpeed: 35, // meters/second
	planeMaxSpeed: 40,	
	approachTrackTimeAllowancePerGroundCourseError: 0.25, // seconds/degree
	airspeedAdjustInterval: 5, // seconds
	
	trackHeight: 50, // meters MSL
// Control loop settings
	shipAlignmentErrorRecoverTime: 10, // seconds
	airspeedOffset: 0,
	airspeedResetTime: 30, // seconds
	
	// private members
	ship: {
		groundSpeedFilter: new LowPassFilter(),
		groundCourseFilter: new LowPassFilter(),
		groundSpeed: 0,
		groundCourse: 0
	},
	wind: {
		speedFilter: new LowPassFilter(),
		directionFilter: new LowPassFilter(),
		speed: 0,
		direction: 0
	},
	status: "Inactive",
	filterBeaconInfo: function() {
		if (!beacon) return;
		this.ship.latitude = beacon.latitude;
		this.ship.longitude = beacon.longitude;
		this.ship.groundSpeed = this.ship.groundSpeedFilter.update(beacon.groundSpeed);
		if (this.ship.groundSpeed<1) this.ship.groundSpeed = 1;
		this.ship.groundCourse = this.ship.groundCourseFilter.update(beacon.groundCourse);
	},
	filterWindInfo: function() {
		if (!plane) return;
		this.wind.speed = this.wind.speedFilter.update(plane.wind);
		this.wind.direction = this.wind.directionFilter.update(plane.windDirection);
	},
	createModels: function() {
		this.shipTrackModel = viewer.entities.add({
			polyline: {
				width : 5.0,
				material : new Cesium.PolylineGlowMaterialProperty({
					color : Cesium.Color.DEEPSKYBLUE,
					glowPower : 0.25
				})
			}
		});
		this.planeTrackModel = viewer.entities.add({
			polyline: {
				width : 5.0,
				material : new Cesium.PolylineGlowMaterialProperty({
					color : Cesium.Color.DEEPSKYBLUE,
					glowPower : 0.25
				})
			}
		});
	},
	hasSolution: false,
	clearSolution: function() {
		this.status = "Inactive";
		this.planeTrackModel.show = false;
		this.shipTrackModel.show = false;
		this.hasSolution = false;
		$("#infoContainer").html("");
	},
	createSolution: function() {
		if (!beacon || !plane) return;
		var windDir = GeoHelper.toRadians(this.wind.direction-this.ship.groundCourse);
		var windX = Math.cos(windDir)*this.wind.speed;
		var windY = Math.sin(windDir)*this.wind.speed;
		var Vx = this.ship.groundSpeed-windX;
		var Vy = Math.sqrt(this.planeCruiseSpeed*this.planeCruiseSpeed-Vx*Vx);
		if (isNaN(Vy)) Vy = 0;
		var approachSpeed = Vy-windY;
		this.approachDirection = GeoHelper.mapAngleToPIRange(this.ship.groundCourse-90+GeoHelper.toDegrees(Math.atan2(this.ship.groundSpeed,approachSpeed)));
		var behindShipPoint = this.initialBehindShipPoint = this.behindShipPoint = GeoHelper.getDestination(this.ship.latitude,this.ship.longitude,this.ship.groundCourse+180,this.requiredShipDistance);
		var distance = GeoHelper.getDistance(this.behindShipPoint.latitude,this.behindShipPoint.longitude,plane.latitude,plane.longitude);
		var bearing = GeoHelper.getBearing(this.behindShipPoint.latitude,this.behindShipPoint.longitude,plane.latitude,plane.longitude);
		var angle = GeoHelper.toRadians(bearing-this.ship.groundCourse);
		var distanceX = distance*Math.cos(angle);
		var distanceY = distance*Math.sin(angle);
		var crossSpeed = Vx+this.planeCruiseSpeed*Math.sign(distanceX);
		var timeToCross = distanceY/approachSpeed+distanceX/crossSpeed+this.approachTrackTimeAllowancePerGroundCourseError*Math.abs(GeoHelper.mapAngleToPIRange(this.approachDirection-plane.groundCourse));
		this.crossPoint = GeoHelper.getDestination(this.ship.latitude,this.ship.longitude,this.ship.groundCourse,this.ship.groundSpeed*timeToCross-this.requiredShipDistance);
		this.endPoint = GeoHelper.getDestination(this.crossPoint.latitude,this.crossPoint.longitude,this.approachDirection,this.crossPointPassDistance);
		this.endPoint.altitude = plane.altitude;
		this.targetPoint = GeoHelper.getDestination(this.crossPoint.latitude, this.crossPoint.longitude, this.approachDirection+180, distanceY);
		this.targetPoint.altitude = plane.altitude;
		
		this.planeTrackModel.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([
			this.crossPoint.longitude, this.crossPoint.latitude, this.trackHeight,
			this.targetPoint.longitude, this.targetPoint.latitude, this.trackHeight
		]);
		
		this.hasSolution = true;
		this.planeTrackModel.show = true;
		this.shipTrackModel.show = true;
		this.update();
	},
	update: function() {
		if (!beacon || !plane || !this.hasSolution) return;
		var averageShipGroundCourse = this.averageShipGroundCourse = GeoHelper.getBearing(this.initialBehindShipPoint.latitude,this.initialBehindShipPoint.longitude,this.ship.latitude,this.ship.longitude);
		var behindShipPoint = this.behindShipPoint = GeoHelper.getDestination(this.ship.latitude,this.ship.longitude,averageShipGroundCourse,-this.requiredShipDistance);
		var distancePlaneToShipBehind = this.distancePlaneToShipBehind = GeoHelper.getDistance(plane.latitude,plane.longitude,behindShipPoint.latitude,behindShipPoint.longitude);
		var shipAlignedPoint = this.shipAlignedPoint = GeoHelper.getDestination(behindShipPoint.latitude,behindShipPoint.longitude,averageShipGroundCourse+90,distancePlaneToShipBehind);
		this.shipTrackModel.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights([
			this.ship.longitude, this.ship.latitude, this.trackHeight,
			behindShipPoint.longitude,behindShipPoint.latitude, this.trackHeight,
			shipAlignedPoint.longitude,shipAlignedPoint.latitude, this.trackHeight
		]);
	},
	issueApproachTrack: function() {
		this.status = "Started";
		this.planeTrackModel.show = true;
		this.shipTrackModel.show = true;
		csharp.instantCommandIssue("LoiterUnlimited",
			this.targetPoint.latitude.toFixed(7),
			this.targetPoint.longitude.toFixed(7),
			this.targetPoint.altitude.toFixed(1),
			"1","0");// Do not follow track
		csharp.setAirspeed(this.planeCruiseSpeed);
		
		// If command is not issued, change status back to inactive
		setTimeout(function() {
			if (beaconApproacher.status=="Started")
				beaconApproacher.clearSolution();
		},5000);
	},
	issueApproachTarget: function() {
		if (this.status!="IssuingApproach") return;
		csharp.instantCommandIssue("LoiterUnlimited",
			this.endPoint.latitude.toFixed(7),
			this.endPoint.longitude.toFixed(7),
			this.endPoint.altitude.toFixed(1),
			"1","1"); // Follow track
		csharp.setAirspeed(this.planeCruiseSpeed);		
		
		// If command is not issued, give it another shot in 5 seconds
		setTimeout(function() {
			beaconApproacher.issueApproachTarget();
		},5000);
	},
	adjustAirspeedForApproach: function() {
		if (this.status!="ApproachingTrack" && this.status != "ApproachingTarget") return;
		if (this.status=="ApproachingTrack")
		{
			var bearingPlaneToCrossPoint = GeoHelper.getBearing(plane.latitude,plane.longitude,this.crossPoint.latitude,this.crossPoint.longitude);
			var angle = GeoHelper.toRadians(bearingPlaneToCrossPoint-this.approachDirection);
			var distancePlaneToCrossPoint = GeoHelper.getDistance(plane.latitude,plane.longitude,this.crossPoint.latitude,this.crossPoint.longitude);
			if (this.status == "ApproachingTrack") {
				var distanceToApproachTrack = this.distanceToApproachTrack = distancePlaneToCrossPoint*Math.sin(angle);
				$("#infoContainer").html("ApproachTrackError = "+Math.round(distanceToApproachTrack)+"m");
				var approachAngleError = GeoHelper.mapAngleToPIRange(this.approachDirection-plane.groundCourse);
				if (Math.abs(distanceToApproachTrack)<this.approachTrackDistanceTolerance && Math.abs(approachAngleError)<=this.approachTrackAngleTolerance)
					this.status = "ApproachingTarget";
			}
		}
		if (this.status == "ApproachingTarget")
		{
			var bearingPlaneToShipBehind = this.bearingPlaneToShipBehind = GeoHelper.getBearing(plane.latitude,plane.longitude,this.behindShipPoint.latitude,this.behindShipPoint.longitude);
			degrees =  bearingPlaneToShipBehind-(this.averageShipGroundCourse-90);
			
			if (Math.abs(degrees)>=90) {
				this.clearSolution();
				csharp.setAirspeed(this.planeCruiseSpeed);
				setTimeout(function() {
					if (plane.aircraftName.endsWith("SIM"))
						resetDummyBeacon();
				},10);
				return;
			}
			
			angle = GeoHelper.toRadians(degrees);
			var shipAlignmentError = this.distancePlaneToShipBehind*Math.sin(angle); // ship alignment error
			var distanceToShipTrack = this.distancePlaneToShipBehind*Math.cos(angle); // distance to ship track
			
			angle = GeoHelper.toRadians(this.averageShipGroundCourse-plane.groundCourse);
			var shipTrackApproachSpeed = plane.groundSpeed*Math.sin(angle);
			var shipTrackAlignedSpeed = plane.groundSpeed*Math.cos(angle);
			
			// STARTS: Control loop
			var shipTrackAlignedSpeedSP = shipAlignmentError/this.shipAlignmentErrorRecoverTime+this.ship.groundSpeed;
			var speedError = shipTrackAlignedSpeedSP-shipTrackAlignedSpeed;
			if (isFinite(speedError)) {
				var offset = this.airspeedOffset + speedError*this.airspeedAdjustInterval/this.airspeedResetTime;
				if (isFinite(offset)) {
					this.airspeedOffset = offset;
					if (this.planeCruiseSpeed+this.airspeedOffset<this.planeMinSpeed)
						this.airspeedOffset = this.planeMinSpeed-this.planeCruiseSpeed;
					else
						if (this.planeCruiseSpeed+this.airspeedOffset>this.planeMaxSpeed)
							this.airspeedOffset = this.planeMaxSpeed-this.planeCruiseSpeed;
				}
				var airspeedSP = this.planeCruiseSpeed+this.airspeedOffset+speedError;
				if (airspeedSP<this.planeMinSpeed)
					airspeedSP = this.planeMinSpeed;
				else
					if (airspeedSP>this.planeMaxSpeed)
						airspeedSP = this.planeMaxSpeed;
				if (isFinite(airspeedSP))
					this.airspeedSP = airspeedSP;
			}
			var timeLeft = Math.round(distanceToShipTrack/shipTrackApproachSpeed);			
			$("#infoContainer").html("TimeLeft = "+timeLeft+"secs<br/>DistanceToTarget = " + Math.round(this.distancePlaneToShipBehind) + "m<br/>ShipAlignmentError = "+Math.round(shipAlignmentError)+"m");
			csharp.setAirspeed(this.airspeedSP);
			// ENDS: Control loop
		}

		setTimeout(function() {
			beaconApproacher.adjustAirspeedForApproach();
		},Math.round(this.airspeedAdjustInterval*1000));
	}
}

beaconApproacher.createModels();