/* This file should direct the entire game, making sure the board and pieces are
 * being rendered properly 
 */
 "use strict";

/// requires
var Board = require("./board"),
	display = require("./display"),
	settings = require("./settings");

window.$ = window.jQuery = require("jquery");
require("bootstrap-sass");

/// variables
var board;

/// functions
// initialize the board and the display
function init() {
	// create and initialize the game board in memory
	board = new Board({
		goals: settings.goals,
		layout: settings.boardLayout.map(function (row) {
			return row.split("");
		})
	});
	
	// initialize the display of the game and pass in the board so it can render
	// the board later without needing a new reference to it
	display.init(board);
}

// begin a game
function beginGame(state) {
	board.placeActors(state.actors);
	display.createActors();
}

/// initialization
init();

// mock server response
beginGame({
	actors: [{
		x: 0,
		y: 4,
		owner: "player1"
	}, {
		x: 6,
		y: 0,
		owner: "player1"
	}, {
		x: 6,
		y: 2,
		owner: "player1"
	}, {
		x: 6,
		y: 5,
		owner: "player1"
	}, {
		x: 6,
		y: 7,
		owner: "player1"
	}, {
		x: 13,
		y: 3,
		owner: "player2"
	}, {
		x: 7,
		y: 0,
		owner: "player2"
	}, {
		x: 7,
		y: 2,
		owner: "player2"
	}, {
		x: 7,
		y: 5,
		owner: "player2"
	}, {
		x: 7,
		y: 7,
		owner: "player2"
	}]
});