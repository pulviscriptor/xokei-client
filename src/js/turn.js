/// requires
var Player = require("./players");

/// object
function Turn(controller, owner) {
	/// public variables
	// the controller of this turn
	this.controller = controller;
	
	// the two actions that comprise this turn
	this.moves = [];
	
	// the owner of this turn
	this.owner = owner;
}

Turn.prototype = {
	// unpack this turn from data passed in
	deserialize: function (data) {
		this.moves = data.moves;
		this.owner = data.owner;
	},
	
	// visually play this turn
	display: function () {
		
	},
	
	// finish this turn
	finish: function () {
		if (this.controller.board.settings.owner === Player.One) {
			// for now, we'll pretend to send this turn to the server, so as to
			// turn control of the board over to player two
			this.controller.emit("finish turn", this);
		} else if (this.controller.board.settings.owner === Player.Two) {
			// for now, we'll pretend we received this turn from the server, so
			// as to return control of the board to player one
			this.controller.emit("receive turn", this.serialize());
		}
	},
	
	// record a move in this turn
	recordMove: function (target, start, finish) {
		if (this.moves.length > 2) {
			throw new Error("This turn has already been completed.");
		}
		
		this.moves.push({
			target: target,
			start: start,
			finish: finish
		});
		
		if (this.moves.length === 2) {
			this.finish();
		}
	},
	
	// return the data that represents this turn
	serialize: function () {
		return {
			moves: this.moves,
			owner: this.owner
		};
	},
	
	// return the syntax that represents this turn
	toString: function () {
		
	}
};

/// exports
module.exports = Turn;