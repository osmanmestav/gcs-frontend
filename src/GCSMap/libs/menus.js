var contextMenus = { };

function ContextMenu(items) {
	var ulElement = $("<ul></ul>").addClass("ui-menu ui-widget").prop("role","menu");
	this.container = $("<div></div>").addClass("cesium-box context-menu").hide().append(ulElement);
	$('.cesium-viewer-cesiumWidgetContainer').prepend(this.container);
	this.addItem=(title,handler) => {
		var innerHandler = ()=>{ this.hide(); handler({coordinates:this.coordinates,target:this.target,targetType:this.targetType,targetIndex:this.targetIndex}); };
		ulElement.append($("<li></li>").text(title).addClass("ui-menu-item").prop("role","menuitem").click(innerHandler));
	}
	if (items)
		items.forEach((i)=>{ this.addItem(i.title,i.handler); });
	
	var mouseClickHandler;
	this.show=function(x,y) {
		if (contextMenus.current)
			contextMenus.current.hide();
		this.coordinates = mouse.coordinates;
		this.target = mouse.target;
		this.targetType = mouse.targetType;
		this.targetIndex = mouse.targetIndex;
		contextMenus.current = this;
		this.container.css({ left: (x||0)+"px", top: (y||0)+"px" });
		this.container.show();
		mouseClickHandler = eventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
		eventHandler.setInputAction(function(e) {
			if (contextMenus.current) contextMenus.current.hide();
			else eventHandler.setInputAction(mouseClickHandler, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		if (this.onshow)
			this.onshow(this);
	};
	this.hide=function() {
		this.container.hide();
		contextMenus.current = null;
		eventHandler.setInputAction(mouseClickHandler, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		if (this.onhide)
			this.onhide(this);
	};
}

contextMenus.default = new ContextMenu();
eventHandler.setInputAction(function(movement) {
	if (!window.enableMouseEvents || !window.mouse) return;
	(contextMenus[mouse.targetType]||contextMenus.default).show(mouse.position.x-10,mouse.position.y-10);
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

var instantContextMenu = new ContextMenu();
eventHandler.setInputAction(function(movement) {
	if (!window.enableMouseEvents || !window.mouse) return;
	instantContextMenu.show(mouse.position.x-10,mouse.position.y-10);
}, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);

function PulldownMenu(title,items) {
	var ulElement = $("<ul></ul>").addClass("ui-menu ui-widget");
	var container = $("<span></span>")
	.addClass("dropdown-menu")
	.append(
		$("<div></div>")
		.addClass("cesium-button")
		.text(title)
	)
	.append(
		$("<div></div>")
		.addClass("cesium-box dropdown-menu-content")
		.append(ulElement)
	);
	//$('.cesium-viewer-toolbar').prepend(container);
	container.insertBefore(".cesium-navigationHelpButton-wrapper");
	this.addItem=function(title,handler,options) {
		let el = $("<li></li>").addClass("ui-menu-item");
		if (Array.isArray(options)) {
			el.append($("<label></label>").text(title));
			el.selectElement = $("<select></select>").change(handler);
			el.setOptions = (options)=>{el.selectElement.empty();options.forEach(o=>el.selectElement.append($("<option></option>").attr("value",o.value).text(o.title)))};
			el.setOptions(options);
			el.append(el.selectElement);
		}
		else el.text(title).click(handler);
		ulElement.append(el);
		return el;
	}
	if (items)
		items.forEach((i)=>{ this.addItem(i.title,i.handler,i.options); });
}