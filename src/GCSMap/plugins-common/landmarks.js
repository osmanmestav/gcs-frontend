viewer.dataSources.add(Cesium.KmlDataSource
    .load('layer.kmz', {
        camera: viewer.camera,
        canvas: viewer.canvas,
		clampToGround: true
    })
)
.then( function (dataSource) {
   // viewer.flyTo(dataSource.entities);
   viewer.zoomTo(dataSource.entities);
});

describer.defaultHandler = (target,title)=> {
	if (target.primitive && target.primitive.position) {
		var coor = getCoordinatesFromCartesian(target.primitive.position);
		if (window.plane && title!="plane") {
			var planeCoors = { latitude: plane.latitude, longitude: plane.longitude, altitude: plane.altitude };
			return  title+"<br/>Plane "+describer.getDistanceAndDirectionDescription(coor,planeCoors);
		}
		return title+"<br/>"+describer.getCoordinatesDescription(coor);
	}
	return title;
};