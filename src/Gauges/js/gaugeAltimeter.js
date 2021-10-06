loadSvg("altimeterGaugeContainer","svg/gaugeAltimeter.svg",function() {
	var svg = document.getElementById("gaugeAltimeter");
	var center = svg.getElementById("center");
	var centerX = center.getAttribute("cx");
	var centerY = center.getAttribute("cy");
	var handleLong = svg.getElementById("handleLong");
	var handleShort = svg.getElementById("handleShort");
	var variometerAGL = svg.getElementById("altimeterAGL");
	var variometerMSL = svg.getElementById("altimeterMSL");
	gauges.push({
		svg: svg,
		update: function() {
			var ratio = (160*0.996)/(units.isUS("VerticalSpeed")? 2000 : 10);
			var degreesSP = units.getClimbRate(values.climbRateSP)*ratio;
			var degrees = units.getClimbRate(values.climbRate)*ratio;
			variometerAGL.innerHTML = units.getAltitudeSt(values.distanceToGround);
			variometerMSL.innerHTML = units.getAltitudeSt(values.altitude);
			variometerClimbRate.innerHTML = units.getClimbRateSt(values.climbRate);
			handle.setAttribute("transform","rotate("+degrees+" "+centerX+" "+centerY+")");
			indicatorSP.setAttribute("transform","rotate("+degreesSP+" "+centerX+" "+centerY+")");
			var showUS = units.isUS("VerticalSpeed");
			setSVGVisibility(variometerUS,showUS);
			setSVGVisibility(variometerMetric,!showUS);
		}
	});
});
