/// requires


/// private variables


/// object
function Actor(settings) {
	/// public variables
	// the player who owns this actor
	this.owner = null;
	
	// the horizontal position of this actor
	this.x = -1;
	
	// the vertical position of this actor
	this.y = -1;
	
	/// public functions
	this.init = function () {
		this.owner = settings.owner;
		
		this.x = settings.x;
		this.y = settings.y;
	};
	
	/// init
	this.init();
}

/// exports
module.exports = Actor;