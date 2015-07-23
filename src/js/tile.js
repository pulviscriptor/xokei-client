/* The Tile object holds the coordinates of a specific tile, which can find its
 * own neighbors, and knows what is on top of it, as well as what kind of tile
 * it is
 */
 
/// requires

/// private variables
var types = {
	"[": "player1Goal",
	"]": "player2Goal",
	"-": "wall",
	".": "fieldLight",
	"#": "fieldDark"
};

/// object
function Tile(x, y, tile) {
	/// public variables
	// if there is a player on top of this tile, this is the variable that will
	// contain a reference to it
	this.player = null;
	
	// the type of tile this is, as determined by the character from the board
	// layout that is passed to it at creation
	this.type = null;
	
	// horizontal position on the board
	this.x = null;
	
	// vertical position on the board
	this.y = null;
	
	/// functions
	this.init = function () {
		this.type = types[tile];
		
		this.x = x;
		this.y = y;
	};
	
	/// initialization
	this.init();
}

/// exports
module.exports = Tile;