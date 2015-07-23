/// requires
var SVG = require("svg.js");

var settings = require("./settings"),
	Tile = require("./tile");

/// variables
var $board,
	$boardContainer,
	board,
	boardHeight,
	boardWidth,
	draw,
	tileSize;

/// functions
function drawBoard() {
	// draw tiles
	var border,
		i,
		x,
		y;
		
	for (x = 0; x < 14; x++) {
		for (y = 0; y < 8; y++) {
			draw.rect(tileSize, tileSize)
				.move(x * tileSize, y * tileSize)
				.attr("fill", settings.tileColors[board.tiles[x][y].type]);
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
	$board = $("#board");
	$boardContainer = $("#board-container");
	
	boardHeight = $boardContainer.height();
	boardWidth = $boardContainer.width();

	tileSize = Math.floor(Math.min(boardHeight / 8, boardWidth / 14) + 0.5);
	$board.height(tileSize * 8).width(tileSize * 14);
	
	draw = SVG("board").spof();
	
	board = _board;
	drawBoard();
}

/// exports
module.exports = window.display = {
	init: init
};