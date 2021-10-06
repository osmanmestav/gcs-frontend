
new PulldownMenu("Swarm",[
	{ title: "Upload same mission", handler: ()=> csharp.uploadMissionToAllAircrafts() },
	{ title: "Build and upload scan mission", handler: ()=> csharp.buildAndUploadScanMissionToAllAircrafts() },
	{ title: "Calibrate airspeeds", handler: ()=> csharp.calibrateAllAirspeedSensors() },
	{ title: "Start missions", handler: ()=> csharp.startAllMissions() },
	{ title: "Stop missions", handler: ()=> csharp.stopAllMissions() }
]);

// Build a name-value map
const SwarmSearchStatus = {
	None: 0,
	Searching: 1,
	TargetFound: 2,
	ConfirmFailed: 3,
	PendingInstruction: 4,
	ConfirmingTarget: 5,
	FinishedSearching: 6,
	ReturningToBase: 7,
	DetectorFailed: 253,
	HostFailed: 254,
	NoHost: 255
};
	
var targetInfo = {};

window.addEventListener("planeChanged", ({ detail }) => {
	if (detail.swarmSearchStatus!=SwarmSearchStatus.TargetFound) return;
    let e = targetInfo[detail.aircraftId];
    if (e) return;
    targetInfo[detail.aircraftId] = viewer.entities.add({
		name: "swarmTarget-"+detail.aircraftName,
		allowPicking: false,
		position: Cesium.Cartesian3.fromDegrees(detail.swarmTargetLongitude.toFixed(7),detail.swarmTargetLatitude.toFixed(7), 0),
		billboard: {
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			image: new Cesium.ConstantProperty(pinBuilder.fromText("T-"+detail.aircraftName,Cesium.Color.DARKBLUE, 48))
		}
	});
});
