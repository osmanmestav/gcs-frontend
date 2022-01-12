new PulldownMenu("Mission",[
	{ 
		title: "Clear", 
		handler: function() { 
			if(csharp.isMissionEditable) 
				csharp.clearWaypoints("map-clear"); 
		} 
	},
	{ 
		title: "Upload", 
		handler: function() { 
			if(csharp.isMissionEditable) 
				csharp.uploadMission(); 
		} 
	},
	{ 
		title: "Download", 
		handler: function() { 
			if(csharp.isMissionEditable) 
				csharp.downloadMission(); 
		} 
	},
]);