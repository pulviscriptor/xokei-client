/* The Board object holds all the tiles and all the game pieces in memory, but
 * does not handle rendering them in any way. It also enforces rules, making 
 * sure that moves are legal.
 */
"use strict";
 
/// requires
var Actor = require("./actor"),
	Puck = require("./puck"),
	Tile = require("./tile");

/// private variables

/// private functions
// translates a horizontal layout to a vertical layout so that it can be
// used to generate a board of the proper orientation
function translateLayout(layout) {
	return layout[0].map(function (col, i) { 
		return layout.map(function (row) { 
			return row[i];
		});
	});
}

/// object
function Board(settings) {
	var setting;
	
	/// public variables
	// all the actors on the board
	this.actors = [];
	
	this.settings = {
		actors: null,
		layout: null,
		goals: null
	};
	
	for (setting in settings) {
		this.settings[setting] = settings[setting];
	}
	
	// transpose board so that the user input in the settings file can be 
	// used to generate a board of the same orientation after render
	this.settings.layout = translateLayout(settings.layout);
	
	// all the tiles on the board
	this.tiles = [];
	
	this.width = this.settings.layout.length;
	this.height = this.settings.layout[0].length;
	
	this.generate();
}

/// public functions
Board.prototype = {
	// return an array of the actors in the endzone of the specified player
	actorsInEndZone: function (player) {
		console.log(player);
		
		var actors = [],
			x,
			y,
			zone = this.settings.zones[player].endZone;
		
		for (x = zone[0].x; x <= zone[1].x; x++) {
			for (y = zone[0].y; y <= zone[1].y; y++) {
				if (this.tiles[x][y].actor && 
					this.tiles[x][y].actor.owner === player) {
					
					actors.push(this.tiles[x][y].actor);
				}
			}
		}
		
		return actors;
	},
	
	generate: function () {
		var zone,
			zones,
			zoneTitle,
			player,
			x,
			y;
			
		// create and store a tile for each coordinate on the board
		for (x = 0; x < this.width; x++) {
			this.tiles[x] = [];
			for (y = 0; y < this.height; y++) {
				this.tiles[x][y] = new Tile(x, y, 
					this.settings.layout[x][y], this);
			}
		}
		
		// initialize the zones for each player
		for (player in this.settings.zones) {
			zones = this.settings.zones[player];
			
			for (zoneTitle in zones) {
				zone = zones[zoneTitle];
				
				for (x = zone[0].x; x <= zone[1].x; x++) {
					for (y = zone[0].y; y <= zone[1].y; y++) {
						this.tiles[x][y].set("zone", zoneTitle);
					}
				}
			}
		}
	},
	
	// this function places the actors on the board from the array passed in, or
	// from the settings passed to the board the first time it is created
	placeActors: function(actors) {
		var i;
		
		for (i = 0; i < actors.length; i++) {
			this.actors.push(new Actor(actors[i], this));
		}
		
		return this;
	},
	
	// this function places the puck on the board from the puck data passed in,
	// or from the settings passed in to the board the first time it is created
	placePuck: function (puck) {
		this.puck = new Puck(puck || {
			x: -1,
			y: -1
		}, this);
	},
	
	// returns the tile at the specified coordinates unless it is a wall or a
	// nonexistent tile, in which case undefined is returned
	tile: function (x, y) {
		if (this.tiles[x] && this.tiles[x][y] && this.tiles[x][y].type !== 
			"wall") {
			
			return this.tiles[x][y];
		}
	}
};

/// exports
module.exports = Board;