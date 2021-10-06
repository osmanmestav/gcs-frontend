
var CameraMode = {
	Free: "Free",
//	POV: "POV",
	Follow: "Follow",
	Orthogonal: "Orthogonal",
	Observe: "Observe"
};

var camera,cameraMode;

function changeCamera(cameraMode)
{
	window.cameraMode = cameraMode;
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	if (cameraMode==CameraMode.Orthogonal)
		viewer.sceneModePicker.viewModel.morphTo2D();
	else
		viewer.sceneModePicker.viewModel.morphTo3D();
	
	if (window.plane && plane.model)
		plane.model.billboard.show = (cameraMode==CameraMode.Orthogonal);
	
	var showModel = false;
	var showTrace = false;
	var enableInputs = false;
	var trackPlane = false;
    switch(cameraMode) {
        case CameraMode.Free:
			showTrace = true;
            showModel = true;
            enableInputs = true;
            break;
        case CameraMode.Orthogonal:
			showTrace = true;
            showModel = true;
            enableInputs = true;
            break;
        case CameraMode.Follow:
            showModel = true;
            break;
        case CameraMode.Observe:
			showTrace = true;
            trackPlane = true;
            showModel = true;
            enableInputs = true;
            break;
    }
	if (window.plane) {
		if (showTrace) plane.trace.show(); else plane.trace.hide();
		plane.model.show = showModel;
		viewer.trackedEntity = trackPlane? plane.model : undefined;
		goToPlane();
	}
	else viewer.trackedEntity = undefined;
	viewer.scene.screenSpaceCameraController.enableInputs = enableInputs;
	
	window.enableMouseEvents = (cameraMode==CameraMode.Free || cameraMode==CameraMode.Orthogonal);

	var evt = new CustomEvent('cameraChanged', { detail: cameraMode });
    window.dispatchEvent(evt);
}

function setCameraViewFromAirplane(plane) {
	if(plane!=window.plane) return;
	switch(cameraMode) {
		case CameraMode.Follow:
			viewer.camera.lookAt(
				Cesium.Cartesian3.fromDegrees(plane.longitude, plane.latitude, plane.altitudeShown),
				new Cesium.HeadingPitchRange(Cesium.Math.toRadians(plane.yaw), Cesium.Math.toRadians(-10), 5)
			);
			break;/*
		case CameraMode.POV:
			var c = Cesium.Cartesian3.fromDegrees(plane.longitude, plane.latitude, plane.altitudeShown);
			var o = {
				heading: Cesium.Math.toRadians(plane.yaw),
				pitch: Cesium.Math.toRadians(plane.pitch),
				roll: Cesium.Math.toRadians(plane.roll)
			};
			viewer.camera.setView({ destination: c, orientation: o });
			break;*/
	}
}

window.addEventListener('planeChanged', (e)=> setCameraViewFromAirplane(e.detail), false);
	
$(function() {
	var selectItem = $("<select></select>", { style: "float:left;" }).addClass("cesium-button");
	for(var i in CameraMode)
		selectItem.append($('<option>', {value: CameraMode[i], text: CameraMode[i] }));
	$('#left-toolbar').prepend(selectItem);
	selectItem.change(function(e) { changeCamera(e.target.value); });
	changeCamera(selectItem.val());
});