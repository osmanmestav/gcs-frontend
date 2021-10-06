
function createRunway(latitude,longitude,altitude,landParam,runwayWidth,approachParam) {
	var halfRunwayLength = landParam.landingLongitudinalTolerance;
	var bearing = -approachParam.loiterExitAngle;
	var pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
	var orientation = Cesium.Transforms.headingPitchRollQuaternion(pos,new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(bearing),0,0));
	var runway = viewer.entities.add({
	  position: new Cesium.CallbackProperty(function() {
		  return pos;
	  }, false),
	  orientation: orientation,
	  box : {
		  dimensions : new Cesium.Cartesian3(runwayWidth, 2*halfRunwayLength, 2*altitude),
		  material : Cesium.Color.RED.withAlpha(0.3),
		  outline : true,
		  outlineColor : Cesium.Color.YELLOW
	  }
	});

	return runway;
}

function refreshRunway(runway,latitude,longitude,altitude,landParam,runwayWidth,approachParam)
{
	var halfRunwayLength = landParam.landingLongitudinalTolerance;
	var bearing = -approachParam.loiterExitAngle;
	var pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
	runway.position = new Cesium.CallbackProperty(function() {
		  return pos;
	}, false);
	runway.orientation = Cesium.Transforms.headingPitchRollQuaternion(pos,new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-bearing),0,0));
	runway.box.dimensions = new Cesium.Cartesian3(runwayWidth, 2*halfRunwayLength, 2*altitude);
}

var waypoints = [];

window.addEventListener("WaypointAdded",(e)=>addWaypointMap(e.detail));

function addWaypointMap(waypoint)
{
	waypoint = CommandExpanded.fromWaypoint(waypoint);
	waypoints.splice(waypoint.index, 0, waypoint);
	
	createMarker(waypoint);

	for(var i = waypoint.index; i < waypoints.length; i++)
	{
		let wp = waypoints[i];
		wp.index = i;
		wp.marker.name = "waypoint:"+i;
		let labelSt = (i+1).toString();
		let labelCl = Cesium.Color.DARKGREEN;
		if (wp.isVtolLand || wp.isLanding || wp.isChuteLand) {
			labelSt = "L"+labelSt;
			labelCl = Cesium.Color.BLUE;
		}
		wp.marker.billboard.image = new Cesium.ConstantProperty(pinBuilder.fromText(labelSt,labelCl, 48));
	}

	if(waypoints.length>1)
	{
		var line = viewer.entities.add({
			 wall: {
				 material : Cesium.Color.GREEN.withAlpha(0.3),
				 outline : true,
				 outlineColor : Cesium.Color.WHITE
			 },
			 polyline : {
				width : 10,
				followSurface : true,
				material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
			}
		 });

		if(waypoint.index == waypoints.length-1)
		{
			waypoints[waypoint.index-1].line = line;
			line.wall.positions = new Cesium.CallbackProperty(function() {
				return line.polyline.positions.getValue();
			}, true);
			line.polyline.positions = new Cesium.CallbackProperty(function() {
				var fromPoint = waypoints[waypoint.index-1];
				fromPoint = fromPoint.exitPoint || fromPoint.data; 
				return Cesium.Cartesian3.fromDegreesArrayHeights([
					fromPoint.longitude, fromPoint.latitude, fromPoint.altitude,
					waypoint.data.longitude, waypoint.data.latitude, waypoint.data.altitude
				]);
			}, false);
			line.name = "waypointLine:"+(waypoint.index-1);
		}
		else
		{
			waypoint.line = line;
			line.wall.positions = new Cesium.CallbackProperty(function() {
				return line.polyline.positions.getValue();
			}, true);
			line.polyline.positions = new Cesium.CallbackProperty(function() {
				var fromPoint = waypoint.exitPoint || waypoint.data; 
				return Cesium.Cartesian3.fromDegreesArrayHeights([
					fromPoint.longitude, fromPoint.latitude, fromPoint.altitude,
					waypoints[waypoint.index+1].data.longitude, waypoints[waypoint.index+1].data.latitude, waypoints[waypoint.index+1].data.altitude
				]);
			}, false);
			if(waypoint.index - 1 >= 0) {
				waypoints[waypoint.index-1].line.wall.positions = new Cesium.CallbackProperty(function() {
					return waypoints[waypoint.index-1].line.polyline.positions.getValue();
				}, true);
				waypoints[waypoint.index-1].line.polyline.positions = new Cesium.CallbackProperty(function() {
					var fromPoint = waypoints[waypoint.index-1];
					fromPoint = fromPoint.isLandingApproach? fromPoint.exitPoint : fromPoint.data; 
					return Cesium.Cartesian3.fromDegreesArrayHeights([
						fromPoint.longitude, fromPoint.latitude, fromPoint.altitude,
						waypoint.data.longitude, waypoint.data.latitude, waypoint.data.altitude
					]);
				}, false);
			}
			for(var i=waypoint.index; i < waypoints.length-1; i++) waypoints[i].line.name = "waypointLine:"+i;
		}
	}

	refreshLoiter(waypoint);
	if(waypoint.isLanding)
		waypoint.runway = createRunway(waypoint.data.latitude, waypoint.data.longitude, waypoint.data.altitude, waypoint.data.parameter, waypoint.runwayWidth, waypoints[waypoint.index-1].data.parameter);
}

function setWaypointWallPositionProperty(index,isConstant)
{
	var prev = waypoints[index-1];
	if (prev && prev.line && prev.line.wall.positions.isConstant)
		prev.line.wall.positions = new Cesium.CallbackProperty(function() {
			return prev.line.polyline.positions.getValue();
		}, isConstant);
	var wp = waypoints[index];
	if (wp.line)
		wp.line.wall.positions = new Cesium.CallbackProperty(function() {
			return wp.line.polyline.positions.getValue();
		}, isConstant);
}

function updateApproachLandingExitPoint(wp) {
	var direction = wp.data.parameter.loiterExitAngle+(wp.data.parameter.isLoiterClockwise? -90 : 90);
	var result = GeoHelper.getDestination(wp.data.latitude,wp.data.longitude,direction,wp.loiterRadius);
	wp.exitPoint = { latitude: result.lat, longitude: result.lon, altitude: wp.data.altitude };
}

function createMarker(waypoint)
{
	waypoint.marker = viewer.entities.add({
		position: new Cesium.CallbackProperty(function() {
			return Cesium.Cartesian3.fromDegrees(waypoint.data.longitude,waypoint.data.latitude,waypoint.data.altitude);
		}, false),
		billboard: {
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			eyeOffset: new Cesium.Cartesian3(0,0,-1000)
		},
		polyline : {
			positions: new Cesium.CallbackProperty(function() {
				return Cesium.Cartesian3.fromDegreesArrayHeights([
					waypoint.data.longitude,waypoint.data.latitude,waypoint.data.altitude,
					waypoint.data.longitude,waypoint.data.latitude,-1000
				]);
			}, false),
			width : 0.5,
			followSurface : false,
			material : Cesium.Color.WHITE
		}
	});
	if (waypoint.isLandingApproach)
		updateApproachLandingExitPoint(waypoint); 
}

function refreshMapObjects(waypoint)
{
	var latitude = waypoint.data.latitude,
		longitude = waypoint.data.longitude,
		altitude = waypoint.data.altitude;
	var w = waypoints[waypoint.index-1];
	refreshLoiter(waypoint);
	if(waypoint.isLanding)
		refreshRunway(waypoint.runway,latitude,longitude,altitude,waypoint.data.parameter,waypoint.runwayWidth,waypoints[waypoint.index-1].data.parameter);
	if (waypoint.isLandingApproach)
		updateApproachLandingExitPoint(waypoint); 
}

function refreshLoiter(waypoint,material) {
	var isLoiter = (waypoint.isLoiter || waypoint.isLandingApproach);
	if(!waypoint.circle && isLoiter)
	{
		waypoint.circle = viewer.entities.add({
			position: new Cesium.CallbackProperty(function() {
				return Cesium.Cartesian3.fromDegrees(waypoint.data.longitude, waypoint.data.latitude, waypoint.data.altitude);
			}, false),
			ellipse : {
				semiMinorAxis : new Cesium.CallbackProperty(function() { return waypoint.loiterRadius; }, false),
				semiMajorAxis : new Cesium.CallbackProperty(function() { return waypoint.loiterRadius; }, false),
				extrudedHeight : new Cesium.CallbackProperty(function() { return waypoint.data.altitude; }, false),
				material : material || Cesium.Color.GREEN.withAlpha(0.3),
				outline : true,
				outlineColor : Cesium.Color.WHITE,
				numberOfVerticalLines : 0
			},
			allowPicking: false
		});
	}
	else
		if (waypoint.circle && !isLoiter) {
			viewer.entities.remove(waypoint.circle);
			waypoint.circle = null;
		}
}

window.addEventListener("WaypointChanged", (e)=>refreshWaypoint(e.detail));

function copyWaypoint(toWaypoint, fromWaypoint) {
	for (var key in fromWaypoint) toWaypoint[key] = fromWaypoint[key];
}

function refreshWaypoint(waypoint)
{
	waypoint = CommandExpanded.fromWaypoint(waypoint);
	copyWaypoint(waypoints[waypoint.index], waypoint);
	refreshMapObjects(waypoints[waypoint.index]);
}

var currentWaypoint = { };

window.addEventListener("CurrentWaypointChanged", (e)=>refreshCurrentWayPoint(e.detail.waypoint,e.detail.commandSource));

function refreshCurrentWayPoint(waypoint,commandSource)
{
	waypoint = CommandExpanded.fromWaypoint(waypoint);
	copyWaypoint(currentWaypoint, waypoint);
	currentWaypoint.commandSource = commandSource;
	if (!currentWaypoint.marker) {
		createMarker(currentWaypoint);
		currentWaypoint.marker.name = "currentWaypoint:"+currentWaypoint.index;
		currentWaypoint.marker.allowPicking = false; 
		currentWaypoint.marker.billboard.image = new Cesium.ConstantProperty(pinBuilder.fromText("C",Cesium.Color.DARKRED, 48));
	}
	else
		currentWaypoint.marker.name = "currentWaypoint:"+currentWaypoint.index;
	refreshLoiter(currentWaypoint,Cesium.Color.RED.withAlpha(0.3));
}

function clearWaypoints()
{
	waypoints.forEach(function(waypoint) {
		viewer.entities.remove(waypoint.marker);
		if(waypoint.line) viewer.entities.remove(waypoint.line);
		if(waypoint.circle)	viewer.entities.remove(waypoint.circle);
		if(waypoint.runway) 	viewer.entities.remove(waypoint.runway);
	});
	waypoints = [];
}

window.addEventListener("WaypointsCleared", clearWaypoints);

function printWaypoints(phase)
{
	csharp.earthMessage("Phase " + phase);
	for(var i=0; i<waypoints.length; i++)
	{
		csharp.earthMessage(i + "M " + waypoints[i].marker.position.getValue().toString());
		if(i<waypoints.length-1)
		{
			csharp.earthMessage(i + "L " + waypoints[i].line.wall.positions.getValue()[0].toString());
			csharp.earthMessage("------------------------------------------------------");
			csharp.earthMessage(i + "L " + waypoints[i].line.wall.positions.getValue()[1].toString());
		}
	}
	csharp.earthMessage("\n\n\n\n\n\n");
}

describer.register("waypointLine", {
	model: (target,type,index)=> waypoints[index].line.wall,
	description: (target,type,index)=> describer.getDistanceAndDirectionDescription(waypoints[index].data, waypoints[index+1].data)
});

describer.register("waypoint", {
	model: (target,type,index)=> waypoints[index].marker.polyline,
	description: (target,type,index)=> "WayPoint "+(index+1)+"<br/>"+describer.getCoordinatesDescription(waypoints[index].data.coordinates)
});

