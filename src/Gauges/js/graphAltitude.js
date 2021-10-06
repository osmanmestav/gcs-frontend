
function GraphAltitude(id) {
	var titleBackGround = "rgb(64,49,39)";
	var backgroundColor = "rgb(17,14,12)";
	var valueLineColor = "rgb(19,109,19)";
	var setPointLineColor = "rgb(196,86,20)";
	var groundLineColor = "rgb(85,68,0)";
	var scaleColor = "rgb(177,147,126)";
	
	var titleFont = "19px Arial";
	var titleStyle = "rgb(177,147,126)";
	var valueFont = "19px Arial";
	var valueStyle = "rgb(177,147,126)";
	var padding = 5;
	var valueLineWidth = 2;
	var setPointLineWidth = 2;
	var minAltitudeRange = 50;
	var maxAltitudeRange = 300;
	
	var canvas = document.getElementById(id);
	canvas.style.backgroundColor = backgroundColor;
	var context = canvas.getContext("2d");
	context.imageSmoothingEnabled = true;
	context.fillStyle = titleBackGround;
	context.fillRect(0,0,canvas.width,canvas.height);

	var titleTop = padding+parseInt(titleFont);
	var titleLeft = padding;
	var valueTop = titleTop;
	var valueLeft = canvas.width/3;
	var mslValueLeft = valueLeft;
	var aglValueLeft = valueLeft+canvas.width/3;
	var graphTop = /*valueTop+*/padding;
	var graphBottom = canvas.height-padding;
	var graphWidth = canvas.width-padding;
	var graphHeight = graphBottom-graphTop;
	var midLineY = (graphTop+graphBottom)/2;
	var lastCommandId = -1;
	var valueList = [];
	
	
	var baseAltitude = 0;
	var altitudeRange = maxAltitudeRange;
	
	// draw titles and values
	// draw title
	context.font = titleFont;
	context.fillStyle = titleStyle;
	context.fillText("Altitude",titleLeft,titleTop);
	
	function addValues(valuePack) {
		if (valueList.length>=graphWidth) valueList.splice(0,1);
		valueList.push(valuePack);
	}
	
	function mapValue(mslAltitude) {
		var value = (mslAltitude-baseAltitude)/altitudeRange;
		if (value<0) value = 0; else if (value>1) value=1;
		value = (1-value)*graphHeight+graphTop;
		return value;
	}
	
	this.update = function() {
		if (!values.hasDownLink) return;
		values.groundAltitude = values.altitude-values.distanceToGround;
		addValues({ altitude: values.altitude, altitudeSP: values.altitudeSP, groundAltitude: values.groundAltitude });
		
		if (values.distanceToGround<maxAltitudeRange*0.8) {
			if (values.distanceToGround<minAltitudeRange)
				altitudeRange = minAltitudeRange;
			else
				altitudeRange = values.distanceToGround;
			altitudeRange /= 0.8;
			baseAltitude = values.groundAltitude-altitudeRange*0.1;
		}
		else {
			altitudeRange = maxAltitudeRange;
			baseAltitude = values.altitude-altitudeRange*0.9;
		}
		
		// draw value text
		context.fillStyle = titleBackGround;
		context.fillRect(valueLeft,0,canvas.width-valueLeft,graphTop);
/*
		context.font = valueFont;
		context.fillStyle = valueStyle;
		context.fillText("MSL: " + units.getAltitude(values.altitude),mslValueLeft,valueTop);
		context.fillText("AGL: " + units.getAltitude(values.distanceToGround),aglValueLeft,valueTop);
*/
		var graphLeft = graphWidth-valueList.length;
		
		// draw graph background
		context.fillStyle = backgroundColor;
		context.fillRect(graphLeft,graphTop,canvas.width,graphHeight);

		// draw ground line
		context.beginPath();
		context.fillStyle = groundLineColor;
		context.moveTo(graphLeft, mapValue(valueList[0].groundAltitude));
		valueList.forEach(function(v,x) { context.lineTo(graphLeft+x, mapValue(v.groundAltitude)); });
		context.lineTo(graphWidth-1, graphBottom);
		context.lineTo(graphLeft, graphBottom);
		context.closePath();
		context.fill();
		
		// draw altitude line
		context.beginPath();
		context.lineWidth = valueLineWidth;
		context.strokeStyle = valueLineColor;
		context.moveTo(graphLeft, mapValue(valueList[0].altitude));
		valueList.forEach(function(v,x) { context.lineTo(graphLeft+x, mapValue(v.altitude)); });
		context.stroke();

		// draw altitudeSP line
		context.beginPath();
		context.lineWidth = setPointLineWidth;
		context.strokeStyle = setPointLineColor;
		context.moveTo(graphLeft, mapValue(valueList[0].altitudeSP));
		valueList.forEach(function(v,x) { context.lineTo(graphLeft+x, mapValue(v.altitudeSP)); });
		context.stroke();
		
		// draw range scale
		context.fillStyle = scaleColor;
		var scaleHeight = graphHeight*minAltitudeRange/altitudeRange;
		context.fillRect(graphWidth,mapValue(values.groundAltitude)-scaleHeight,padding,scaleHeight);
	}
	
	return this;
}

gauges.push(new GraphAltitude("graphAltitude"));