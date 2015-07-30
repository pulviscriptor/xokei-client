/// requires

/// private variables

/// object
function Puck(settings) {
	/// public variables	
	// the horizontal position of this Puck
	this.x = -1;
	
	// the vertical position of this Puck
	this.y = -1;
	
	/// public functions
	this.init = function () {
		console.log(settings);
		
		this.x = settings.x;
		this.y = settings.y;
	};
	
	/// init
	this.init();
}

/// exports
module.exports = Puck;