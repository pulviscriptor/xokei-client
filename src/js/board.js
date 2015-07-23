/* The Board object holds all the tiles and all the game pieces in memory, but
 * does not handle rendering them in any way. It also enforces rules, making 
 * that moves are legal.
 */
 
/// requires
var Tile = require("./tile");

/// private variables

/// object
function Board(layout) {
	/// public variables
	// all the tiles on the board
	this.tiles = [];
	
	/// functions
	this.generate = function () {
		var x,
			y;
			
		for (x = 0; x < 14; x++) {
			this.tiles[x] = [];
			for (y = 0; y < 8; y++) {
				this.tiles[x][y] = new Tile(x, y, layout[x][y]);
			}
		}
	};
	
	this.init = function () {
		// generate board
		this.generate();
	};
	
	this.init();
}

/// exports
module.exports = Board;