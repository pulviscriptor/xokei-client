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
	
	// the zones this tile is in
	this.zones = [];
}

Tile.prototype = {
	/// functions
	addActor: function (actor) {
		this.actor = actor;
	},
	
	addZone: function (zoneName) {
		this.zones.push(zoneName);
	},
	
	// determine Chebyshev distance from tile at another point
	distance: function (other) {
		return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
	},
	
	// return whether or not this tile is in the zone that is passed in
	inZone: function (zoneName) {
		return this.zones.indexOf(zoneName) > -1;
	},
	
	// return this tile's Moore neighborhood
	neighborhood: function (returnWalls) {
		var dx = [0, -1, -1, -1, 0, 1, 1, 1],
			dy = [1, 1, 0, -1, -1, -1, 0, 1],
			self = this;
			
		return dx.map(function (x, i) {
			var tile;
			
			if (self.board.tiles[self.x + x]) {
				tile = self.board.tiles[self.x + x][self.y + dy[i]];
			
				if (tile && (tile.type !== "wall" || returnWalls)) {
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
	},
	
	// remove this tile from the specified zone
	removeZone: function (zone) {
		this.zones.splice(this.zones.indexOf(zone), 1);
	}
};

/// exports
module.exports = Tile;