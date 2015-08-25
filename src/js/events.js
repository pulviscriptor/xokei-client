/* Attach events to the DOM and the SVG board and when they are fired send them
 * to the controller to be handled appropriately
 */
"use strict";

/// requires
var settings = require("./settings");

/// private variables
var controller,
	display,
	resizeTimeout;

/// functions
function emit (eventName, event) {
	/*jshint validthis: true */
	controller.emit(eventName, {
		element: this,
		event: event
	});
}

// initialize all events--must be passed the display
function listen(_controller, _display) {
	var elem,
		i,
		x,
		y;
	
	controller = _controller;
	display = _display;
	
	for (x = 0; x < display.tiles.length; x++) {
		for (y = 0; y < display.tiles[x].length; y++) {
			elem = display.tiles[x][y].element;
			
			elem.on("click", emit.bind(elem, "click tile"))
				.on("mouseover", emit.bind(elem, "mouse enter tile"))
				.on("mouseout", emit.bind(elem, "mouse exit tile"));
		}
	}
	
	// loop through player's actors and create click events for them
	for (i = 0; i < display.actors.length; i++) {
		elem = display.actors[i].element;
		elem.click(emit.bind(elem, "click actor"));
	}
	
	display.puck.element.click(emit.bind(display.puck.element, "click puck"));
	
	// listen for resize events to redraw the board
	$(window).resize(function () {
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}
		
		resizeTimeout = setTimeout(emit.bind(null, "window resize"), 
			settings.resizeDelay);
	});
}

/// exports
module.exports = {
	listen: listen
};