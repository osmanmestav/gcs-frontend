new PulldownMenu("Control",[
	{ title: "Strict", handler: function() { csharp.setAltitudeRelaxation(true); } },
	{ title: "Relax", handler: function() { csharp.setAltitudeRelaxation(false); } }
]);