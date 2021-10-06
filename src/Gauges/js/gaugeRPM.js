
function ClockGauge(svgId,prefix,valueName,angleRange,maxValue) {
	this.prefix = prefix;
	var svg = this.svg = document.getElementById(svgId);
	var center = this.center = svg.getElementById("center"+prefix);
	this.centerX = center.getAttribute("cx");
	this.centerY = center.getAttribute("cy");
	this.handle = svg.getElementById("handle"+prefix);
	this.angleRange = angleRange;
	this.maxValue = maxValue;
	this.valueName = valueName;
	this.update = function() {
		var degrees = (this.angleRange*values[this.valueName])/this.maxValue;
		this.handle.setAttribute("transform","rotate("+degrees+" "+this.centerX+" "+this.centerY+")");
	}
	gauges.push(this);
	return this;
}

loadSvg("rpmGaugeContainer","svg/gaugeRPM.svg",function() {
	new ClockGauge("gaugeRPM","","rpm",268,9000);
	new ClockGauge("gaugeRPM","Thr","throttle",330,100);
	new ClockGauge("gaugeRPM","TPS","tps",330,100);
	
	var svg = document.getElementById("dataTable");
	var dataNames = ["averageConsumption","commandSource","retractStatus","distanceToWayPoint","distanceToHome","bearingFromHome","systemTime","hoverTime","flightTime","gpsTime","latitudeSt","longitudeSt","aglAltitude","mslAltitude"];
	var averageConsumption = document.getElementById("averageConsumption");
	var instantConsumption = document.getElementById("instantConsumption");
	var remainingTime = document.getElementById("remainingTime");
	var remainingDistance = document.getElementById("remainingDistance");
	var rpm = document.getElementById("rpm");
	
	gauges.push({
		svg: svg,
		update: function() {
			var visibility = (values.calcFuelSensorStatus=="NoSensor")? "hidden" : "visible";
			averageConsumption.parentElement.style.visibility = visibility;
			instantConsumption.parentElement.style.visibility = visibility;
			remainingTime.parentElement.style.visibility = visibility;
			remainingDistance.parentElement.style.visibility = visibility;
			averageConsumption.innerHTML = values.averageFuelConsumptionRate;
			instantConsumption.innerHTML = values.instantFuelConsumptionRate;
			remainingTime.innerHTML = values.remainingFlightTime;
			remainingDistance.innerHTML = values.remainingFlightDistance;
			rpm.innerHTML = values.rpm;
		}
	});
});