/* The Tile object holds the coordinates of a specific tile, which can find its
 * own neighbors, and knows what is on top of it, as well as what kind of tile
 * it is
 */
"use strict";
 
/// requires
var settings = require("./settings");

/// object
function Tile(x, y, tile) {
	/// public variables
	// the owner of this tile (in most cases will be null, except for goals)
	this.owner = null;
	
	// if there is a actor on top of this tile, this is the variable that will
	// contain a reference to it
	this.actor = null;
	
	// the type of tile this is, as determined by the character from the board
	// layout that is passed to it at creation
	this.type = null;
	
	// horizontal position on the board
	this.x = null;
	
	// vertical position on the board
	this.y = null;
	
	/// functions
	this.init = function () {
		this.owner = settings.determineTileOwner(x, y);
		this.type = settings.characterTypes[tile];
		
		this.x = x;
		this.y = y;
	};
	
	// set a variable on this tile
	this.set = function (property, value) {
		this[property] = value;
		return this;
	};
	
	/// initialization
	this.init();
}

/// exports
module.exports = Tile;