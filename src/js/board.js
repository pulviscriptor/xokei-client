/* The Board object holds all the tiles and all the game pieces in memory, but
 * does not handle rendering them in any way.
 */
"use strict";
 
/// requires
var Actor = require("./actor"),
	Puck = require("./puck"),
	settings = require("./settings"),
	Tile = require("./tile");

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
	// return an array of the actors in the specified zone belonging to the 
	// specified player
	actorsInZone: function (player, zone) {		
		var actors = [],
			x,
			y;
		
		zone = this.settings.zones[player][zone];
		
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
	
	// remove all actors and the puck from the board
	clear: function () {
		var x,
			y;
		
		this.actors = [];
		this.puck = null;
		
		for (x = 0; x < this.width; x++) {
			for (y = 0; y < this.height; y++) {
				this.tile(x, y).actor = null;
			}
		}
	},
	
	generate: function () {
		var zone,
			zones,
			zoneName,
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
			
			for (zoneName in zones) {
				zone = zones[zoneName];
				
				this.zone(player, zoneName).forEach(function (tile) {
					tile.addZone(zoneName);
				});
			}
		}
	},
	
	// given the way the board is set up right now, return all tiles that are
	// not occupied by an actor, are in the board owner's territory, and are not
	// in a goal or endzone
	getValidPuckPositions: function () {
		return this.zone(this.settings.owner, "territory")
			.filter(function (tile) {
				return !tile.actor && !tile.inZone("endZone");
			});
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
		y = (x.y !== undefined) ? x.y : y;
		x = (x.x !== undefined) ? x.x : x;
		
		if (this.tiles[x] && this.tiles[x][y]) {
			return this.tiles[x][y];
		}
	},
	
	// return all the tiles in a specific zone
	zone: function (player, zoneName) {
		var tilesInZone = [],
			x,
			y,
			zone = settings.zones[player][zoneName];
		
		for (x = zone[0].x; x <= zone[1].x; x++) {
			for (y = zone[0].y; y <= zone[1].y; y++) {
				tilesInZone.push(this.tiles[x][y]);
			}
		}
		
		return tilesInZone;
	}
};

/// exports
module.exports = Board;