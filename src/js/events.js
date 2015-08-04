/* Attach events to the DOM and the SVG board and handle them appropriately
 */

"use strict";

/// requires
// var settings = require("./settings");

/// private variables
// a reference to the display singleton, which itself contains references to the
// other elements being held in the DOM
var board,
	display;

/// functions
// 
function actorClick(e) {
	/* jshint validthis: true */
	var actor = board.actors[this.data("actor")];
	
	// if the actor that has been clicked on is the currently selected actor,
	// don't do anything
	if (actor === display.selectedActor) {
		return false;
	}
	
	display.deselectActor();
	
	// if this actor belongs to the owner of the board
	if (actor.owner !== board.settings.owner) {
		return false;
	}

	// display the clicked actor as selected
	display.selectActor(actor);
	
	// and attach an event to the body such that whenever a click is performed, 
	// hide all valid moves and deselect the actor
	$("*").not($(this).parent()[0]).one("click", function () {
		console.log(this);
		display.deselectActor();
	});
	
	e.stopPropagation();
	return false;
}

// initialize all events--must be passed the display
function listen(_board, _display) {
	var i,
		x,
		y;
	
	// store a reference to the board that is being passed in
	board = _board;
	
	// store a reference to the display that is being passed in
	display = _display;
	
	for (x = 0; x < display.tiles.length; x++) {
		for (y = 0; y < display.tiles[x].length; y++) {
			display.tiles[x][y].element
				.on("click", tileClick)
				.on("mouseover", mouseEnterTile)
				.on("mouseout", mouseExitTile);
		}
	}
	
	// loop through player's actors and create click events for them
	for (i = 0; i < display.actors.length; i++) {
		display.actors[i].element.click(actorClick);
	}
}

function mouseEnterTile() {
	/* jshint validthis: true */
	var position = this.data("position"),
		tile = display.tiles[position.x][position.y];
		
	if (tile.validMove) {
		display.highlightTile(tile, true);
	}
}

function mouseExitTile() {
	/* jshint validthis: true */
	display.unhighlightTile();
}

function tileClick() {
	/* jshint validthis: true */
	var position = this.data("position"),
		tile = display.tiles[position.x][position.y];
		
	if (tile.validMove) {
		display.selectedActor.move(board.tiles[position.x][position.y]);
		display.moveActor(board.actors.indexOf(display.selectedActor));
	}
}

/// exports
module.exports = {
	listen: listen
};