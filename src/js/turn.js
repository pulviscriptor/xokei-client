/// requires
var Actor = require("./actor"),
	Player = require("./players"),
	Puck = require("./puck");

/// object
function Turn(controller, owner) {
	/// public variables
	// the controller of this turn
	this.controller = controller;
	
	// the index of the current move in this turn
	this.future = [];
	this.history = [];
	
	// the owner of this turn
	this.owner = owner;
}

Turn.prototype = {
	// unpack this turn from data passed in
	deserialize: function (data) {
		this.history = data.history;
		this.owner = data.owner;
	},
	
	// finish this turn
	finish: function (scored) {
		if (this.owner === Player.One) {
			// for now, we'll pretend to send this turn to the server, so as to
			// turn control of the board over to player two
			this.controller.emit("finish turn", this, scored);
		} else if (this.owner === Player.Two) {
			// for now, we'll pretend we received this turn from the server, so
			// as to return control of the board to player one
			this.controller.emit("receive turn", this.serialize(), scored);
		}
	},
	
	// visually play a move in this turn
	playMove: function (move, forward, callback) {
		var actor,
			board = this.controller.board,
			target;
		
		if (forward) {
			actor = move.start;
			target = board.tile(move.finish);
		} else {
			actor = move.finish;
			target = board.tile(move.start);
		}
		
		actor = board.tile(actor.x, actor.y).actor;
		
		if (!actor) {
			throw new Error("Tried to play move but found no actor.");
		}
		
		if (actor instanceof Puck) {
			actor.kick(target);
			this.controller.view.display.renderPuck();
			
			if (callback) {
				callback();
			}
		} else if (actor instanceof Actor) {
			actor.move(target, null);
			this.controller.view.display
				.moveActor(board.actors.indexOf(actor), callback);
		}
	},
	
	// record a move in this turn
	recordMove: function (target, start, finish) {
		var finishTile,
			score,
			scored;
		
		if (this.history.length == 2) {
			throw new Error("This turn has already been completed.");
		}
		
		finishTile = finish ?
			this.controller.board.tile(finish) :
			null;
			
		if (this.controller.turns.length) {
			score = this.controller.turns.slice(-1)[0].score();
		} else {
			score = {};
			score[Player.One] = 0;
			score[Player.Two] = 0;
		}
		
		if (finishTile && finishTile.inZone("goal") &&
			target === this.controller.board.puck) {
			scored = true;			
			if (finishTile.owner === Player.One) {
				score[Player.Two]++;
			} else {
				score[Player.One]++;
			}
		}
		
		this.history.push({
			finish: finish,
			score: score,
			start: start,
			target: target
		});
				
		if (this.history.length == 2 || scored) {
			this.finish(scored);
		}
		
		// if we've made a new move, throw away any moves that are being held in
		// the future, because they exist in a disconnected timeline and can't
		// be retrieved, kind of like what almost happens to Marty in "Back to
		// the Future 2" (at least I think it's the 2nd one... I don't recall)
		this.future = [];
	},
	
	redoMove: function () {
		if (this.future.length === 0) {
			return;
		}
		
		this.history.push(this.future.pop());
		this.playMove(this.history[this.history.length - 1], true);
	},
	
	// get the last score from this move
	score: function () {
		var score,
			turn = this.history.slice(-1)[0];
				
		if (turn && turn.score) {
			return JSON.parse(JSON.stringify(turn.score));
		}
		
		score = {};
		score[Player.One] = 0;
		score[Player.Two] = 0;
		
		return score;
	},
	
	// return the data that represents this turn
	serialize: function () {
		return {
			history: this.history,
			owner: this.owner
		};
	},

	// return the syntax that represents this turn
	toString: function () {

	},

	// string for notation box
	notation: function (scored) {
		/*var ret = '';
		for(var i=0;i<this.history.length;i++) {
			var turn = this.history[i];
			console.log(turn);

			if(turn.target == 'Begin round') {
				//ret += "";
			}else if(turn.target instanceof window.game.puck) {
				if(!turn.start) {
					ret += "p" + (this.controller.coordinatesToNotation(turn.target)) + " ";
				}else{
					ret += (this.controller.coordinatesToNotation(turn.start)  + this.controller.coordinatesToNotation(turn.finish)) + " ";
				}
			}else if(turn.target.owner) {
				//ret += (turn.target.owner + " moved from " + turn.start.x + ',' + turn.start.y + " to " + turn.target.x + ',' + turn.target.y);
				ret += (this.controller.coordinatesToNotation(turn.start)  + this.controller.coordinatesToNotation(turn.finish)) + " ";
			}else{
				ret += ("Unknown turn(" + i + "): " + JSON.stringify(this.serialize()));
			}
		}*/

		var turn = this.history[0];
		var next = this.history[1];

		//console.log(this);

		if(turn.target == 'Begin round') {
			this.controller.view.notate( this.controller.turns.length, this.notateSingle(next) );
		}else if(turn.target instanceof window.game.puck) {
			if(!next || next.target instanceof window.game.puck) {
				//console.log(turn);
				this.controller.view.notate( this.controller.turns.length, this.notateSingle(turn, scored) );
			}else{
				this.controller.view.notate( this.controller.turns.length, this.notateSingle(turn, scored) + " " + this.notateSingle(next) );
			}
		}else{
			if(turn.finish.x == next.start.x && turn.finish.y == next.start.y) {
				this.controller.view.notate( this.controller.turns.length, this.notateSingle(turn, scored) );
			}else{
				this.controller.view.notate( this.controller.turns.length, this.notateSingle(turn, scored) + " " + this.notateSingle(next, scored) );
			}
		}

		//console.log(ret);
	},

	notateSingle: function (turn, scored) {
		if(turn.target instanceof window.game.puck) {
			if(!turn.start) {
				return "p" + (this.controller.coordinatesToNotation(turn.target));
			}else{
				return "p" + (this.controller.coordinatesToNotation(turn.start)) + (this.controller.coordinatesToNotation(turn.target)) + (scored?'+':'');
			}
		}else{
			return (turn.target.owner=="player1" ? '1' : '2') + (this.controller.coordinatesToNotation(turn.start)) + (this.controller.coordinatesToNotation(turn.target));
		}
	},
	
	undoMove: function () {
		if (this.history.length === 0) {
			return;
		}
		
		this.future.push(this.history.pop());
		this.playMove(this.future[this.future.length - 1]);
	}
};

/// exports
module.exports = Turn;
