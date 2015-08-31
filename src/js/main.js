/* This file should direct the entire game, making sure the board and pieces are
 * being rendered properly 
 */
 "use strict";

/// requires
var Board = require("./board"),
	Controller = require("./controller"),
	View = require("./view"),
	Player = require("./players"),
	settings = require("./settings");

window.$ = window.jQuery = require("jquery");
require("bootstrap-sass");

/// variables
var board,
	controller,
	view;

/// functions
// initialize the board and the display
function init() {
	// initialize the controller, which talks to both the view and the model. 
	// The view sends events to the controller, which in turn sends updates from
	// the board to the view.
	controller = new Controller();
	
	// create and initialize the game board in memory--the board is the model
	board = new Board({
		zones: settings.zones,
		layout: settings.boardLayout.map(function (row) {
			return row.split("");
		}),
		owner: Player.One
	});
	
	// initialize the display of the game and pass in the board so it can render
	// the board later without needing a new reference to it. The display,
	// combined with the events, make up the view
	view = new View(board, controller);
	
	controller.registerBoard(board);
	controller.registerView(view);
	
	// expose these parts of the game to the global scope if we are on a local
	// server -- this is for debugging purposes
	if (window.location.href.indexOf("localhost:") > -1) {
		window.game = {
			board: board,
			controller: controller,
			settings: settings,
			view: view
		};
	}
}

// begin a game
function beginGame(state) {
	board.placeActors(state.actors);
	board.placePuck(state.puck);
	
	view.showGame();
}

/// initialization
init();

// mock server response
beginGame({
	actors: [{
		x: 0,
		y: 4,
		owner: Player.One
	}, {
		x: 6,
		y: 0,
		owner: Player.One
	}, {
		x: 6,
		y: 2,
		owner: Player.One
	}, {
		x: 6,
		y: 5,
		owner: Player.One
	}, {
		x: 6,
		y: 7,
		owner: Player.One
	}, {
		x: 13,
		y: 3,
		owner: Player.Two
	}, {
		x: 7,
		y: 0,
		owner: Player.Two
	}, {
		x: 7,
		y: 2,
		owner: Player.Two
	}, {
		x: 7,
		y: 5,
		owner: Player.Two
	}, {
		x: 7,
		y: 7,
		owner: Player.Two
	}],
	puck: {
		x: 4,
		y: 5
	}
});