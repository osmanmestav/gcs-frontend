loadSvg("yawHeadingWindGaugeContainer","svg/gaugeYawHeadingWind.svg",function() {
	var svg = document.getElementById("gaugeYawHeadingWind");
	var center = svg.getElementById("center");
	var centerX = center.getAttribute("cx");
	var centerY = center.getAttribute("cy");
	var compass = svg.getElementById("compass");
	var heading = svg.getElementById("heading");
	var headingSP = svg.getElementById("headingSP");
	var homeDirection = svg.getElementById("homeDirection");
	var windDirection = svg.getElementById("windDirection");
	var windKnots = svg.getElementById("windKnots");
	var windKmph = svg.getElementById("windKmph");
	gauges.push({
		svg: svg,
		update: function() {
			compass.setAttribute("transform","rotate("+(-values.yaw)+" "+centerX+" "+centerY+")");
			heading.setAttribute("transform","rotate("+(values.groundCourse-values.yaw)+" "+centerX+" "+centerY+")");
			headingSP.setAttribute("transform","rotate("+(values.bearingSP-values.yaw)+" "+centerX+" "+centerY+")");
			homeDirection.setAttribute("transform","rotate("+(values.bearingFromHome-values.yaw-180)+" "+centerX+" "+centerY+")");
			
			var unit = units.isUS("HorizontalSpeed")? 10 : 20;
			var wind = units.getWindSpeed(values.wind);
			var scale = wind/unit;
			if (scale<0.5) scale = 0;
			if (scale>4) scale = 4;
			var shift = scale? centerY*4/5/scale : 0;
			windDirection.setAttribute("transform","translate("+centerX+" "+centerY+") rotate("+(values.windDirection-values.yaw)+" 0 0) scale(1 "+scale+") translate("+(-centerX)+" "+(shift-centerY)+")");

			var showUS = units.isUS("HorizontalSpeed");
			setSVGVisibility(windKnots,showUS);
			setSVGVisibility(windKmph,!showUS);
		}
	});
});
