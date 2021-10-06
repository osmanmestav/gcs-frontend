
function Indicator(svgId,valueName,suffix) {
	var container = this.container = document.getElementById((valueName+"IndicatorContainer"));
	var svg = this.svg = document.getElementById(svgId);
	var frame = this.frame = svg.getElementById("frame");
	svg.onclick = function() { muteAlarm(valueName,frame); };
	svg.style.cursor = "pointer";
	this.frameStrokeWidth = Number.parseFloat(frame.style.strokeWidth);
	var ratioBar = this.ratioBar = svg.getElementById("ratioBar");
	this.ratioBarBottom = ratioBar.getAttribute("y")*1+ratioBar.getAttribute("height")*1;
	this.range = svg.getElementById("fullBar").getAttribute("height")*1;
	this.valueText = svg.getElementById("valueText");
	this.suffix = suffix;
	this.valueText.style.fontWeight="bold";
	this.normalFill = this.valueText.style.fill;
	this.warningFill = frame.style.stroke;
	this.update = function() {
		var status = values[valueName+"SensorStatus"];
		if (status=="NoSensor") {
			if (container) {
				container.style.visibility = "hidden";
				container.style.widthOriginal = container.style.widthOriginal || container.style.width;
				container.style.width = 0;
			}
			else
				svg.style.visibility = "hidden";
			setAlarmStatus(valueName,"Healthy",frame);
			return;
		}
		if (status=="Disabled" || !values.hasLink) {
			if (container) {
				container.style.visibility = "visible";
				container.style.width = container.style.widthOriginal;
			}
			if (status=="Disabled")
				this.valueText.innerHTML = "-";
			setAlarmStatus(valueName,"Healthy",frame);
			this.frame.style.stroke = this.ratioBar.style.fill = this.valueText.style.fill = statusColors.Disabled;
			this.frame.style.strokeWidth = this.frameStrokeWidth;
			return;
		}
		var minValue = values[valueName+"Min"];
		var criticalValue = values[valueName+"Critical"];
		var maxValue = values[valueName+"Max"];
		var valueRange = (maxValue-minValue);
		var toleratedMaxValue = maxValue+valueRange*0.2;
		var value = values[valueName];
		if (typeof(value)=="undefined") {
			console.log(valueName+" is not defined");
			return;
		}
		var warn = (value<criticalValue || value>toleratedMaxValue);
		var fill = warn? this.warningFill : statusColors[status] || this.normalFill;
		setAlarmStatus(valueName,warn?"Failed":"Healthy",frame);
		this.valueText.innerHTML = (typeof(this.suffix)=="function")? this.suffix(value) : (value.toFixed(1)+this.suffix);
		value = (value<minValue)? 0 : value-minValue;
		var height = this.range*value/valueRange;
		if (height<0) height=0;
		this.ratioBar.setAttribute("y",this.ratioBarBottom-height);
		this.ratioBar.setAttribute("height",height);
		this.ratioBar.style.fill = fill;
		this.valueText.style.fill = fill;
		this.frame.style.strokeWidth = warn? this.frameStrokeWidth : 0;
		this.frame.style.stroke = statusColors.Failed;
	};
	gauges.push(this);
	return this;
}

function formatTemperature(value) { return units.getTemperature(value); }
function formatPercentage(value) { return "%"+value.toFixed(0); }

loadSvg("powerIndicatorContainer","svg/indicatorPower.svg",function() {
	new Indicator("indicatorPower","power","V");
});

loadSvg("fuelIndicatorContainer","svg/indicatorFuel.svg",function() {
	new Indicator("indicatorFuel","fuel",formatPercentage);
});

loadSvg("calcFuelIndicatorContainer","svg/indicatorCalcFuel.svg",function() {
	new Indicator("indicatorCalcFuel","calcFuel",formatPercentage);
});

loadSvg("ectIndicatorContainer","svg/indicatorECT.svg",function() {
	new Indicator("indicatorECT","ect",formatTemperature);
});

loadSvg("iatIndicatorContainer","svg/indicatorIAT.svg",function() {
	new Indicator("indicatorIAT","iat",formatTemperature);
});

loadSvg("hotnoseIndicatorContainer","svg/indicatorHotnose.svg",function() {
	new Indicator("indicatorHotnose","hotnose",formatTemperature);
});

loadSvg("travelHoverIndicatorContainer","svg/indicatorTravelHover.svg",function()
{
	var svg = document.getElementById("indicatorTravelHover");
	
	var icons = {
		SittingOnGround: svg.getElementById("sitting"),
		MovingOnGround: svg.getElementById("moving"),
		Hovering: svg.getElementById("hovering"),
		Flying: svg.getElementById("flying")
	};
	
	var frontLeft = svg.getElementById("frontLeft");
	var frontRight = svg.getElementById("frontRight");
	var backLeft = svg.getElementById("backLeft");
	var backRight = svg.getElementById("backRight");
	var frame = svg.getElementById("frame");
	svg.onclick = function() { muteAlarm("travelHover",frame); };
	svg.style.cursor = "pointer";
	var strokeWidth = frame.style.strokeWidth;
	// msSTARTED=2, SATURATED=1, msSTOPPED=0, msBYPASSED=-1, msTRYING=-2, msFAILED=-3
	var statusColors = {
		"2": backLeft.style.fill,   // OK
		"1": backRight.style.fill,   // SATURATED
		"0": backRight.style.fill,   // STOPPED
		"-1": frontLeft.style.fill,  // BY PASSED
		"-2": frontRight.style.fill, // TRYING
		"-3": frame.style.stroke    // FAILED
	};
	
	gauges.push({
		svg: svg,
		update: function() {
			var travelStatus = values.travelStatus;
			if (values.currentCommand.startsWith("Vtol"))
				travelStatus = "Hovering";
			for(var s in icons)
				setSVGVisibility(icons[s],travelStatus==s);
			if (travelStatus=="Hovering") {
				var frontLeftStatus = values.vtolFrontLeftStatus;
				if (frontLeftStatus>0) frontLeftStatus = (values.vtolFrontLeft<100)? 2 : 1;
				var frontRightStatus = values.vtolFrontRightStatus;
				if (frontRightStatus>0) frontRightStatus = (values.vtolFrontRight<100)? 2 : 1;
				var backLeftStatus = values.vtolBackLeftStatus;
				if (backLeftStatus>0) backLeftStatus = (values.vtolBackLeft<100)? 2 : 1;
				var backRightStatus = values.vtolBackRightStatus;
				if (backRightStatus>0) backRightStatus = (values.vtolBackRight<100)? 2 : 1;
				var status = Math.min(Math.min(frontLeftStatus,frontRightStatus),Math.min(backLeftStatus,backRightStatus));
				setAlarmStatus("travelHover",(status<=-3)? "Failed": (status<2)? "Unhealthy" : "Healthy",frame);
			
				setSVGVisibility(frontLeft,values.vtolFrontLeft);
				setSVGVisibility(frontRight,values.vtolFrontRight);
				setSVGVisibility(backLeft,values.vtolBackLeft);
				setSVGVisibility(backRight,values.vtolBackRight);
				
				frontLeft .style.fill = statusColors[frontLeftStatus];
				frontRight.style.fill = statusColors[frontRightStatus];
				backLeft  .style.fill = statusColors[backLeftStatus];
				backRight .style.fill = statusColors[backRightStatus];
			
				frame.style.strokeWidth = (status<2)? strokeWidth : 0;
				frame.style.stroke = statusColors[status];
			}
			else {
				frame.style.strokeWidth = 0;
				setAlarmStatus("travelHover","Healthy",frame);
			}
		}
	});
});

loadSvg("gpsIndicatorContainer","svg/indicatorGPS.svg",function()
{
	var svg = document.getElementById("indicatorGPS");
	var satellite = svg.getElementById("satellite");
	var gps0Status = svg.getElementById("gps0Status");
	var gps1Status = svg.getElementById("gps1Status");
	var gps2Status = svg.getElementById("gps2Status");
	var frame = svg.getElementById("frame");
	var strokeWidth = frame.style.strokeWidth*1;
	var dgpsColor = gps2Status.style.fill;
	
	svg.onclick = function() { muteAlarm("gpsStatus",frame); };
	svg.style.cursor = "pointer";
	
	gauges.push({
		svg: svg,
		getColor: function(fixStatus,correctionStatus) {
			switch(fixStatus) {
				case "NoGPS": return statusColors.Disabled;
				case "OK":
					if (correctionStatus=="NoCorrection") return statusColors.Healthy;
					return dgpsColor;
			}
			return statusColors.Failed;
		},
		update: function() {
			var noLinkColor = values.hasLink? 0 : statusColors.Disabled;
			var color = statusColors[values.gpsStatus];
			if (values.gpsStatus=="Healthy" && values.gpsCorrectionStatus!="NoCorrection")
				color = dgpsColor;
			setAlarmStatus("gpsStatus",values.gpsStatus, frame);
			satellite.style.fill = noLinkColor||color;
			
			frame.style.stroke = statusColors[values.gpsStatus];
			frame.style.strokeWidth = (values.gpsStatus=="Healthy")? 0 : strokeWidth;
			frame.style.fill = (values.gpsStatus=="Disabled")? uiColors.disabledBackground : uiColors.normalBackground;

			gps0Status.style.fill = noLinkColor||this.getColor(values.gps0FixStatus,values.gps0CorrectionStatus);
			gps0Status.innerHTML = values.gps0StatusSt.substring(0,12);

			gps1Status.style.fill = noLinkColor||this.getColor(values.gps1FixStatus,values.gps1CorrectionStatus);
			gps1Status.innerHTML = values.gps1StatusSt.substring(0,12);

			gps2Status.style.fill = noLinkColor||this.getColor(values.gps2FixStatus,values.gps2CorrectionStatus);
			gps2Status.innerHTML = values.gps2StatusSt.substring(0,12);
		}
	});
});

loadSvg("dataLinkIndicatorContainer","svg/indicatorDataLink.svg",function()
{
	var svg = document.getElementById("indicatorDataLink");
	var linkStatus = svg.getElementById("linkStatus");
	linkStatus.style.fontWeight = "bold";
	
	var range = svg.getElementById("fullBarUp").getAttribute("height")*1;
	var frame = svg.getElementById("frame");
	var statusTexts = ["Disc","Lost","Poor","Good" ];
	var statuses = ["Disabled","Failed","Unhealthy","Healthy"];
	
	svg.onclick = function() { muteAlarm("linkStatus",frame); link0.muteAlarm(); link1.muteAlarm(); };
	svg.style.cursor = "pointer";
	
	function DataLink(no) {
		this.no = no;
		this.upLinkPercent = svg.getElementById("upLinkPercent"+no);
		this.upLinkPercent.style.fontWeight = "bold";
		this.downLinkPercent = svg.getElementById("downLinkPercent"+no);
		this.downLinkPercent.style.fontWeight = "bold";
		this.ratioBarUp = svg.getElementById("ratioBarUp"+no);
		this.ratioBarDown = svg.getElementById("ratioBarDown"+no);
		this.frame = svg.getElementById("linkFrame"+no);
		this.muteAlarm = function() { muteAlarm("linkStatus"+this.no,this.frame); };
		this.update = function() {
			var upLinkPercent = values["upLinkPercent"+this.no];
			var upLinkCap = values["upLinkCap"+this.no];
			var upLinkStatus = values["upLinkStatus"+this.no];
			var downLinkPercent = values["downLinkPercent"+this.no];
			var downLinkCap = values["downLinkCap"+this.no];
			var downLinkStatus = values["downLinkStatus"+this.no];
			this.upLinkStatus = (upLinkStatus<2)? upLinkStatus : (upLinkPercent<40 && upLinkCap>100)? 2 : 3;
			this.downLinkStatus = (downLinkStatus<2)? downLinkStatus : (downLinkPercent<40 && downLinkCap>100)? 2 : 3;
			this.linkStatus = Math.min(this.upLinkStatus,this.downLinkStatus);
			this.hasDownLink = (this.downLinkStatus>=2);
			this.hasUpLink = (this.upLinkStatus>=2);
			this.hasLink = (this.linkStatus>=2);
			
			setAlarmStatus("linkStatus"+this.no,statuses[this.linkStatus], this.frame);
			this.frame.style.stroke = statusColors[this.linkStatus];
			
			this.ratioBarUp.style.fill = statusColors[this.upLinkStatus];
			var height = upLinkPercent*range/100;
			if (height<0) height=0;
			this.ratioBarUp.setAttribute("height",height);
			this.ratioBarUp.setAttribute("y",upLinkBottom-height);
			this.ratioBarDown.style.fill = statusColors[this.downLinkStatus];
			height = downLinkPercent*range/100;
			if (height<0) height=0;
			this.ratioBarDown.setAttribute("height",height);
			this.ratioBarDown.setAttribute("y",downLinkBottom-height);
			
			this.upLinkPercent.innerHTML = Math.max(0,Math.min(upLinkPercent||0,99)).toFixed(0);
			this.upLinkPercent.style.fill = statusColors[this.upLinkStatus];
			this.downLinkPercent.innerHTML = Math.max(0,Math.min(downLinkPercent||0,99)).toFixed(0);
			this.downLinkPercent.style.fill = statusColors[this.downLinkStatus];
		}
	};
	
	link0 = new DataLink("0");
	link1 = new DataLink("1");

	var upLinkBottom = link0.ratioBarUp.getAttribute("y")*1+link0.ratioBarUp.getAttribute("height")*1;
	var downLinkBottom = link0.ratioBarDown.getAttribute("y")*1+link0.ratioBarDown.getAttribute("height")*1;
	
	gauges.push({
		svg: svg,
		update: function() {
			link0.update();
			link1.update();
			values.upLinkStatus = Math.max(link0.upLinkStatus,link1.upLinkStatus);
			values.downLinkStatus = Math.max(link0.downLinkStatus,link1.downLinkStatus);
			var status = values.linkStatus = Math.min(values.upLinkStatus,values.downLinkStatus);
			values.hasDownLink = (values.downLinkStatus>=2);
			values.hasUpLink = (values.upLinkStatus>=2);
			values.hasLink = (status>=2);
			setAlarmStatus("linkStatus",statuses[status], frame);
			var color = statusColors[status];
			linkStatus.innerHTML = statusTexts[status];
			linkStatus.style.fill = color;
			frame.style.stroke = color;
		}
	});
});
