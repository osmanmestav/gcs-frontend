var unitType = null;
var units = null;

function loadUnitTypes() {
	unitType = {};
	unitsHelper.getUnitTypes().forEach((t,i) => unitType[t]=i);

	units = {
		isUS: function(type) { return unitsHelper.getUnitSystemName(unitType[type])==="US"; },
		getUnitText: function(type) { return unitsHelper.getUnitText(unitType[type]); },
		getSpeed: function(value) { return unitsHelper.convertNumber(unitType.HorizontalSpeed,value); },
		getSpeedSt: function(value) { return unitsHelper.convertToString(unitType.HorizontalSpeed,value); },
		getWindSpeed: function(value) { return unitsHelper.convertNumber(unitType.WindSpeed,value); },
		getWindSpeedSt: function(value) { return unitsHelper.convertToString(unitType.WindSpeed,value); },
		getClimbRate: function(value) { return unitsHelper.convertNumber(unitType.VerticalSpeed,value); },
		getClimbRateSt: function(value) { return unitsHelper.convertToString(unitType.VerticalSpeed,value); },
		getTrackError: function(value) { return unitsHelper.convertToString(unitType.ShortDistance,value); },
		getAltitude: function(value) { return unitsHelper.convertNumber(unitType.Altitude,value); },
		getAltitudeSt: function(value) { return unitsHelper.convertToString(unitType.Altitude,value); },
		getTemperature: function(value) { return unitsHelper.convertToString(unitType.Temperature,value); }
	}
}

var lastReceiveTime = {};

var alarms = { };
var alarmCounter = 0;
var indicatorStatuses = { };

function setAlarmStatus(name,value,element) {
	if (indicatorStatuses[name]!=value) {
		if (typeof(csharp)!="undefined" && value!="Healthy")
			csharp.indicatorStatusChanged(name,value);
		if (indicatorStatuses[name]=="Failed") {
			muteAlarm(name,element);
			delete alarms[name];
		}
		else
			if (value=="Failed")
				startAlarm(name,element);
		indicatorStatuses[name] = value;
	}
}

const speeches = {
	IMUStatus: "IMU!",
	RPMStatus: "Engine!",
	ect: "Engine!",
	gpsStatus: "GPS!",
	linkStatus: "Link!",	
	power: "Power!"
}

var alarmText = "";

window.csharp = {
	playAlarm() {},
	pauseAlarm() {},
	indicatorStatusChanged() {}
}

function updateAlarmText() {
	alarmText = Object.keys(alarms).filter((a)=>{ return alarms[a]==="On" && speeches[a]; }).map((a)=>{ return speeches[a]; }).join("|");
}

function startAlarm(name,element)
{
	if (alarms[name]=="Muted") return;
	alarms[name] = "On";
	if (element)
		element.innerHTML = "<animate attributeType='XML' attributeName='stroke' values='#200;#f00;#200;#200' dur='1s' repeatCount='indefinite'/>";
	updateAlarmText();
	if (alarmCounter)
		csharp.pauseAlarm();
	csharp.playAlarm(alarmText);
	alarmCounter++;
}

function muteAlarm(name,element) {
	if (alarms[name]!="On") return;
	alarms[name] = "Muted";
	if (element) element.innerHTML = "";
	alarmCounter--;
	csharp.pauseAlarm();
	if (alarmCounter) {
		updateAlarmText();
		csharp.playAlarm(alarmText);
	}
}

var values = {
	aileronStatus: "Disabled",
	elevatorStatus: "Disabled",
	thrustStatus: "Disabled",
	rollStatus: "Disabled",
	angleOfAttackStatus: "Disabled",
	failsafeStatus: "Disabled",
	IMUStatus: "Disabled",
	airspeedStatus: "Disabled",
	joystickStatus: "Disabled",
	onGroundStatus: "Disabled",
	rangeFinderStatus: "Disabled",
	RCStatus: "Disabled",
	RPMStatus: "Disabled",
	stallStatus: "Disabled",
	trackStatus: "Disabled",
	vtolReadyStatus: "Disabled",
	launchReadyStatus: "Disabled",
	
	isIgnitionSwitchActive: false,
	isLandingSwitchActive: false,
	
	powerSensorStatus: "Failed",
	power: 0,
	powerMin: 0,
	powerCritical: 0,
	powerMax: 14.5,
	
	BatteryVoltageMin: 44,
	BatteryVoltageMax: 58.8,
	BatteryVoltageCritical: 49,
	
	fuelSensorStatus: "Failed",
	fuel:0,
	fuelMin:0,
	fuelMax:100,
	fuelCritical:0,
	
	calcFuelSensorStatus: "NoSensor",
	calcFuel:0,
	calcFuelMin:0,
	calcFuelMax:100,
	calcFuelCritical:0,
	
	instantFuelConsumptionRate: "0lph", // litre/hour
	averageFuelConsumptionRate: "0lph", // litre/hour
	remainingFlightTime: "0min",
	remainingFlightDistance: "0km",
	
	ectSensorStatus: "Failed",
	ect:0,
	ectMin: -20,
	ectCritical: 0,
	ectMax: 110,

	iatSensorStatus: "Failed",
	iat: 0,
	iatMin: -20,
	iatCritical: -10,
	iatMax: 45,
	
	hotnoseSensorStatus: "Failed",
	hotnose: 0,
	hotnoseMin: -50,
	hotnoseCritical: -50,
	hotnoseMax: 500,
	
	vtolFrontLeft: 0,
	vtolFrontRight: 0,
	vtolBackLeft: 0,
	vtolBackRight: 0,
	vtolFrontLeftStatus: 0,
	vtolFrontRightStatus: 0,
	vtolBackLeftStatus: 0,
	vtolBackRightStatus: 0,
	
	gpsCorrectionStatus: "NoCorrection",
	gpsStatus: "Disabled",
	gps0FixStatus: "NoGPS",
	gps0CorrectionStatus: "NoCorrection",
	gps0StatusSt: "NoGPS",
	gps1FixStatus: "NoGPS",
	gps1CorrectionStatus: "NoCorrection",
	gps1StatusSt: "NoGPS",
	gps2FixStatus: "NoGPS",
	gps2CorrectionStatus: "NoCorrection",
	gps2StatusSt: "NoGPS",

	upLinkPercent0: -1,
	downLinkPercent0: -1,
	upLinkStatus0: 0,
	downLinkStatus0: 0,
	upLinkCap0: 0,
	downLinkCap0: 0,
	
	upLinkPercent1: -1,
	downLinkPercent1: -1,
	upLinkStatus1: 0,
	downLinkStatus1: 0,
	upLinkCap1: 0,
	downLinkCap1: 0,
	
	upLinkStatus: 0,
	downLinkStatus: 0,
	linkStatus: 0,
	
	incrementalCommandId: -1,
	currentCommand: "None",
	commandSource: "Initial",
	remainingAmount: 0,
	distanceToWayPoint: 0,
	distanceToHome: 0,
	percentCompleted: 0,
	travelStatus: "SittingOnGround",
	retractStatus: "RetractDisabled",

	roll: 0,
	rollError:0,
	pitch: 0,
	pitchError:0,
	angleOfAttack:0,

	wind:0,
	windDirection:0,
	yaw:0,
	yawRateError:0,
	groundCourse:0,
	bearingSP:0,
	bearingFromHome: 0,
	systemTime: 0,
	flightTime: 0,
	hoverTime: 0,
	gpsTime: 0,

	stallSpeed:0,
	indicatedAirspeed: 0,
	indicatedAirspeedSP: 0,
	trueAirspeed:0,
	trueAirspeedSP: 0,
	groundSpeed: 0,
	
	throttle:0,
	tps: 0,
	rpm:0,

	altitude: 0,
	altitudeSP: 0,
	altitudeEllipsoid: 0,
	climbRate: 0,
	climbRateSP: 0,
	climbRateError: 0,
	distanceToGround: 0,
	distanceToTrack: 0,
	
	latitudeSt: "",
	longitudeSt: "",
	latitude: 0,
	longitude: 0,
	latitudeSP: 0,
	longitudeSP: 0,
	mslAltitude: 0,
	aglAltitude: 0
}

var externalSensors = {};

window.receiveExternalSensorInfo = function(sensorStatus,sensorType,valueType,info) {
	var isNew = !externalSensors[info.sensorId];
	info.sensorType = sensorType; // Replace int value with string enum name
	info.status = sensorStatus;
	info.valueType = valueType;
	var valueName = valueType+info.sensorId;
	externalSensors[info.sensorId] = info;
	values[valueName+"SensorStatus"] = sensorStatus;
	values[valueName] = info.floatValue;
	if (isNew) {
		values[valueName+"Min"] = values[valueType+"Min"];
		values[valueName+"Critical"] = values[valueType+"Critical"];
		values[valueName+"Max"] = values[valueType+"Max"];
		if (info.sensorType=="BatteryVoltageSensor") {
			loadSvg("batteryVoltageIndicatorsContainer","svg/indicatorBatteryVoltage.svg",function() {
				new Indicator("indicatorBatteryVoltage",valueName,"V");
			});			
		}
	}
}

window.setValue = function(propName,value) {
	values[propName] = value;
	lastReceiveTime[propName] = new Date();
}

window.setValues = function(v)
{
	var date = new Date();
	Object.keys(v).forEach(propName=>{
		values[propName] = v[propName];
		lastReceiveTime[propName] = date;
	});
}