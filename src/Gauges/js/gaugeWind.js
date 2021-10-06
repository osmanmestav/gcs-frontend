loadSvg("windGaugeContainer","svg/gaugeWind.svg",function() {
	var svg = document.getElementById("gaugeWind");
	var center = svg.getElementById("center");
	var centerX = center.getAttribute("cx");
	var centerY = center.getAttribute("cy");
	var compass = svg.getElementById("compass");
	var handle = svg.getElementById("handle");
	var windKnots = svg.getElementById("windKnots");
	var windKmh = svg.getElementById("windKmh");
	gauges.push({
		svg: svg,
		update: function() {
			compass.setAttribute("transform","rotate("+(-values.yaw)+" "+centerX+" "+centerY+")");
			var scale = units.getWindSpeed(values.wind)/(units.isUS("HorizontalSpeed")? 30 : 60);
			handle.setAttribute("transform","translate("+centerX+" "+centerY+") scale("+scale+") rotate("+(values.windDirection-values.yaw)+" 0 0) translate("+(-centerX)+" "+(-centerY)+")");
			var showUS = units.isUS("HorizontalSpeed")? 1 : 0;
			windKnots.setAttribute("transform", "scale("+showUS+")");
			windKmh.setAttribute("transform", "scale("+(1-showUS)+")");
		}
	});
});
