/* The Tile object holds the coordinates of a specific tile, which can find its
 * own neighbors, and knows what is on top of it, as well as what kind of tile
 * it is
 */
"use strict";
 
/// requires
var settings = require("./settings");

/// object
function Tile(x, y, tile, board) {
	/// public variables
	// if there is a actor on top of this tile, this is the variable that will
	// contain a reference to it
	this.actor = null;
	
	// a reference to the board this tile belongs to
	this.board = board;
	
	// the owner of this tile (in most cases will be null, except for goals)
	this.owner = settings.determineTileOwner(x, y);
	
	// the type of tile this is, as determined by the character from the board
	// layout that is passed to it at creation
	this.type = settings.characterTypes[tile];
	
	// horizontal position on the board
	this.x = x;
	
	// vertical position on the board
	this.y = y;
}

Tile.prototype = {
	/// functions
	addActor: function (actor) {
		this.actor = actor;
	},
	
	// determine Chebyshev distance from tile at another point
	distance: function (other) {
		return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
	},
	
	// return this tile's Moore neighborhood
	neighborhood: function () {
		var dx = [0, -1, -1, -1, 0, 1, 1, 1],
			dy = [1, 1, 0, -1, -1, -1, 0, 1],
			self = this;
			
		return dx.map(function (x, i) {
			var tile;
			
			if (self.board.tiles[self.x + x]) {
				tile = self.board.tiles[self.x + x][self.y + dy[i]];
			
				if (tile && tile.type !== "wall") {
					return tile;
				}
			}
		}).filter(Boolean);
	},
	
	removeActor: function () {
		this.actor = null;
	},
	
	// set a variable on this tile
	set: function (property, value) {
		this[property] = value;
		return this;
	}
};

/// exports
module.exports = Tile;