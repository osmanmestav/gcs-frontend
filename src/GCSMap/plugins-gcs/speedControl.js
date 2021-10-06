new PulldownMenu("Speed",[
	{ title: "Slow", handler: function() { csharp.setAirspeed(1); } },
	{ title: "Normal", handler: function() { csharp.setAirspeed(0); } },
	{ title: "Fast", handler: function() { csharp.setAirspeed(2); } },
	{ title: "Rush", handler: function() { csharp.setAirspeed(3); } }
]);