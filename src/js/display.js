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
	borders = [],
	draw,
	puck,
	resizeTimeout,
	symbols = {},
	tiles = [],
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
		
		actors[i] = {
			draw: draw.nested().move(actor.x * tileSize, actor.y * tileSize)
		};
		
		actors[i].element = actors[i].draw.circle(diameter)
			.fill(settings.colors.actors[actor.owner])
			.move(offset, offset);
		
		actors[i].symbol = actors[i].draw.use(symbols.actor);
	}
}

// draw the board (tiles, borders, and tile symbols) to the DOM
function createBoard() {
	var border,
		i,
		x,
		y;
	
	// make sure the board is the appropriate size, and the tileSize variable is
	// determined as well
	sizeBoard();
	
	// render symbols passed in in the settings file for later use
	renderSymbols();
	
	// draw tiles
	for (x = 0; x < board.width; x++) {
		tiles[x] = [];
		
		for (y = 0; y < board.height; y++) {
			// draw the tile
			tiles[x][y] = {
				element: draw.rect(tileSize, tileSize),
			};
			
			tiles[x][y].element
				.move(x * tileSize, y * tileSize)
				.attr("fill", settings.colors.field[board.tiles[x][y].type]);
				
			// draw the goal symbol if the tile is a goal
			if (board.tiles[x][y].goal) {
				tiles[x][y].symbol = draw
					.use(symbols.goal)
					.move(x * tileSize, y * tileSize);
			}
		}
	}
	
	// draw borders
	for (i = 0; i < settings.borders.length; i++) {
		border = settings.borders[i];
		borders[i] = draw.rect(border.width * tileSize, 
				border.height * tileSize)
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

// draw the puck
function createPuck() {
	var puckDiameter = Math.round(settings.puckSize * tileSize),
		puckOffset = Math.round((tileSize - puckDiameter) / 2);
	
	puck = {
		group: draw.nested()
			.move(board.puck.x * tileSize, board.puck.y * tileSize)
	};
	
	puck.element = puck.group.circle(puckDiameter)
		.fill(settings.colors.puck)
		.move(puckOffset, puckOffset);
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

// resize board
function resizeBoard() {
	var actorDiameter,
		actorOffset,
		border,
		i,
		puckDiameter,
		puckOffset,
		x,
		y;
	
	// update tile and board size
	sizeBoard();
	
	// re-render symbols
	renderSymbols();
	
	// resize tiles
	for(x = 0; x < board.width; x++) {
		for (y = 0; y < board.height; y++) {
			updateTile(x, y);
		}
	}
	
	// resize borders
	for (i = 0; i < borders.length; i++) {
		border = settings.borders[i];
		borders[i].size(border.width * tileSize, border.height * tileSize)
			.move(border.x * tileSize, border.y * tileSize);
	}
	
	// resize actors
	actorDiameter = Math.round(tileSize * settings.actorSize);
	actorOffset = Math.round((tileSize - actorDiameter) / 2);
	
	for (i = 0; i < actors.length; i++) {
		updateActor(i, actorDiameter, actorOffset);
	}
	
	// resize puck
	puckDiameter = Math.round(settings.puckSize * tileSize);
	puckOffset = Math.round((tileSize - puckDiameter) / 2);
	
	puck.group.move(board.puck.x * tileSize, board.puck.y * tileSize);
	puck.element.size(puckDiameter).move(puckOffset, puckOffset);
}

// size the board based on the container size, and update the tileSize variable
function sizeBoard() {
	// determine the current tileSize based on the sizes of the DOM elements 
	// that the board will be drawn in
	tileSize = Math.floor(Math.min($boardContainer.height() / board.height, 
		$boardContainer.width() / board.width) + 0.5);
	
	// resize the DOM element the SVG elements representing board reside in
	$board.height(tileSize * board.height).width(tileSize * board.width);
}

// update the size and position of a single actor
function updateActor(index, diameter, offset) {
	var actor = board.actors[index];
	console.log(offset);
	actors[index].draw.move(actor.x * tileSize, actor.y * tileSize);
	actors[index].element.size(diameter).move(offset, offset);
	actors[index].symbol.remove();
	actors[index].symbol = actors[index].draw.use(symbols.actor);
}

// update the size of a single tile (and its possible element)
function updateTile(x, y) {
	tiles[x][y].element
		.size(tileSize, tileSize)
		.move(x * tileSize, y * tileSize);
		
	if (board.tiles[x][y].goal) {
		tiles[x][y].symbol.remove();
		tiles[x][y].symbol = draw.use(symbols.goal)
			.move(x * tileSize, y * tileSize);
	}
}

// initialize the canvas and create the board
function init(_board) {
	// keep a reference to the board
	board = _board;
	
	// get references to the DOM elements that contain the board
	$board = $("#board");
	$boardContainer = $("#board-container");
	
	// generate an SVG element to render the game to
	draw = SVG("board");
	
	// render the game
	createBoard();
	
	// listen for resize events to redraw the board
	$(window).resize(function () {
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}
		
		resizeTimeout = setTimeout(resizeBoard, settings.resizeDelay);
	});
}

// size a symbol appropriately
function resizeSymbol(point) {
	return [point[0] * tileSize * 0.1, 
			point[1] * tileSize * 0.1];
}

/// exports
module.exports = window.display = {
	createActors: createActors,
	createPuck: createPuck,
	init: init
};