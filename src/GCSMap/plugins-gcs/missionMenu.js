new PulldownMenu("Mission",[
	{ title: "Clear", handler: function() { csharp.clearWaypoints("map-clear"); } },
	{ title: "Upload", handler: function() { csharp.uploadMission(); } },
	{ title: "Download", handler: function() { csharp.downloadMission(); } }
]);