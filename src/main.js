import "./login";
import {Auth} from 'aws-amplify';
import Amplify, {PubSub} from 'aws-amplify';
import {AWSIoTProvider} from '@aws-amplify/pubsub';
import {preprocessTelemetry} from "./preprocessTelemetry"
const loginURL = "/login/signin.html";
const awsIoTProviderOptions = {
    aws_pubsub_region: 'eu-west-1',
    aws_pubsub_endpoint: 'wss://a3do8wha900gm6-ats.iot.eu-west-1.amazonaws.com/mqtt',
};
var user = null; // Cognito user identity
var gaugesWindow = null;
var mapWindow = null;
window.addEventListener('load', function () {
    // Check if we are on index.html
    mapWindow = document.getElementById("gcsMap");
    mapWindow = mapWindow && mapWindow.contentWindow;
    if (document.getElementById("gaugesButton")) {
        // document.getElementById("gaugesButton").addEventListener("click", () => {
        //     if (!gaugesWindow || ~gaugesWindow.window) {
        //         window.gaugesWindow = gaugesWindow = window.open("Gauges/Gauges.html", "GaugesWindow");
        //         gaugesWindow.csharp = mapWindow.csharp;
        //     }
        // });
        // try {
        //     Auth.currentAuthenticatedUser().then(u => {
        //         user = u;
        //         console.log("Logged in.");
        //         console.log(user);
        //         initializeMQTT();
        //     }).catch(err => {
        //         console.log(err);
        //         location.href = loginURL;
        //     });
        // } catch (E) {
        //     console.log(E);
        // }
    }
    var simulateTelemetryButton = document.getElementById("simulateTelemetry");
    //if (simulateTelemetryButton) {
    var sampleTelemetryMessage = {
        "aircraftId": 123,
        "aircraftName": "CGT50-551",
        "aileronStatus": "Healthy",
        "elevatorStatus": "Healthy",
        "thrustStatus": "Healthy",
        "rollStatus": "Healthy",
        "angleOfAttackStatus": "Healthy",
        "failsafeStatus": "Healthy",
        "IMUStatus": "Healthy",
        "airspeedStatus": "Healthy",
        "joystickStatus": "Failed",
        "onGroundStatus": "Disabled",
        "rangeFinderStatus": "Disabled",
        "RCStatus": "Hidden",
        "RPMStatus": "Healthy",
        "stallStatus": "Healthy",
        "trackStatus": "Healthy",
        "vtolReadyStatus": "Healthy",
        "launchReadyStatus": "Hidden",
        "isIgnitionSwitchActive": true,
        "isLandingSwitchActive": false,
        "powerSensorStatus": "Healthy",
        "power": 12,
        "powerMin": 10,
        "powerCritical": 11,
        "powerMax": 14.5,
        "BatteryVoltageMin": 51,
        "BatteryVoltageMax": 58,
        "BatteryVoltageCritical": 53,
        "fuelSensorStatus": "Hidden",
        "fuel": 30,
        "fuelMin": 0,
        "fuelMax": 100,
        "fuelCritical": 15,
        "calcFuelSensorStatus": "NoSensor",
        "calcFuel": 0,
        "calcFuelMin": 0,
        "calcFuelMax": 100,
        "calcFuelCritical": 0,
        "instantFuelConsumptionRate": "2lph",
        "averageFuelConsumptionRate": "2lph",
        "remainingFlightTime": "0min",
        "remainingFlightDistance": "0km",
        "ectSensorStatus": "Healthy",
        "ect": 94.2000046,
        "ectMin": -20,
        "ectCritical": 0,
        "ectMax": 110,
        "iatSensorStatus": "Healthy",
        "iat": 14.3,
        "iatMin": -20,
        "iatCritical": -10,
        "iatMax": 45,
        "hotnoseSensorStatus": "NoSensor",
        "hotnose": 0,
        "hotnoseMin": -50,
        "hotnoseCritical": -50,
        "hotnoseMax": 500,
        "vtolFrontLeft": 0,
        "vtolFrontRight": 0,
        "vtolBackLeft": 0,
        "vtolBackRight": 0,
        "vtolFrontLeftStatus": 0,
        "vtolFrontRightStatus": 0,
        "vtolBackLeftStatus": 0,
        "vtolBackRightStatus": 0,
        "gpsCorrectionStatus": "NoCorrection",
        "gpsStatus": "Healthy",
        "gps0FixStatus": "OK",
        "gps0CorrectionStatus": "Standard",
        "gps0StatusSt": "12 sats Standard",
        "gps1FixStatus": "NoGPS",
        "gps1CorrectionStatus": "Standard",
        "gps1StatusSt": "NoGPS",
        "gps2FixStatus": "NoGPS",
        "gps2CorrectionStatus": "Standard",
        "gps2StatusSt": "NoGPS",
        "upLinkPercent0": 100,
        "downLinkPercent0": 100,
        "upLinkStatus0": 2,
        "downLinkStatus0": 2,
        "upLinkCap0": 56,
        "downLinkCap0": 5096,
        "upLinkPercent1": 0,
        "downLinkPercent1": 0,
        "upLinkStatus1": 0,
        "downLinkStatus1": 0,
        "upLinkCap1": 0,
        "downLinkCap1": 0,
        "upLinkStatus": 3,
        "downLinkStatus": 3,
        "linkStatus": 3,
        "incrementalCommandId": 9,
        "currentCommand": "7-WayPoint",
        "commandSource": "Mission",
        "remainingAmount": 63,
        "distanceToWayPoint": "1.2 km",
        "distanceToHome": "2.9 km",
        "percentCompleted": 92,
        "travelStatus": "Flying",
        "retractStatus": "RetractDisabled",
        "roll": 14.36,
        "rollError": 0,
        "pitch": 0.8,
        "pitchError": 0.06,
        "angleOfAttack": 0.1,
        "wind": 1.3,
        "windDirection": -7.26,
        "yaw": 124.52,
        "yawRateError": -0.12,
        "groundCourse": 117.18,
        "bearingSP": 258.76,
        "bearingFromHome": "209",
        "systemTime": "0:4.39",
        "flightTime": "0:3.45",
        "hoverTime": "0:0.0",
        "gpsTime": "Wed 01:49:03.163",
        "stallSpeed": 5.75,
        "indicatedAirspeed": 25.99,
        "indicatedAirspeedSP": 23.96,
        "trueAirspeed": 26.13155,
        "trueAirspeedSP": 24.0904922,
        "groundSpeed": 26.23,
        "throttle": 56.17,
        "tps": 51.6000023,
        "rpm": 5078,
        "altitude": 92.5,
        "altitudeSP": 92.73,
        "altitudeEllipsoid": 0,
        "climbRate": 0.5,
        "climbRateSP": 1,
        "climbRateError": -0.23,
        "distanceToGround": 93.98977,
        "distanceToTrack": "13 m",
        "latitudeSt": "52° 40' 55.2\"",
        "longitudeSt": "-8° 3' 38.4\"",
        "latitude": 52.6820064,
        "longitude": -8.939312,
        "latitudeSP": 52.6789747,
        "longitudeSP": -8.9561254,
        "mslAltitude": "92 m",
        "aglAltitude": "94 m",
        "hasDownLink": true,
        "hasUpLink": true,
        "hasLink": true,
        "ellipsoidAltitude": 92.5,
        "Other0SensorStatus": "102",
        "Other0": 3.36454654e-37,
        "airspeedError": -2.03,
        "vtolFrontRightRPM": 0,
        "vtolFrontLeftRPM": 0,
        "vtolBackRightRPM": 0,
        "vtolBackLeftRPM": 0,
        "tpsSensorStatus": "Healthy",
        "groundAltitude": -1.247955300000001
    };
    var time = 0;
    const deltaT = 0.1; // seconds
    var simulateTelemetry = () => {
        time += deltaT;
        let cos = Math.cos(time / 3 * Math.PI / 2);
        let sin = Math.sin(time / 3 * Math.PI / 2);
        sampleTelemetryMessage.roll = 10 * sin;
        sampleTelemetryMessage.rollRate = 10 * cos;
        sampleTelemetryMessage.yawRate = Math.tan(sampleTelemetryMessage.roll * Math.PI / 180) * 9.806 / sampleTelemetryMessage.trueAirspeed;
        let deltaYaw = sampleTelemetryMessage.yawRate * deltaT * 180 / Math.PI;
        if (isFinite(deltaYaw)) {
            sampleTelemetryMessage.yaw += deltaYaw;
            sampleTelemetryMessage.groundCourse += deltaYaw;
        }
        let p = GeoHelper.getDestination(sampleTelemetryMessage.latitude, sampleTelemetryMessage.longitude, sampleTelemetryMessage.groundCourse, sampleTelemetryMessage.groundSpeed * 0.1);
        sampleTelemetryMessage.latitude = p.latitude;
        sampleTelemetryMessage.longitude = p.longitude;
        sampleTelemetryMessage.latitudeSt = unitsHelper.convertToString(UnitType.LatLon, p.latitude);
        sampleTelemetryMessage.longitudeSt = unitsHelper.convertToString(UnitType.LatLon, p.longitude);
        PubSub.publish('UL/U/dev1/T', sampleTelemetryMessage).then(() => {
            //console.log("Sent sample telemetry");
            setTimeout(simulateTelemetry, 1000 * deltaT);
        }).catch(err => {
            console.log(err);
            setTimeout(simulateTelemetry, 1000 * deltaT);
        });
    };
    // simulateTelemetryButton.addEventListener("click", () => {
    //     simulateTelemetryButton.enabled = false;
    //     simulateTelemetry();
    //     document.getElementById('gcsMap').contentWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": sampleTelemetryMessage}));
    //     setTimeout(function () {
    //         document.getElementById('gcsMap').contentWindow.window.dispatchEvent(new CustomEvent("planeChanged", {"detail": sampleTelemetryMessage}));
    //     }, 3000);
    // });
    //}
});

async function initializeMQTT() {
    // Apply plugin with configuration
    Amplify.addPluggable(new AWSIoTProvider(awsIoTProviderOptions));
    PubSub.subscribe('UL/U/dev1/T').subscribe({
        next: data => {
            //console.log('Message received', data.value);
            let values = preprocessTelemetry(data.value);
            let setGaugeValues = gaugesWindow && gaugesWindow.window && gaugesWindow.window.setValues;
            if (setGaugeValues)
                setGaugeValues(values);
            let csharp = mapWindow && mapWindow.csharp;
            if (csharp)
                csharp.updateAircraft(values);
        },
        error: error => console.error(error),
        close: () => console.log('Done'),
    });
    PubSub.subscribe('UL/U/dev1/M').subscribe({
        next: data => {
            console.log('Mission received', data.value);
            let csharp = mapWindow && mapWindow.csharp;
            if (csharp)
                csharp.receivedMission(data.value);
        },
        error: error => console.error(error),
        close: () => console.log('Done'),
    });
    var requestId = 0;
    mapWindow.addEventListener("CommandRequest", (e) => {
        requestId++;
        e.detail.requestId = requestId;
        PubSub.publish('UL/U/dev1/C', e.detail);
    });
    publishHeartBeat();
}
async function publishHeartBeat() {
    let csharp = mapWindow && mapWindow.csharp;
    if (!csharp || !csharp.selectedAircraft || !csharp.selectedAircraft.aircraftId) {
        setTimeout(publishHeartBeat, 1000);
        return;
    }
    let req = {
        aircraftId: csharp.selectedAircraft.aircraftId,
        aircraftName: csharp.selectedAircraft.aircraftName,
        command: "HeartBeat",
        requestId: 0
    };
    PubSub.publish('UL/U/dev1/C', req).then(() => {
        console.log("Sent heartbeat");
        setTimeout(publishHeartBeat, 1000);
    }).catch(err => {
        console.log(err);
        setTimeout(publishHeartBeat, 1000);
    });
}