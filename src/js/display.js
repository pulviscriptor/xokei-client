/// requires
var SVG = require("svg.js");

var settings = require("./settings"),
	Tile = require("./tile");

/// private variables
var $board,
	$boardContainer,
	board,
	draw,
	symbols = {},
	tileSize;

/// functions
function drawBoard() {
	var border,
		i,
		paths,
		symbolName,
		x,
		y;
	
	// determine the current tileSize based on the sizes of the DOM elements 
	// that the board will be drawn in
	tileSize = Math.floor(Math.min($boardContainer.height() / board.height, 
		$boardContainer.width() / board.width) + 0.5);
	
	// resize the board DOM element 
	$board.height(tileSize * board.height).width(tileSize * board.width);
	
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
	
	// draw tiles
	for (x = 0; x < board.width; x++) {
		for (y = 0; y < board.height; y++) {
			// draw the tile
			draw.rect(tileSize, tileSize)
				.move(x * tileSize, y * tileSize)
				.attr("fill", settings.tileColors[board.tiles[x][y].type]);
				
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

function init(_board) {
	// keep a reference to the board
	board = _board;
	
	// get references to the DOM elements that contain the board
	$board = $("#board");
	$boardContainer = $("#board-container");
	
	draw = SVG("board").spof();
	drawBoard();
}

// size a symbol appropriately
function resizeSymbol(point) {
	return [point[0] * (tileSize * settings.symbolSize) * 0.1, 
			point[1] * (tileSize * settings.symbolSize) * 0.1];
}

/// exports
module.exports = window.display = {
	init: init
};