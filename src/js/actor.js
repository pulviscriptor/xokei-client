/// requires


/// private variables


/// object
function Actor(settings, board) {
	/// public functions
	// determine whether a move is valid
	this.evaluateMove = function (tile) {
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
		if (board.puck.x === tile.x && board.puck.y === tile.y) {
			return false;
		}
		
		// the tile is greater than one move away from the actor's current tile
		if (this.tile.distance(tile) !== 1) {
			return false;
		}
		
		return true;
	};
	
	// initialize the actor
	this.init = function () {
		// the player who owns this actor
		this.owner = settings.owner;
		
		// the tile this actor occupies
		this.move(board.tiles[settings.x][settings.y]);
		
		this.x = settings.x;
		this.y = settings.y;
	};
	
	// move to a particular tile
	this.move = function (tile) {
		this.x = tile.x;
		this.y = tile.y;
		
		if (this.tile) {
			this.tile.removeActor();
		}
		
		this.tile = tile;
		this.tile.addActor(this);
		
	};
	
	/// init
	this.init();
}

/// exports
module.exports = Actor;