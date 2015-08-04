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
	$moveContainer,
	actorDiameter,
	actorOffset,
	actors = [],
	board,
	borders = [],
	draw,
	highlight,
	legend = {
		horizontal: [],
		vertical: []
	},
	puck,
	puckDiameter,
	puckOffset,
	resizeTimeout,
	symbols = {},
	tiles = [],
	tileSize,
	validMoveIndicators = [],
	validMoves = [];

/// functions
// remove styling from any tiles which have been marked as valid moves
function clearValidMoves() {
	validMoveIndicators.forEach(function (indicator) {
		indicator.remove();
	});
	
	validMoves.forEach(function (move) {
		tiles[move.x][move.y].validMove = false;
	});
	
	validMoveIndicators.length = 0;
	validMoves.length = 0;
}

// draw and store the actors
function createActors() {
	var actor,
		i;
	
	// draw actors
	for (i = 0; i < board.actors.length; i++) {
		actor = board.actors[i];
		
		actors[i] = {
			draw: draw.nested().move(actor.x * tileSize, actor.y * tileSize)
		};
		
		actors[i].element = actors[i].draw.circle(actorDiameter)
			.fill(settings.colors.actors[actor.owner])
			.move(actorOffset, actorOffset)
			.data("actor", i);
			
		if (actor.owner === "player1") {
			actors[i].symbol = actors[i].draw.use(symbols.player1Actor)
				.style("pointer-events", "none");
		} else if (actor.owner === "player2") {
			actors[i].element.stroke({
				width: settings.actorBorderWidth
			});
		}
	}
}

// draw the board (tiles and borders) to the DOM
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
				x: x,
				y: y
			};
			
			tiles[x][y].element
				.move(x * tileSize, y * tileSize)
				.attr("fill", settings.colors.field[board.tiles[x][y].type])
				.data("position", {x: x, y: y});
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
			})
			.style("pointer-events", "none");
	}
	
	// create the legend--that is, the elements that contain the characters that
	// represent the coordinate system for the board
	createLegend();
}

// create the HTML elements that will contain the coordinates for the board
function createLegend() {
	var boardHeight = $board.height(),
		boardPos = $board.position(),
		x,
		y;
	
	function $createMarker() {
		return $("<div>").css({
			position: "absolute",
			textAlign: "center",
			fontSize: "28px",
			paddingRight: "10px",
			fontFamily: "\"Lucido Console\", monospace"
		}).appendTo($boardContainer);
	}
		
	// create horizontal legend
	for (x = 0; x < board.width; x++) {
		legend.horizontal.push($createMarker().css({
			top: (boardPos.top + boardHeight + settings.legendPadding) + "px",
			left: (x * tileSize + boardPos.left) + "px",
			width: tileSize + "px"
		}).text(settings.coordinates.horizontal[x]));
	}
	
	// create vertical legend
	for (y = 0; y < board.height; y++) {
		legend.vertical.push($createMarker().css({
			top: (y * tileSize + boardPos.top) + "px",
			left: 0,
			height: tileSize + "px",
			lineHeight: tileSize + "px"
		}).text(settings.coordinates.vertical[y]));
	}
}

// draw the puck
function createPuck() {
	puck = {
		group: draw.nested()
			.move(board.puck.x * tileSize, board.puck.y * tileSize)
	};
	
	puck.element = puck.group.circle(puckDiameter)
		.fill(settings.colors.puck)
		.move(puckOffset, puckOffset);
}

// deselect an actor if it is selected
function deselectActor() {
	window.display.selectedActor = null;
	
	clearValidMoves();
	unhighlightTile();
}

// move an actor from one tile to another, with animation
function moveActor(index) {
	actors[index].draw
		.animate(settings.animationSpeed)
		.move(board.actors[index].x * tileSize,
			  board.actors[index].y * tileSize);
}

// highlight a tile either valid or invalid
function highlightTile(tile, valid) {
	if (highlight) {
		unhighlightTile();
	}
		
	highlight = draw.rect(tileSize, tileSize)
		.move(tileSize * tile.x, tileSize * tile.y)
		.fill({
			color: valid ? settings.colors.field.valid : "red",
			opacity: 0
		})
		.style("pointer-events", "none");
	
	highlight
		.animate(100)
		.fill({
			opacity: 0.3
		});
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
	var border,
		i,
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
	for (i = 0; i < actors.length; i++) {
		updateActor(i);
	}
	
	// resize puck
	puck.group.move(board.puck.x * tileSize, board.puck.y * tileSize);
	puck.element.size(puckDiameter).move(puckOffset, puckOffset);
	
	// move and resize the legend appropriately
	updateLegend();
	
	// resize moves container appropriately
	$moveContainer.height($board.height() - $moveContainer.position().top - 30 +
		Math.floor(settings.borderWidth / 2));
}

// select a specific actor
function selectActor(actor) {
	// cause the valid moves to be displayed on the board
	showValidMoves(actor);
	window.display.selectedActor = actor;
}

// display the moves that a particular player can make
function showValidMoves(actor) {
	// determine valid moves for this actor by getting the tiles around the tile
	// it is sitting on, and then checking if the are valid places to move to
	validMoves = actor.tile.neighborhood().filter(actor.evaluateMove);
	
	validMoves.forEach(function (move, i) {
		var diameter = tileSize * settings.validMoveIndicatorSize,
			offset = Math.round((tileSize - diameter) / 2),
			indicator = draw.circle(diameter)
				.move((tileSize * move.x) + offset, 
					(tileSize * move.y) + offset)
				.fill({
					color: settings.colors.field.valid,
					opacity: 0
				})
				.style("pointer-events", "none");
		
		setTimeout(function () {
			indicator.animate(settings.animationSpeed).fill({
				opacity: 0.3
			});
		}, i * 10);
		
		tiles[move.x][move.y].validMove = true;
		validMoveIndicators.push(indicator);
	});
}

// size the board based on the container size, and update the various size
// variables so that they can be used for rendering later
function sizeBoard() {
	// determine the current tileSize based on the sizes of the DOM elements 
	// that the board will be drawn in
	tileSize = Math.floor(Math.min($boardContainer.height() / 
		(board.height + 1), $boardContainer.width() / (board.width + 1)) + 0.5);
	
	// make sure tileSize doesn't get too small
	tileSize = Math.max(tileSize, settings.minimumTileSize);
	
	// size actors
	actorDiameter = Math.round(tileSize * settings.actorSize);
	actorOffset = Math.round((tileSize - actorDiameter) / 2);
	
	// size puck
	puckDiameter = Math.round(settings.puckSize * tileSize);
	puckOffset = Math.round((tileSize - puckDiameter) / 2);
	
	// resize the DOM element the SVG elements representing board reside in
	$board.height(tileSize * board.height).width(tileSize * board.width);
	
	$(".container").css("min-width", settings.minimumTileSize * 22 + "px");
}

// unhighlight a previously highlighted tile
function unhighlightTile() {
	if (!highlight) {
		return;
	}
	
	highlight.remove();
	highlight = null;
}

// update the size and position of a single actor
function updateActor(index) {
	var actor = board.actors[index];
	actors[index].draw.move(actor.x * tileSize, actor.y * tileSize);
	actors[index].element.size(actorDiameter).move(actorOffset, actorOffset);
	
	if (actors[index].symbol) {
		actors[index].symbol.remove();
		actors[index].symbol = actors[index].draw.use(symbols.player1Actor);
	}
}

// reposition the elements in the legend
function updateLegend() {
	var boardHeight = $board.height(),
		boardPos = $board.position();
		
	// create horizontal legend
	legend.horizontal.forEach(function ($elem, x) {
		$elem.css({
			top: (boardPos.top + boardHeight + settings.legendPadding) + "px",
			left: (x * tileSize + boardPos.left) + "px",
			width: tileSize + "px"
		});
	});
	
	legend.vertical.forEach(function ($elem, y) {
		$elem.css({
			top: (y * tileSize + boardPos.top) + "px",
			left: 0,
			height: tileSize + "px",
			lineHeight: tileSize + "px"
		});
	});
}

// update the size of a single tile (and its possible element)
function updateTile(x, y) {
	tiles[x][y].element
		.size(tileSize, tileSize)
		.move(x * tileSize, y * tileSize);
}

// initialize the canvas and create the board
function init(_board) {
	// keep a reference to the board
	board = _board;
	
	// get references to the DOM elements that contain the board
	$board = $("#board");
	$boardContainer = $("#board-container");
	$moveContainer = $(".move-container");
	
	// generate an SVG element to render the game to
	draw = SVG("board");
	
	// render the game
	createBoard();
	
	// properly size the move box based on the JavaScript determined height of
	// the game board
	$moveContainer.height($board.height() - $moveContainer.position().top - 30 +
		Math.floor(settings.borderWidth / 2));
	
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
	// variables
	actors: actors,
	borders: borders,
	selectedActor: null,
	tiles: tiles,
	
	// functions
	clearValidMoves: clearValidMoves,
	createActors: createActors,
	createPuck: createPuck,
	deselectActor: deselectActor,
	highlightTile: highlightTile,
	init: init,
	moveActor: moveActor,
	selectActor: selectActor,
	showValidMoves: showValidMoves,
	unhighlightTile: unhighlightTile,
	updateActor: updateActor
};