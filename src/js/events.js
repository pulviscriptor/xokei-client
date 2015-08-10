/* Attach events to the DOM and the SVG board and when they are fired send them
 * to the controller to be handled appropriately
 */

"use strict";

/// requires
// var settings = require("./settings");

/// private variables
var controller,
	display;

/// functions
// initialize all events--must be passed the display
function listen(_controller, _display) {
	var i,
		x,
		y;
	
	controller = _controller;
	display = _display;
	
	for (x = 0; x < display.tiles.length; x++) {
		for (y = 0; y < display.tiles[x].length; y++) {
			display.tiles[x][y].element
				.on("click", clickTile)
				.on("mouseover", mouseEnterTile)
				.on("mouseout", mouseExitTile);
		}
	}
	
	// loop through player's actors and create click events for them
	for (i = 0; i < display.actors.length; i++) {
		display.actors[i].element.click(clickActor);
	}
}

function mouseEnterTile(e) {
	/* jshint validthis: true */
	controller.emit("mouse enter tile", {
		element: this,
		event: e
	});
}

function mouseExitTile(e) {
	/* jshint validthis: true */
	controller.emit("mouse exit tile", {
		element: this,
		event: e
	});
}

function clickActor(e) {
	/* jshint validthis: true */
	controller.emit("click actor", {
		element: this,
		event: e
	});
}

function clickTile(e) {
	/* jshint validthis: true */
	controller.emit("click tile", {
		element: this,
		event: e
	});
}

/// exports
module.exports = {
	listen: listen
};