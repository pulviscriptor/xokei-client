/// requires

/// private variables

/// object
function Puck(settings, board) {
	/// public variables	
	this.board = board;
	
	// the horizontal position of this Puck
	this.x = settings.x;
	
	// the vertical position of this Puck
	this.y = settings.y;
}

Puck.prototype = {
	kick: function () {
		
	},
	
	// calculate the directions this puck can be kicked in, based on the actors
	// surrounding it, and the player that is passed in
	kickDirections: function (player) {
		var directions = [],
			neighborhood = this.board.tiles[this.x][this.y].neighborhood(),
			self = this;
		
		neighborhood.forEach(function(actorTile) {
			var dx,
				dy,
				actorAngle;
			
			if (!actorTile.actor || actorTile.actor.owner !== player) {
				return;
			}
			
			// find relative position of the actor on this tile
			dx = actorTile.x - self.x;
			dy = actorTile.y - self.y;
			
			// find the relative angle of the player to the puck (atan2's
			// arguments are passed in backwards, counterintuitively)
			actorAngle = Math.atan2(dy, dx);
			
			// iterate through the neighbors of the puck and find their 
			// relative positions to the puck, then compare the atan2 of
			// that relative position to the atan2 of the relative position
			// of the player; if the absolute of resulting value is greater or 
			// equal to 1.57 degrees radian, we know that that direction is not
			// "backwards" for the current actor and we will add it to the
			// list of directions; otherwise, we can't add this tile
			neighborhood.forEach(function (tile) {
				var diffAngle,
					dx = tile.x - self.x,
					dy = tile.y - self.y,
					tileAngle = Math.atan2(dy, dx);
				
				diffAngle = Math.abs(actorAngle - tileAngle);
				
				if (diffAngle > Math.PI) {
					diffAngle = Math.PI * 2 - diffAngle;
				}
				
				if (diffAngle >= 1.57 && 
					directions.indexOf(tile) < 0 &&
					!tile.actor) {
					
					directions.push(tile);
				}
			});
		});

		return directions;
	},
	
	// return a list of tiles representing the path this puck would take if 
	// kicked with the strength passed in
	projectKick: function (strength) {
		console.log(strength);
	}
};

/// exports
module.exports = Puck;