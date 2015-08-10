/// requires
var gameSettings = require("./settings");

/// private variables


/// object
function Actor(settings, board) {
	// a reference to the board this actor is on
	this.board = board;

	// the player who owns this actor
	this.owner = settings.owner;
	
	// move this actor to its initial position on the board
	this.move(board.tiles[settings.x][settings.y]);
}

Actor.prototype = {
	// determine whether a move is valid
	evaluateMove: function (tile) {
		var self = this;
		
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
		if (self.tile.distance(tile) !== 1) {
			return false;
		}
		
		// this move would mean there is more than the maximum amount of actors 
		// belonging to the actor's owner in the actor's owner's endzone
		if (self.tile.zone !== "endZone" &&
			tile.zone === "endZone" &&
			tile.owner === self.owner &&
			this.board.playersInEndZone(self.owner).length >= 
				gameSettings.maximumPlayersInEndZone) {
			
			return false;
		}
		
		return true;
	},
	
	// move to a particular tile
	move: function (tile) {
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