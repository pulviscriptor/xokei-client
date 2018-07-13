/// requires
var Actor = require("./actor"),
	Player = require("./players"),
	settings = require("./settings"),
	utils = require("./utils"),
	Puck = require("./puck");
	//Tile = require("./tile");

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
		/*if (this.owner === Player.One) {
			// for now, we'll pretend to send this turn to the server, so as to
			// turn control of the board over to player two
			this.controller.emit("finish turn", this, scored);
		} else if (this.owner === Player.Two) {
			// for now, we'll pretend we received this turn from the server, so
			// as to return control of the board to player one
			this.controller.emit("receive turn", this.serialize(), scored);
		}*/

		this.controller.emit("finish turn", this, scored);

		console.log('SERIALIZE:');
		console.log(this.serialize());

		//window.turn111 = this;

		// sending turn to server
		/*if(this.controller.client) {
			this.controller.client.send('turn', this.serialize());
		}else{
			this.controller.emit("finish turn", this, scored);
		}*/
	},
	
	// visually play a move in this turn
	playMove: function (move, forward, callback) {
		var actor,
			board = this.controller.board,
			target;

		// skip targets that we can't play
		// we can't play "Begin round"
		if(move.target == 'Begin round') {
			if (callback) {
				callback();
			}
			return;
		// we can't play place puck since client.processor will place it already otherwise we can't write turn history
		}else if(move.target instanceof Puck && !move.start) {
			if (callback) {
				callback();
			}
			return;
		}
		
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
			/*actor.kick(target);
			this.controller.view.display.renderPuck();
			
			if (callback) {
				callback();
			}*/


			/*this.puckTrajectory = this.board.puck.calculateTrajectory(
				this.kickDirection);
			var trajectory = this.puckTrajectory.slice(0);

			// if we have only one available move on selected trajectory
			// then don't show single dot, just move there
			if(this.puckTrajectory.length == 1) {
				var oldPos = {
					x: this.board.puck.x,
					y: this.board.puck.y
				};
				var finish = this.puckTrajectory[0];
				this.kickPuck(this.puckTrajectory[0], function () {
					this.currentTurn.recordMove(this.board.puck, oldPos, finish, trajectory);
				}.bind(this));
				return;
			}

			this.view.display.showKickTrajectory(this.puckTrajectory);*/

			var trajectory = move.trajectory.slice(0);
			this.controller.puckTrajectory = trajectory;

			/*var oldPos = {
				x: move.start.x,
				y: move.start.y
			};
			var finish = trajectory[trajectory.length-1];*/
			console.log('this.controller.kickPuck starting');
			this.controller.kickPuck(trajectory[trajectory.length-1], function () {
				console.log('this.controller.kickPuck done');
				//this.currentTurn.recordMove(this.board.puck, oldPos, finish, trajectory);
				if (callback) {
					callback();
				}
			}.bind(this.controller));

		} else if (actor instanceof Actor) {
			actor.move(target, null);
			this.controller.view.display
				.moveActor(board.actors.indexOf(actor), callback);
		} else {
			console.log('Actor dump:');
			console.log(actor);
			throw new Error('Unknown instance of actor, check console');
		}
	},
	
	// record a move in this turn
	recordMove: function (target, start, finish, trajectory) {
		var finishTile,
			score,
			scored;
		
		if (this.history.length == 2) {
			console.log('this.history:');
			console.log(this.history);
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
			//scored = true;
			if (finishTile.owner === Player.One) {
				scored = Player.Two;
				score[Player.Two]++;
			} else {
				scored = Player.One;
				score[Player.One]++;
			}
		}
		
		this.history.push({
			finish: finish,
			score: score,
			start: start,
			target: target,
			trajectory: trajectory
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
		var turn = this.history[0];
		var next = this.history[1];
		var owner = (this.owner=="player1" ? '1' : '2');
		//console.log(this);
		//var owner = '';

		if(turn.target == 'Begin round') {
			this.controller.view.notate( 'move', this.controller.turns.length, owner + this.notateSingle(next) );
		}else if(turn.target instanceof window.game.puck) {
			if(!next) {
				this.controller.view.notate( 'move', this.controller.turns.length, owner + this.notateSingle(turn, scored) );
			}else if(next.target instanceof window.game.puck) {
				this.controller.view.notate( 'move', this.controller.turns.length, owner + this.notateSingle(turn) + this.notatePuckTrajectory(next, true) );
			// next is about player actor
			}else{
				this.controller.view.notate( 'move', this.controller.turns.length, owner + this.notateSingle(turn) + ' ' + owner + this.notateSingle(next) );
			}
		}else{
			if(turn.finish.x == next.start.x && turn.finish.y == next.start.y) {
				this.controller.view.notate( 'move', this.controller.turns.length, owner + this.notateSingle(turn, scored) + utils.coordinatesToNotation(turn.target) );
			}else{
				this.controller.view.notate( 'move', this.controller.turns.length, owner + this.notateSingle(turn, scored) + " " + owner + this.notateSingle(next, scored) );
			}
		}

		//console.log(ret);
	},

	notateSingle: function (turn, scored) {
		if(turn.target instanceof window.game.puck) {
			if(!turn.start) {
				return "p" + (utils.coordinatesToNotation(turn.target));
			}else{
				if(scored && Math.max(turn.score[Player.One], turn.score[Player.Two]) == settings.game.scoreToWin) {
					return "p" + (this.notatePuckTrajectory(turn)) + '++';
				}else{
					return "p" + (this.notatePuckTrajectory(turn)) + (scored?'+':'');
				}
			}
		}else{
			return (utils.coordinatesToNotation(turn.start)) + (utils.coordinatesToNotation(turn.finish));
		}
	},

	notatePuckTrajectory: function (turn, skipFirst) {
		var lastTile = turn.start;
		var lastDeltaX = lastTile.x - turn.trajectory[0].x;
		var lastDeltaY = lastTile.y - turn.trajectory[0].y;
		var checkpoints = [ ];
		var ret = '';

		if(!skipFirst) checkpoints.push(lastTile);

		for(var i=0;i<turn.trajectory.length;i++) {
			var tile = turn.trajectory[i];
			var deltaX =  lastTile.x - turn.trajectory[i].x;
			var deltaY = lastTile.y - turn.trajectory[i].y;

			// we need to find place where puck finished on trajectory
			if(tile.x == turn.finish.x && tile.y == turn.finish.y) {
				checkpoints.push(tile);
				// puck is ended here so this is our last checkpoint
				break;
			}

			if(deltaX != lastDeltaX || deltaY != lastDeltaY) {
				checkpoints.push(lastTile);
				lastDeltaX = deltaX;
				lastDeltaY = deltaY;
			}

			lastTile = tile;
		}

		for(i=0;i<checkpoints.length;i++) {
			ret += utils.coordinatesToNotation(checkpoints[i]);
		}

		return ret;
	},
	
	undoMove: function () {
		if (this.history.length === 0) {
			return;
		}
		
		this.future.push(this.history.pop());
		this.playMove(this.future[this.future.length - 1]);
	},

	packForServer: function (scored) {
		var obj = {
			//owner: this.owner,
			scored: scored || false,
			history: []
		};

		for(var i=0;i<this.history.length;i++) {
			var move = this.history[i];

			obj.history[i] = {};
			/*if(obj.history[i].start)	  obj.history[i].start  		= move.start;
			if(obj.history[i].finish) 	  obj.history[i].finish 		= move.finish;
			if(obj.history[i].score)  	  obj.history[i].score  		= move.score;
			if(obj.history[i].trajectory) obj.history[i].trajectory 	= move.trajectory;*/

			if(typeof(move.target) == 'string') {
				obj.history[i].target = {type: move.target};
			}else if(move.target instanceof Puck) {
				if(!move.start) {
					obj.history[i].target = {type: "place puck"};
					obj.history[i].finish = {x: move.target.x, y: move.target.y};
				}else{
					obj.history[i].target = {type: "puck"};
					obj.history[i].start = {x: move.start.x, y: move.start.y};
					obj.history[i].finish = {x: move.finish.x, y: move.finish.y};
					obj.history[i].trajectory = move.trajectory.map(function (tile) {
						return {x: tile.x, y: tile.y};
					});
				}
			}else if(move.target instanceof Actor) {
				obj.history[i].target = {type: "actor"};
				obj.history[i].start = {x: move.start.x, y: move.start.y};
				obj.history[i].finish = {x: move.finish.x, y: move.finish.y};
			}else{
				throw new Error('Unknown move target: ' + move.target);
			}
		}

		return obj;
	}
};

/// exports
module.exports = Turn;
