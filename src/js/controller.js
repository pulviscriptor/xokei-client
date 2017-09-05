/* Handles interaction between view and model
 */
 
/// requires
var Player = require("./players"),
	settings = require("./settings"),
	Turn = require("./turn");

/// object
function Controller(board, view) {
	/// public variables
	this.board = board;
	this.view = view;
	
	// the turn that this client is taking right now
	this.currentTurn = null;
	
	// the direction the player has chosen to kick the puck
	this.kickDirection = null;
	
	// an object containing all the event listeners that have been applied to 
	// the current state, as well as handlers that are called when they occur
	this.listeners = {};
	
	// whether or not a message is currently being displayed in the UI
	this.messageShowing = false;
	
	// an array containing the valid positions the puck can be kicked to
	this.puckTrajectory = null;
	
	// the actor that is currently highlighted by the UI
	this.selectedActor = null;
	
	// an object containing all of the possible events in the game, held under
	// the UI state that they should be 
	this.states = {
		// events that all states should be subscribed to regardless of UI state
		"global": {
			"close message": function () {
				this.messageShowing = false;
			},
			
			"message": function (data) {
				this.view.message(data);
				this.messageShowing = true;
			},
			
			"window resize": function () {
				this.clearUIState();
				this.view.display.resizeBoard();
				
				if (this.messageShowing) {
					this.view.resizeMessage();
				}
				
				// resize dialog windows
				this.view.resizeDialogsWindows();
			},
			
			// copy notation to clipboard
			"save game": function () {
				/*var copyTextarea = window.document.querySelector('#moves');
				copyTextarea.select();*/

				// https://stackoverflow.com/questions/1173194/select-all-div-text-with-single-mouse-click
				var node = window.document.getElementById( 'moves' );
				var range;

				if ( window.document.selection ) {
					range = window.document.body.createTextRange();
					range.moveToElementText( node  );
					range.select();
				} else if ( window.getSelection ) {
					range = window.document.createRange();
					range.selectNodeContents( node );
					window.getSelection().removeAllRanges();
					window.getSelection().addRange( range );
				}

				// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
				var success = false;
				try {
					success = window.document.execCommand('copy');
				} catch (err) {
					success = false;
				}
				if(!$('.message-container').is(':visible')) {
					if(success) {
						this.view.message('Notation copied to clipboard', 2000);
					}else{
						this.view.message('Failed to copy notation<br>Please copy it manually from box on the right', 2000);
					}
				}

				// https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
				if (window.getSelection) {
					if (window.getSelection().empty) {  // Chrome
						window.getSelection().empty();
					} else if (window.getSelection().removeAllRanges) {  // Firefox
						window.getSelection().removeAllRanges();
					}
				} else if (window.document.selection) {  // IE?
					window.document.selection.empty();
				}
			}
		},
		
		// when the player is placing the puck...
		"placing puck": {
			"click tile": function (data) {
				var pos = data.element.data("position"),
					self = this,
					tile = this.board.tile(pos);
				
				if (this.validPuckPositions.indexOf(tile) >= 0) {
					this.board.placePuck(pos);
					this.view.display.createPuck(settings.animationSpeed);
					
					setTimeout(function () {
						self.view.display.clearPuckGhost();
					}, settings.animationSpeed);
					
					this.view.events.listenToPuckEvents();
					this.emit("placed puck");
					this.setUIState("playing round");
					
					// record puck placement
					this.currentTurn.recordMove(this.board.puck, null, pos);
				}
			},
			
			"destroy state": function () {
				this.view.display.enableActorMouseEvents();
			},
			
			"init state": function () {
				this.validPuckPositions = this.board.getValidPuckPositions();
				this.view.display.disableActorMouseEvents();

				var side = (this.board.settings.owner == Player.One) ? 'left' : 'right';
				this.emit("message", {
					life: "placed puck",
					message: this.view.escapeHtml(Player.name[this.board.settings.owner]) + ":<br>Place the puck on your side (" + side + ")"
				});
				
				this.currentTurn = new Turn(this, this.board.settings.owner);
				this.currentTurn.recordMove("Begin round", null, null);
				this.view.showTurnState(this.board.settings.owner);
			},
			
			"mouse enter tile": function (data) {
				var pos = data.element.data("position"),
					tile = this.board.tile(pos),
					validPos = this.validPuckPositions.indexOf(tile) >= 0;
				
				if (tile.type !== "wall" && !validPos) {
					this.view.display.highlightTile(tile, false);
				}
				
				if (validPos) {
					this.view.display.showPuckGhost(pos);
				}
			},
			
			"mouse exit tile": function () {
				this.view.display.clearPuckGhost();
				this.view.display.unhighlightTile();
			}
		},
		
		// after the player has placed the puck and is actually playing a round
		"playing round": {
			"click actor": function (data) {
				var actor = this.board.actors[data.element.data("actor")];
				
				// if the actor that has been clicked on is the currently 
				// selected actor, don't do anything
				if (actor === this.selectedActor) {
					this.clearUIState();
					return false;
				}
				
				this.clearUIState();
				
				// prevent the player from moving actors that do not belong to 
				// them
				if (actor.owner !== this.board.settings.owner) {
					if(!$('.message-container').is(':visible')) {
						var amountOfMoves = 2-this.currentTurn.history.length;
						this.view.message('Wait for your turn<br>Your opponent has ' + amountOfMoves + ' move' + (amountOfMoves > 1 ? 's' : '') + ' left', 2000);
					}
					return false;
				}

				// display the clicked actor as selected
				this.selectActor(actor);
			},
			
			"click puck": function () {
				this.selectPuck();
			},
			
			"click tile": function (data) {
				var actor,
					index,
					oldPos,
					pos = data.element.data("position"),
					tile = this.view.display.tiles[pos.x][pos.y];
				
				// if the tile is clicked and it is a valid move, have the 
				// selected actor move to that tile
				if (tile.validMove) {
					actor = this.selectedActor;
					index = this.selectedActorIndex;
					oldPos = {
						x: actor.x,
						y: actor.y
					};
					
					// clear the UI
					this.clearUIState();
					
					// move the actor in the model
					actor.move(this.board.tiles[pos.x][pos.y]);
					
					// move the actor in the view
					this.view.display.moveActor(index, function () {
						// and record this move in the current turn once the
						// move is done rendering
						this.currentTurn.recordMove(actor, oldPos, pos);
					}.bind(this));
				} else if (tile.validKickDirection) {
					this.clearUIState();
					
					this.kickDirection = tile;
					this.projectKickTrajectory();
				} else if (tile.validKick) {
					oldPos = {
						x: this.board.puck.x,
						y: this.board.puck.y
					};

					var trajectory = this.puckTrajectory.slice(0);

					this.kickPuck(this.board.tiles[pos.x][pos.y], function () {
						this.currentTurn.recordMove(this.board.puck, oldPos, pos, trajectory);
					}.bind(this));
					
					this.clearUIState();
				} else {
					this.clearUIState();
				}
			},
			
			// when this client finishes making a turn, send the turn data to 
			// the server -- err, that is, do nothing for now, until the server
			// is implemented
			//TODO: check turn.js:finish (this is non-emulated player move)
			"finish turn": function (turn, scored) {
				// get the turn data in serialized form, ready to be passed to
				// the server
				// var turnData = turn.serialize();
				
				// pass the turn data to the server
				
				// and store this turn on the turns list
				this.turns.push(turn);
				turn.notation(scored);
				
				// now that we've saved this turn, it is no longer current, so
				// create a new one and pass control of the board to the other 
				// player
				this.currentTurn = new Turn(this, Player.Two);

				console.log(turn);

				// this is check for settings.game.looserStartsNewRound
				if(scored && settings.game.looserStartsNewRound &&
					turn.history[turn.history.length-1].target.x == settings.zones[Player.One].goal[0].x) {
					this.board.settings.owner = Player.One;
					this.view.showTurnState(Player.One);
				}else{
					this.board.settings.owner = Player.Two;
					this.view.showTurnState(Player.Two);
				}
				
				// if this turn ended by a player scoring, we need to reset the
				// board to allow for a new round to start, and we need to 
				// update the score on the screen
				if (scored) {
					var score = this.turns.slice(-1)[0].score();

					// display updated scores
					this.view.updateScore(score);

					// is game won
					if(Math.max(score.player1, score.player2) >= settings.game.scoreToWin) {
						setTimeout(function () {
							this.setUIState('game inactive');
							this.emit('game won', score);
						}.bind(this));
					}else{
						// reset the board
						this.reset();
					}
				}
			},

			// create a new turn from the data that has been (ostensibly)
			// received from the server
			//TODO: check turn.js:finish (this is emulated server move)
			"receive turn": function (data, scored) {
				var turn = new Turn(this, Player.Two);
				turn.deserialize(data);

				// ordinarily we would want to call turn.display to render the
				// turn to this client, now that it's just been received from
				// the server -- however, because we're faking it and allowing
				// both players to make turns from this one client, it will have
				// already been displayed in the UI, and so there's no reason to
				// try to show it again

				// turn.display();

				this.turns.push(turn);
				turn.notation(scored);

				// create a new turn and allow the other player to move
				this.currentTurn = new Turn(this, Player.One);

				// this is check for settings.game.looserStartsNewRound
				if(scored && settings.game.looserStartsNewRound &&
					turn.history[turn.history.length-1].target.x == settings.zones[Player.Two].goal[0].x) {
					this.board.settings.owner = Player.Two;
					this.view.showTurnState(Player.Two);
				}else{
					this.board.settings.owner = Player.One;
					this.view.showTurnState(Player.One);
				}

				// if this turn ended by a player scoring, we need to reset the
				// board to allow for a new round to start, and we need to
				// update the score on the screen
				if (scored) {
					var score = this.turns.slice(-1)[0].score();

					// display updated scores
					this.view.updateScore(score);

					// is game won
					if(Math.max(score.player1, score.player2) >= settings.game.scoreToWin) {
						setTimeout(function () {
							this.setUIState('game inactive');
							this.emit('game won', score);
						}.bind(this));
					}else{
						// reset the board
						this.reset();
					}
				}
			},

			"mouse enter tile": function (data) {
				var pos = data.element.data("position"),
					tile = this.view.display.tiles[pos.x][pos.y];
					
				if (tile.validMove || 
					tile.validKickDirection || 
					tile.validKick) {
					
					this.view.display.highlightTile(tile, true);
				}
			},
			
			"mouse exit tile": function () {
				this.view.display.unhighlightTile();
			},
			
			"redo": function () {
				// if the current turn is not our turn, don't try to redo it
				if (this.currentTurn.owner !== this.board.settings.owner) {
					return;
				}
				
				this.currentTurn.redoMove();
			},
			
			"undo": function () {
				// if the current turn is not our turn, don't try to undo it
				if (this.currentTurn.owner !== this.board.settings.owner) {
					return;
				}
				
				this.currentTurn.undoMove();
			}
		},

		// state when game is not active
		// for example game finished or not started
		"game inactive": {
			"game won": function (scores) {
				this.view.notate( 'gamewon', scores.player1 + '-' + scores.player2, true);
				this.view.notate( 'gameresult', '[Result "' + scores.player1 + '-' + scores.player2 + '"]', true);
				this.view.gameWon(scores);
			},
			
			"click another game": function () {
				$('#game-won-window').addClass('hidden');
				this.resetGame();
			},

			"click new game": function () {
				// reset first move owner
				this.board.settings.owner = settings.game.playerStartingGame==1 ? Player.One : Player.Two;
				this.view.newGameClicked();
			},
			
			"click mode 2p local": function () {
				this.view.hideWelcomeWindow();
				this.view.showNames2pWindow();
				//this.resetGame();
				/*setTimeout(function () {
					this.setUIState("placing puck");
				}.bind(this));*/
			},

			"click let's go 2p names": function () {
				var p1name = $('#names-2p-input-p1').val() || 'Player 1';
				var p2name = $('#names-2p-input-p2').val() || 'Player 2';

				Player.name[Player.One] = p1name;
				Player.name[Player.Two] = p2name;

				this.view.updateNames(p1name, p2name);
				this.view.hideNames2pWindow();

				this.resetGame(true);
			}
		}
	};
	
	// an array containing all of the turns that have taken place so far, both 
	// turns that this client has made as well as all turns received from the
	// server -- the length of this array represents the amount of turns so far
	this.turns = [];
}

/// public functions
Controller.prototype = {
	addListener: function (eventName, callback) {
		var listener;
		
		callback = callback.bind(this);
		
		// if there is no callback we may be being passed an object full of
		// listeners; if so, iterate through them and add each one individually
		if (!callback) {
			for (listener in eventName) {
				this.addListener(listener, eventName[listener]);
			}
			
			return;
		}
	
		// add a single event listener to the list without overriding any other
		// event listeners
		if (this.listeners[eventName]) {
			this.listeners[eventName].push(callback);
		} else {
			this.listeners[eventName] = [callback];
		}
		
		return callback;
	},
	
	setUIState: function (stateName) {
		var eventName;
		
		// destroy the old state so we can build the new one
		this.emit("destroy state");
		this.clearListeners();
		this.clearUIState();
		
		// apply all global listeners, the ones that should apply to all states
		for (eventName in this.states.global) {
			this.addListener(eventName, this.states.global[eventName]);
		}
		
		// and add the listeners that are specific to this state
		for (eventName in this.states[stateName]) {
			this.addListener(eventName, this.states[stateName][eventName]);
		}
		
		this.emit("init state");
	},
	
	clearListeners: function () {
		this.listeners = {};
	},
	
	clearUIState: function () {
		this.view.display.deselectActor(this.selectedActorIndex);
		this.view.display.clearKickDirections();
		this.view.display.clearKickTrajectory();
		this.view.display.unhighlightTile();
		
		this.puckSelected = false;
		this.selectedActor = null;
		this.kickDirection = null;
		this.puckTrajectory = null;
	},
	
	emit: function (eventName) {
		var i;
		
		if (!this.listeners[eventName]) {
			return;
		}

		for (i = 0; i < this.listeners[eventName].length; i++) {
			this.listeners[eventName][i].apply(this, 
				Array.prototype.slice.apply(arguments).slice(1));
		}
	},
	
	kickPuck: function (target, callback) {
		var trajectory = this.puckTrajectory
			.splice(0, this.puckTrajectory.indexOf(target) + 1);
			
		this.board.puck.kick(trajectory[trajectory.length - 1]);
		this.view.display.showKick(trajectory, callback);
	},
	
	projectKickTrajectory: function () {
		this.puckTrajectory = this.board.puck.calculateTrajectory(
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

		this.view.display.showKickTrajectory(this.puckTrajectory);
	},
	
	removeListener: function (eventName, callback) {
		var index,
			listeners = this.listeners[eventName];
		
		if (listeners) {
			index = listeners.indexOf(callback);
			
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	},

	// reset the board after finishing a round
	reset: function () {
		setTimeout(function () {
			this.board.clear();
			this.view.display.clear();

			this.board.placeActors(window.globalVariables
				.mockServerResponse.actors);

			this.view.reshowGame();
			this.view.events.listenToActorEvents();
			this.setUIState("placing puck");
		}.bind(this));
	},

	// reset the game after one of player won
	resetGame: function (anotherGame) {
		// clear turns of previous game
		this.turns = [];

		// clear displayed score
		var scores = {};
		scores[Player.One] = '0';
		scores[Player.Two] = '0';
		this.view.updateScore(scores);

		// new round for new clean game
		this.reset();

		if(anotherGame) {
			this.view.clearNotations();
			this.view.notateMeta();
			this.board.settings.gameID = 1;
		}else{
			this.board.settings.gameID++;
			this.view.notateMeta(true);
		}
	},
	
	// select an actor and cause the available positions to move to be shown
	selectActor: function (actor) {
		this.selectedActor = actor;
		this.selectedActorIndex = this.board.actors.indexOf(actor);
		
		this.view.display.selectActor(this.selectedActor);
	},
	
	selectPuck: function () {
		if (this.puckSelected) {
			this.clearUIState();
			return;
		}
		
		this.clearUIState();

		var kickDirections = this.board.puck.kickDirections(this.board.settings.owner);
		if(kickDirections.directions.length) {
			this.puckSelected = true;
			this.view.display.showKickDirections(kickDirections.directions);
		}else if(kickDirections.noOwnerNearPuck && !$('.message-container').is(':visible')) {
			this.view.message('You must be near puck', 2000);
		}else if(kickDirections.blockedByPlayers && !$('.message-container').is(':visible')) {
			this.view.message('Puck is blocked by players', 2000);
		}
	},

	notationToCoordinates: function (notation) {
		var x = settings.coordinates.horizontal.indexOf(notation.toLowerCase()[0]);
		var y = settings.coordinates.vertical.indexOf(notation.toLowerCase()[1]);

		if(x < 0) throw new Error('Unknown notation X coordinate: ' + notation[0]);
		if(y < 0) throw new Error('Unknown notation Y coordinate: ' + notation[1]);

		return {x: x, y: y};
	},

	coordinatesToNotation: function (cords, y) {
		if(typeof y == 'number') { cords = {x: cords, y: y}; }

		if(typeof cords.x != 'number') throw new Error('Expected cords.x to be a number and it was ' + cords.x);
		if(typeof cords.y != 'number') throw new Error('Expected cords.y to be a number and it was ' + cords.y);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);

		return settings.coordinates.horizontal[cords.x] + settings.coordinates.vertical[cords.y];
	}
};

/// exports
module.exports = Controller;
