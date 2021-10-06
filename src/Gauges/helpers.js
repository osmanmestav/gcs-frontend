
document.addEventListener("dblclick", function(event){
    event.preventDefault();
    event.stopPropagation();
},true);

function loadScript(url, callback)
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    script.onreadystatechange = callback;
    document.head.appendChild(script);
}

function loadContent(id,url,callback) {
	var el = document.getElementById(id);
	var ajax = new XMLHttpRequest();
    ajax.onload = function(e) {
		if (el)
			el.innerHTML += ajax.responseText;
		if (callback)
			callback(ajax.responseText);
    }
    ajax.open("GET", url, true);
    ajax.send();
}

function loadSvg(id, url, callback) {
	// If SVG is supported
	if (typeof SVGRect != "undefined")
		loadContent(id,url,callback);
	else
		document.getElementById(id).innerHTML = "SVG is not supported";
}

function setSVGVisibility(el,visible) {
	el.setAttribute("transform","scale("+(visible? 1 : 0)+")");
}