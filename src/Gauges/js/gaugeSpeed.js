loadSvg("speedGaugeContainer","svg/gaugeSpeed.svg", function() {
	var svg = document.getElementById("gaugeSpeed");
	var center = svg.getElementById("center");
	var centerX = center.getAttribute("cx");
	var centerY = center.getAttribute("cy");
	var handleAirspeed = svg.getElementById("handleAirspeed");
	var handleGroundspeed = svg.getElementById("handleGroundspeed");
	var indicatorAirspeedSP = svg.getElementById("indicatorAirspeedSP");
	var indicatedAirspeed = svg.getElementById("indicatedAirspeed");
	var groundSpeed = svg.getElementById("groundSpeed");
	var speedUS = svg.getElementById("speedUS");
	var speedMetric = svg.getElementById("speedMetric");
	gauges.push({
		svg: svg,
		update: function() {
			var ratio = 270/(units.isUS("HorizontalSpeed")? 120 : 60);
			var degreesSP = units.getSpeed(values.indicatedAirspeedSP)*ratio;
			var degrees = units.getSpeed(values.indicatedAirspeed)*ratio;
			var degreesGS = units.getSpeed(values.groundSpeed)*ratio;
			handleAirspeed.setAttribute("transform","rotate("+degrees+" "+centerX+" "+centerY+")");
			handleGroundSpeed.setAttribute("transform","rotate("+degreesGS+" "+centerX+" "+centerY+")");
			indicatorAirspeedSP.setAttribute("transform","rotate("+degreesSP+" "+centerX+" "+centerY+")");
			var showUS = units.isUS("HorizontalSpeed");
			setSVGVisibility(speedUS,showUS);
			setSVGVisibility(speedMetric,!showUS);
			indicatedAirspeed.innerHTML = units.getSpeedSt(values.indicatedAirspeed);
			groundSpeed.innerHTML = units.getSpeedSt(values.groundSpeed);
		}
	});
});