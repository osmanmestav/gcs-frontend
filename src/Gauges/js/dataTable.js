var dataTable = null;

loadSvg("dataTableContainer","svg/dataTable.svg",function() {
	var dataTableContainer = document.getElementById("dataTableContainer");
	var svg = document.getElementById("dataTable");
	var dataNames = ["currentCommand","commandSource","retractStatus","distanceToWayPoint","distanceToHome","bearingFromHome","systemTime","hoverTime","flightTime","gpsTime","latitudeSt","longitudeSt","aglAltitude","mslAltitude"];
	var elements = dataNames.map(function(id) { return document.getElementById(id); });
	
	var progressBar = svg.getElementById("progressBar");
	var maxWidth = progressBar.getAttribute("width")*1;

	gauges.push(dataTable = {
		svg: svg,
		visibilityCounter: 0,
		isVisible: function() {
			return dataTableContainer.style.visibility != "hidden";
		},
		show: function() {
			dataTableContainer.style.visibility = "visible";
		},
		hide: function() {
			dataTableContainer.style.visibility = "hidden";
		},
		update: function() {
			if (!dataTable.isVisible()) return;
			progressBar.setAttribute("width",maxWidth*(values.percentCompleted/100.0));
			dataNames.forEach(function(name,i) { elements[i].innerHTML = values[name]; });
		}
	});
});
