
window.addEventListener("HomeChanged", (e)=>{
	setMapHome(e.detail);
})

contextMenus.default.addItem("Set home", (e)=> csharp.setHome(e.coordinates.latitude,e.coordinates.longitude,e.coordinates.altitude));

contextMenus.plane.addItem(
	"Set home",
	()=> csharp.setHome(plane.latitude, plane.longitude, plane.altitude)
);

mouse.registerDragDropHandler(home.name,{
	drag: function(coordinates) {
		setMapHome(coordinates);
	},
	drop: function(coordinates) {
		csharp.setHome(coordinates.latitude,coordinates.longitude,coordinates.altitude)
	}
})