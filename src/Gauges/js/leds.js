
function Led(svgId,titleSt,valueName) {
	var svg = this.svg = document.getElementById(svgId);
	if (!svg) { console.log(svgId+" not found."); return; }
	var frame = this.frame = svg.getElementById("frame");
	var title = this.title = svg.getElementById("title");
	var frameStrokeWidth = frame.style.strokeWidth;
	svg.onclick = function() { muteAlarm(valueName,frame); };
	svg.style.cursor = "pointer";
	title.innerHTML = titleSt;
	this.update = function() {
		var value = values[valueName];
		if (value=="Hidden" || !value) {
			svg.style.visibility = "hidden";
			svg.style.position = "absolute";
		}
		else {
			svg.style.visibility = "visible";
			svg.style.position = "relative";
		}
		value = values.hasDownLink? value : "Disabled";
		setAlarmStatus(valueName,value,frame);
		var warn = (value!="Healthy");
		var color = statusColors[value];
		title.style.fill = color;
		frame.style.fill = (value=="Disabled")? uiColors.disabledBackground : uiColors.normalBackground;
		frame.style.stroke = color;
		frame.style.strokeWidth = warn? frameStrokeWidth : 0;
	};
	gauges.push(this);
	return this;
}

var leds = {
	aileron: "Ailr",
	elevator: "Elev",
	roll: "Roll",
	angleOfAttack: "AoA",
	track: "Track",
	stall: "Stall",
	thrust: "Thrust",
	failsafe: "FailSf",
	RPM: "RPM",
	airspeed: "AirSp",
	IMU: "IMU",
	blank1: null,
	RC: "RC",
	joystick: "Joyst",
	onGround: "OnGnd",
	rangeFinder: "Range",
	vtolReady: "VtolRd",
	launchReady: "Launch"
};

loadSvg(null,"svg/led.svg",function(ledSvg) {
	var ledsContainer = document.getElementById("ledsContainer");
	for(var name in leds)
		ledsContainer.innerHTML += "<div class='led' id='"+name+"Container'>"+ledSvg.replace("{id}","led"+name)+"</div>";

	for(var name in leds)
		leds[name] = new Led("led"+name,leds[name],name+"Status");
});