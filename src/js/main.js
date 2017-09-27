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

/// global variables
window.globalVariables = {
	mockServerResponse: {
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
		}]
	}
};

window.$ = window.jQuery = require("jquery");
require("jquery-ui");

require("bootstrap-sass");

/// variables
var board,
	controller,
	view;

/// functions
// initialize the board and the display
function init() {
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
	view = new View(board);
	
	// create the controller, which talks to both the view and the model. The
	// view sends events to the controller, which in turn sends updates from the
	// board to the view.
	controller = new Controller(board, view);
	
	// sent the controller to the view
	view.controller = controller;
	
	// expose these parts of the game to the global scope for phantom testing
	window.game = {
		board: board,
		controller: controller,
		settings: settings,
		view: view,
		puck: require('./puck.js'),
		display: require('./display.js'),
		utils: require('./utils.js')
	};

	// initialize dialogs (like make it draggable for example)
	view.initDialogsWindows();
}

// begin a game
function beginGame(state) {
	board.placeActors(state.actors);
	
	if (state.puck) {
		board.placePuck(state.puck);
	}
	
	view.showGame();
	
	/*if (!state.puck) {
		controller.setUIState("placing puck");
	}*/

	// we have welcome screen to display and interact with
	controller.setUIState("game inactive");
}

/// initialization
init();

// mock server response
beginGame(window.globalVariables.mockServerResponse);
