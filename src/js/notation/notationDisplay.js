var settings = require('../settings');
var Player = require("../players");

function NotationDisplay() {
    this.draw = window.game.view.display.draw;
    this.tileSize = window.game.view.display.tileSize;
    this.board = window.game.board;

    this.tiles = [];
    this.borders = [];

    this.createBoard();
    this.drawBorders();
}

NotationDisplay.prototype = {
    createBoard: function () {
        this.drawTiles();
    },

    drawTiles: function () {
        for (x = 0; x < this.board.width; x++) {
			this.tiles[x] = [];
			
			for (y = 0; y < this.board.height; y++) {
				// draw the tile
				this.tiles[x][y] = {
					element: this.draw.rect(this.tileSize, this.tileSize),
					x: x,
					y: y
				};

				this.tiles[x][y].element
					.move(x * this.tileSize, y * this.tileSize)
					.attr("fill", settings.colors.field
						[this.board.tiles[x][y].type])
					.data("position", {x: x, y: y});
			}
		}
    },

    drawBorders: function () {
		for (i = 0; i < settings.borders.length; i++) {
			border = settings.borders[i];
			this.borders[i] = this.draw.rect(border.width * this.tileSize, 
					border.height * this.tileSize)
				.move(border.x * this.tileSize, border.y * this.tileSize)
				.fill({
					opacity: 0
				})
				.stroke({
					color: "black",
					width: settings.borderWidth
				})
				.style("pointer-events", "none");
		}
    }
};

module.exports = NotationDisplay;

