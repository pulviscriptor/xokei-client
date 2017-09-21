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
function emit(eventName, event) {
	/*jshint validthis: true */
	controller.emit(eventName, {
		element: this,
		event: event
	});
}

// initialize all events--must be passed the display
function listen(_controller, _display) {
	var elem,
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
	
	if (display.actors.length) {
		listenToActorEvents();
	}
	
	if (display.puck) {
		listenToPuckEvents();
	}
	
	// listen for resize events to redraw the board
	$(window).resize(function () {
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}
		
		resizeTimeout = setTimeout(emit.bind(null, "window resize"), 
			settings.resizeDelay);
	});

	// events for dialog windows
	$('#game-won-another-game-button'). click(emit.bind(controller, "click another game"));
	$('#game-won-new-game-button').		click(emit.bind(controller, "click new game"));
	$('#game-select-mode-1p-human').	click(emit.bind(controller, "click mode 1p human"));
	$('#game-select-mode-1p-ai').		click(emit.bind(controller, "click mode 1p ai"));
	$('#game-select-mode-2p-local').	click(emit.bind(controller, "click mode 2p local"));
	$('#names-2p-submit-btn').	        click(emit.bind(controller, "click let's go 2p names"));
	$('#game-select-mode-raplay-saved').click(emit.bind(controller, "click mode replay saved"));
	$('#game-won-save-game-button').	click(emit.bind(controller, "save game"));
	$('#copy-moves').					click(emit.bind(controller, "save game"));
	$('#settings-btn').					click(emit.bind(controller, "click settings button"));
	$('#settings-save-btn').			click(emit.bind(controller, "click settings save button"));

	// listeners to expand/collapse notation
	$('.move-container').on('click', '.notation-expand-collapse-icon', function() {
		display.metaExpandCollapse($(this));
	});
}

function listenToActorEvents() {
	var elem,
		i;
	
	// loop through player's actors and create click events for them
	for (i = 0; i < display.actors.length; i++) {
		elem = display.actors[i].element;
		elem.click(emit.bind(elem, "click actor"));
	}
}

function listenToPuckEvents() {
	display.puck.element.click(emit.bind(display.puck.element, "click puck"));
}

/// exports
module.exports = {
	listen: listen,
	listenToActorEvents: listenToActorEvents,
	listenToPuckEvents: listenToPuckEvents
};