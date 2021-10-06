loadSvg("attitudeGaugeContainer","svg/gaugeAttitude.svg",function() {
	var svg = document.getElementById("gaugeAttitude");
	var center = svg.getElementById("center");
	var centerX = center.getAttribute("cx");
	var centerY = center.getAttribute("cy");
	var roll = svg.getElementById("roll");
	var pitch = svg.getElementById("pitch");
	var climbAngle = svg.getElementById("climbAngle");
	gauges.push({
		svg: svg,
		update: function() {
			var rollAngle = -values.roll;
			var pitchY = values.pitch*2;
			var climbAngleY = values.angleOfAttack*2;
			roll.setAttribute("transform","rotate("+rollAngle+" "+centerX+" "+centerY+")");
			pitch.setAttribute("transform","rotate("+rollAngle+" "+centerX+" "+centerY+") translate("+0+" "+pitchY+")");
			climbAngle.setAttribute("transform","rotate("+rollAngle+" "+centerX+" "+centerY+") translate("+0+" "+climbAngleY+")");
		}
	});
});