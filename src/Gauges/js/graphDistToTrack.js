
function GraphDistanceToTrack(id) {
	var titleBackGround = "rgb(64,49,39)";
	var backgroundColor = "rgb(17,14,12)";
	var curveLineColor = "rgb(19,109,19)";
	var exceedColor = "rgb(196,86,20)";
	var midLineColor = "rgb(85,68,0)";
	var toleratedLineColor = "rgb(85,68,0)";
	var titleFont = "13px Arial";
	var titleStyle = "rgb(177,147,126)";
	var valueFont = "13px Arial";
	var valueStyle = "rgb(177,147,126)";
	var padding = 5;
	var curveLineWidth = 2;
	var midLineWidth = 2;
	var maxDistToTrack = 50;
	var toleratedDistToTrack = 10;
	var toleratedLineWidth = 1;
	
	var canvas = document.getElementById(id);
	canvas.style.backgroundColor = backgroundColor;
	var context = canvas.getContext("2d");
	context.imageSmoothingEnabled = true;
	context.fillStyle = titleBackGround;
	context.fillRect(0,0,canvas.width,canvas.height);

	var titleTop = padding+parseInt(titleFont);
	var titleLeft = padding;
	var valueTop = titleTop;
	var valueLeft = canvas.width/2;
	var graphTop = valueTop+padding;
	var graphBottom = canvas.height-padding;
	var graphHeight = graphBottom-graphTop;
	var midLineY = (graphTop+graphBottom)/2;
	var animationSeconds = 3; // seconds 
	var animationEndTime = 0;
	var isAnimating = false;
	var lastCommandId = -1;
	var prevValue = null;
	
	
	// draw titles and values
	// draw title
	context.font = titleFont;
	context.fillStyle = titleStyle;
	context.fillText("Cross track error",titleLeft,titleTop);
	
	function shiftLeft() {
		var imgData=context.getImageData(1,graphTop,canvas.width,graphHeight);
		context.putImageData(imgData,0,graphTop);
	}
	
	function drawPoint(y,width,color) {
		context.beginPath();
		context.moveTo(canvas.width-1, y);
		context.lineTo(canvas.width, y);
		context.lineWidth = width;
		context.strokeStyle = color;
		context.stroke();
	}
	
	function mapValue(value) {
		value = value/maxDistToTrack/2;
		value += 0.5;
		value = (1-value)*graphHeight+graphTop;
		return value;
	}
	
	var midLineY = mapValue(0);
	var toleratedLineUpY = mapValue(toleratedDistToTrack);
	var toleratedLineDownY = mapValue(-toleratedDistToTrack);
	
	this.update = function() {
		var value = values.distanceToTrack;
		if (lastCommandId!=values.incrementalCommandId) {
			lastCommandId = values.incrementalCommandId;
			animationEndTime = new Date().getTime()+animationSeconds*1000;
			prevValue = null;
		}
		animationAngle = (animationEndTime-new Date().getTime())/500;
		isAnimating = animationAngle>0;
		
		if (isAnimating) {
			context.fillStyle = titleBackGround;
			context.fillRect(0,graphTop,canvas.width,graphHeight);
			return;
		}

		shiftLeft();
		// draw value text
		context.fillStyle = titleBackGround;
		context.fillRect(valueLeft,0,parseInt(valueFont)*5,graphTop);
		context.stroke();
		context.font = valueFont;
		context.fillStyle = valueStyle;
		context.fillText(units.getTrackError(value),valueLeft,valueTop);

		// draw value
		var color = curveLineColor;
		if (value<-maxDistToTrack || value>maxDistToTrack) {
			color = exceedColor;
			value = (value<-maxDistToTrack)? -maxDistToTrack+curveLineWidth/2 : maxDistToTrack-curveLineWidth/2;
		}
		value = mapValue(value);
		if (prevValue==null) prevValue = value;
		
		context.beginPath();
		context.moveTo(canvas.width-1, prevValue);
		context.lineTo(canvas.width, value);
		context.lineWidth = curveLineWidth;
		context.strokeStyle = color;
		context.stroke();
		prevValue = value;
		
		drawPoint(midLineY,midLineWidth,midLineColor);
		drawPoint(toleratedLineUpY,toleratedLineWidth,toleratedLineColor);
		drawPoint(toleratedLineDownY,toleratedLineWidth,toleratedLineColor);
	}
	
	return this;
}

gauges.push(new GraphDistanceToTrack("graphDistanceToTrack"));