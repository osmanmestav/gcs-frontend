
function Graph(id,values) {

	var normalRangeSemiHeight = 0.3;
	var normalColor = "#00FF00";
	var cautionColor = "#FDFD00"
	var alertColor = "#FF0000";
	var midlineColor = "yellow";
	var multiplyColor = "#F0F0F0";
	var borderStyle = "#A0A000";
	var titleFont = "19px Tahoma";
	var titleStyle = "#b1937e";
	var valueFont = "19px Tahoma";
	var valueStyle = "lightgray";
	var padding = 5;
	var margin = 20; // Left and right margins
	var curveLineWidth = 5;
	
	var canvas = document.getElementById(id);
	canvas.style.backgroundColor = "black";
	var context = canvas.getContext("2d");
	context.fillStyle = "black";
	context.fillRect(0,0,canvas.width,canvas.height);

	var titleTop = padding+parseInt(titleFont);
	var valueTop = titleTop+parseInt(titleFont)+padding;
	var graphTop = valueTop+parseInt(valueFont);
	var graphBottom = canvas.height-padding;
	var graphHeight = graphBottom-graphTop;
	var midLineY = (graphTop+graphBottom)/2;
	var animationSeconds = 3; // seconds 
	var animationEndTime = 0;
	var animationAngle = 0;
	var isAnimating = false;
	var lastCommandId = -1;

	var items = []; // array of {title,unit,minValue,maxValue}

	var gradient = context.createLinearGradient(0,graphTop,0,graphBottom);
	gradient.addColorStop(0,alertColor);
	gradient.addColorStop(0.40-normalRangeSemiHeight,alertColor);
	gradient.addColorStop(0.50-normalRangeSemiHeight,cautionColor);
	gradient.addColorStop(0.60-normalRangeSemiHeight,normalColor);
	gradient.addColorStop(0.40+normalRangeSemiHeight,normalColor);
	gradient.addColorStop(0.50+normalRangeSemiHeight,cautionColor);
	gradient.addColorStop(0.60+normalRangeSemiHeight,alertColor);
	gradient.addColorStop(1,alertColor);
	
	function degrade() {
		context.globalCompositeOperation = "multiply";
		context.fillStyle = multiplyColor;
		context.fillRect(0,0,canvas.width,canvas.height);
		context.globalCompositeOperation = "source-over";
	}
	
	function drawMidLine() {
		context.fillStyle = "yellow";
		context.fillRect(0,midLineY,canvas.width,2);
	}
	
	function mapValue(item,value) {
		if (isAnimating)
			value = Math.sin(animationAngle)*(2*(item.index&1)-1)*0.15;
		else 
			if (value<0)
				value = -value*normalRangeSemiHeight/item.minValue;
			else
				value = value*normalRangeSemiHeight/item.maxValue;
		value += 0.5;
	//	if (value<-1) { value = 0; barHeight *= 5; }
	//	if (value>1) { value = 1; barHeight *= 5; }
		value = (1-value)*graphHeight+graphTop;
		return value;
	}
	
	var left = margin;
	this.addItem = function(id,title,width,unit,minValue,maxValue) {
		items.push({
			index: items.length,
			id: id,
			title: title,
			left: left,
			middle: left+width/2,
			right: left+width,
			width: width,
			format: function(value) { return units[unit]? units[unit](value) : (value.toFixed(1)+unit); },
			minValue: minValue,
			maxValue: maxValue
		});
		left = left+width;
	}
	
	this.update = function() {
		if (!values.hasDownLink) return;
		if (items.length==0)
			return;
		if (lastCommandId!=values.incrementalCommandId) {
			lastCommandId = values.incrementalCommandId;
			animationEndTime = new Date().getTime()+animationSeconds*1000;
		}
		animationAngle = (animationEndTime-new Date().getTime())/500;
		isAnimating = animationAngle>0;
		
		degrade();

		// draw curve
		var prevItemValue = midLineY;
		var prevItemMiddle = 0;
		var prevItemRight = margin;
		
		items.forEach(function(item, i) {
			context.fillStyle = borderStyle;
			context.fillRect(item.middle,graphTop,1,graphHeight);
			
			var rawValue = (values[item.id]||0);
			var value = mapValue(item,rawValue);
			context.beginPath();
			context.moveTo(prevItemMiddle, prevItemValue);
			context.bezierCurveTo(item.left, prevItemValue, item.left, value, item.middle,value);
			context.lineWidth = curveLineWidth;
			context.strokeStyle = gradient;
			context.stroke();
			
			prevItemMiddle = item.middle;
			prevItemRight = item.right;
			prevItemValue = value;
		});
		
		// draw graph last part
		context.beginPath();
		context.moveTo(prevItemMiddle, prevItemValue);
		context.bezierCurveTo(prevItemRight, prevItemValue, prevItemRight, midLineY, canvas.width,midLineY);
		context.lineWidth = curveLineWidth;
		context.strokeStyle = gradient;
		context.stroke();
		
		// draw titles and values
		context.fillStyle = "black";
		context.fillRect(0,0,canvas.width,graphTop);
		items.forEach(function(item, i) {
			// draw title
			context.textAlign = "center";
			context.font = titleFont;
			context.fillStyle = titleStyle;
			context.fillText(item.title,item.middle,titleTop);
			
			// draw value
			context.font = valueFont;
			context.fillStyle = valueStyle;
			var rawValue = values[item.id]||0;
			context.fillText(item.format(rawValue),item.middle,valueTop);
		});
		
		drawMidLine();
	}
	
	return this;
}

var graph = new Graph("graph",values);
graph.addItem("rollError","roll err",105,"deg",-10,10);
graph.addItem("pitchError","pitch err",105,"deg",-10,10);
graph.addItem("yawRateError","yaw rate err",135,"deg/s",-10,10);
graph.addItem("airspeedError","airspeed err",135,"getSpeedSt",-5,5);
graph.addItem("climbRateError","climb rate err",135,"getClimbRateSt",-4,4);
graph.addItem("wind","wind",75,"getWindSpeedSt",-30,30);
gauges.push(graph);