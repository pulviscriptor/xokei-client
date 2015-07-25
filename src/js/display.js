/* Render the board to the DOM using SVG -- this is the "view" component of the
 * client
 */
"use strict"; 

/// requires
var SVG = require("svg.js");

var settings = require("./settings");

/// private variables
var $board,
	$boardContainer,
	actors = [],
	board,
	draw,
	symbols = {},
	tileSize;

/// functions
// draw and store the actors
function createActors() {
	var actor,
		i,
		offset,
		diameter;
	
	diameter = Math.round(tileSize * settings.actorSize);
	offset = Math.round((tileSize - diameter) / 2);
	
	// draw actors
	for (i = 0; i < board.actors.length; i++) {
		actor = board.actors[i];
		
		actors[i] = draw.nested()
			.move(actor.x * tileSize, actor.y * tileSize);
		
		actors[i].circle(diameter)
			.fill(settings.colors.actors[actor.owner])
			.move(offset, offset);
		
		actors[i].use(symbols.actor);
	}
}

// draw the board (tiles, borders, and tile symbols) to the DOM
function createBoard() {
	var border,
		i,
		x,
		y;
	
	// determine the current tileSize based on the sizes of the DOM elements 
	// that the board will be drawn in
	tileSize = Math.floor(Math.min($boardContainer.height() / board.height, 
		$boardContainer.width() / board.width) + 0.5);
	
	// resize the board DOM element 
	$board.height(tileSize * board.height).width(tileSize * board.width);
	
	// render the symbols for later use
	renderSymbols();
	
	// draw tiles
	for (x = 0; x < board.width; x++) {
		for (y = 0; y < board.height; y++) {
			// draw the tile
			draw.rect(tileSize, tileSize)
				.move(x * tileSize, y * tileSize)
				.attr("fill", settings.colors.field[board.tiles[x][y].type]);
				
			// draw the goal symbol if the tile is a goal
			if (board.tiles[x][y].goal) {
				draw.use(symbols.goal).move(x * tileSize, y * tileSize);
			}
		}
	}
	
	// draw borders
	for (i = 0; i < settings.borders.length; i++) {
		border = settings.borders[i];
		draw.rect(border.width * tileSize, border.height * tileSize)
			.move(border.x * tileSize, border.y * tileSize)
			.fill({
				opacity: 0
			})
			.stroke({
				color: "black",
				width: settings.borderWidth
			});
	}
}

// prerender symbols at a certain tileSize
function renderSymbols() {
	var i,
		paths,
		symbolName;
	
	// prerender symbols based on tileSize
	for (symbolName in settings.symbols) {
		paths = settings.symbols[symbolName].paths;
		
		// store a reference to this symbol
		symbols[symbolName] = draw.symbol();
		
		// actually add the lines to this symbol
		for (i = 0; i < paths.length; i++) {
			symbols[symbolName]
				.polyline(paths[i].map(resizeSymbol))
				.fill("none")
				.stroke(settings.symbols[symbolName].stroke);
		}
	}
}

// initialize the canvas and create the board
function init(_board) {
	// keep a reference to the board
	board = _board;
	
	// get references to the DOM elements that contain the board
	$board = $("#board");
	$boardContainer = $("#board-container");
	
	draw = SVG("board").spof();
	
	createBoard();
}

// size a symbol appropriately
function resizeSymbol(point) {
	return [point[0] * tileSize * 0.1, 
			point[1] * tileSize * 0.1];
}

/// exports
module.exports = window.display = {
	createActors: createActors,
	init: init
};