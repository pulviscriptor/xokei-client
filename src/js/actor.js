/* The Actor object represent an actor on the field, owned by either player. It
 * validates its own movement and holds its own position, but that is the extent
 * of its responsibilities.
 */
"use strict";

/// requires
var gameSettings = require("./settings");

/// object
function Actor(settings, board) {
	// a reference to the board this actor is on
	this.board = board;

	// the player who owns this actor
	this.owner = settings.owner;
	
	// move this actor to its initial position on the board
	this.move(board.tiles[settings.x][settings.y], true);
}

Actor.prototype = {
	// determine whether a move is valid
	evaluateMove: function (tile) {
		// the move is not valid if:
		
		// the tile is outside of the bounds of the playing field
		if (!tile || tile.type === "wall") {
			return false;
		}
		
		// the tile is occupied by another actor
		if (tile.actor) {
			return false;
		}
		
		// the tile is occupied by the puck
		if (this.board.puck.x === tile.x && this.board.puck.y === tile.y) {
			return false;
		}
		
		// the tile is greater than one move away from the actor's current tile
		if (this.tile.distance(tile) !== 1) {
			return false;
		}
		
		// this move would mean there is more than the maximum amount of actors 
		// belonging to the actor's owner in the actor's owner's endzone
		if (!this.tile.inZone("endZone") &&
			tile.inZone("endZone") &&
			tile.owner === this.owner &&
			this.board.actorsInZone(this.owner, "endZone").length >= 
				gameSettings.maximumPlayersInEndZone) {
			
			return false;
		}
		
		// this move would mean there is more than one player in the actor's
		// owner's goal
		if (!this.tile.inZone("goal") &&
			tile.inZone("goal") &&
			tile.owner === this.owner &&
			this.board.actorsInZone(this.owner, "goal").length >= 1) {
			
			return false;
		}
		
		// this move would mean that the actor is moving into the opponent's net
		if (tile.inZone("goal") && tile.owner !== this.owner) {
			return false;
		}
		
		return true;
	},
	
	// move to a particular tile
	move: function (tile, placing) {
		if (!placing && !this.evaluateMove(tile)) {
			return;
		}
		
		this.x = tile.x;
		this.y = tile.y;
		
		if (this.tile) {
			this.tile.removeActor();
		}
		
		this.tile = tile;
		this.tile.addActor(this);
	}
};

/// exports
module.exports = Actor;