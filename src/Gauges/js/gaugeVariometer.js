loadSvg("variometerGaugeContainer","svg/gaugeVariometer.svg",function() {
	var svg = document.getElementById("gaugeVariometer");
	var center = svg.getElementById("center");
	var centerX = center.getAttribute("cx");
	var centerY = center.getAttribute("cy");
	var handle = svg.getElementById("handle");
	var indicatorSP = svg.getElementById("indicatorSP");
	var variometerUS = svg.getElementById("variometerUS");
	var variometerMetric = svg.getElementById("variometerMetric");
	var variometerAGL = svg.getElementById("variometerAGL");
	var variometerMSL = svg.getElementById("variometerMSL");
	var variometerClimbRate = svg.getElementById("variometerClimbRate");
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
