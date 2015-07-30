/* The Board object holds all the tiles and all the game pieces in memory, but
 * does not handle rendering them in any way. It also enforces rules, making 
 * that moves are legal.
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
	/// public variables
	this.settings = {
		actors: null,
		layout: null,
		goals: null
	};
	
	// all the actors on the board
	this.actors = [];
	
	// all the tiles on the board
	this.tiles = [];
	
	/// functions
	this.generate = function () {
		var goals,
			i,
			player,
			x,
			y;
			
		// create and store a tile for each coordinate on the board
		for (x = 0; x < this.width; x++) {
			this.tiles[x] = [];
			for (y = 0; y < this.height; y++) {
				this.tiles[x][y] = new Tile(x, y, this.settings.layout[x][y]);
			}
		}
		
		// initialize the goal for each player
		for (player in this.settings.goals) {
			goals = this.settings.goals[player];
			
			for (i = 0; i < goals.length; i++) {
				this.tiles[goals[i].x][goals[i].y].set("goal", true);
			}
		}
		
		// initialize actors, if they have been passed in at board creation
		if (settings.actors) {
			this.placeActors();
		}
		
		// initialize puck, if it has been passed in at board creation
		if (settings.puck) {
			this.placePuck();
		}
	};
	
	this.init = function () {
		var setting;
		
		// apply settings
		for (setting in settings) {
			this.settings[setting] = settings[setting];
		}
		
		// transpose board so that the user input in the settings file can be 
		// used to generate a board of the same orientation after render
		this.settings.layout = translateLayout(settings.layout);
		
		this.width = this.settings.layout.length;
		this.height = this.settings.layout[0].length;
		
		this.generate();
	};
	
	// this function places the actors on the board from the array passed in, or
	// from the settings passed to the board the first time it is created
	this.placeActors = function(actors) {
		var i;
		
		for (i = 0; i < actors.length; i++) {
			this.actors.push(new Actor(actors[i]));
		}
		
		return this;
	};
	
	// this function places the puck on the board from the puck data passed in,
	// or from the settings passed in to the board the first time it is created
	this.placePuck = function (puck) {
		this.puck = new Puck(puck || {
			x: -1,
			y: -1
		});
	};
	
	this.init();
}

/// exports
module.exports = Board;