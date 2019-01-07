/* Handles interaction between view and model
 */
 
/// requires
var Player = require("./players"),
	settings = require("./settings"),
	settingsManager = require("./settingsManager"),
	utils = require("./utils"),
	Client = require("./network/client"),
	Turn = require("./turn");

/// object
function Controller(board, view) {
	/// public variables
	this.board = board;
	this.view = view;

	// network client will be stored
	this.client = null;

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

	// current state
	this.state = null;
	
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
				var success = utils.copyTextToClipboard(utils.notation.export(this.board.gamesHistory));
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
			},
			
			// click setting button above notation box
			"click settings button": function () {
				var $table = $('#settings-table');
				$table.html(settingsManager.getHTMLTableRows());

				$('#settings-window').removeClass('hidden').position({
					of: $('#board')
				});
			},

			"click settings save button": function () {
				settingsManager.saveFromHTML();

				$('#settings-window').addClass('hidden');
			},

			"click resign game": function () {
				if(this.client) {
					this.client.send('resign');
				}
				setTimeout(function () {
					this.setUIState('game inactive');
					this.emit('game resigned', this.board.settings.owner, 'LOCAL_RESIGN');
				}.bind(this));
			},

			"mouse over notation": function (e) {
				this.view.mouseOverNotation(e, this);
			}
		},

		// when the player is placing the puck...
		"placing puck": {
			"click tile": function (data) {
				var pos = data.element.data("position"),
					tile = this.board.tile(pos);

				if (this.validPuckPositions.indexOf(tile) >= 0) {
					this.placePuck(pos);

					/*if(this.client) {
						//this.client.send('place_puck', pos.x, pos.y);
						this.emit("placed puck");

						//"recordMove" will cause "turn.finish" to be called but there is no "finish turn" event in "waiting turn" game state
						this.setUIState("waiting turn");
					}else{*/
						this.emit("placed puck");
						this.setUIState("playing round");
					/*}*/

					this.currentTurn.recordMove(this.board.puck, null, pos);
				}
			},
			
			"destroy state": function () {
				this.view.display.enableActorMouseEvents();
				$('.tile-place-puck-forbidden-player1,.tile-place-puck-forbidden-player2').removeClass('tlp');
			},
			
			"init state": function () {
				this.validPuckPositions = this.board.getValidPuckPositions();
				this.view.display.disableActorMouseEvents();

				var side = (this.board.settings.owner == Player.One) ? 'left' : 'right';
				this.emit("message", {
					life: "placed puck",
					message: Player.getStaticSizeName(this.board.settings.owner) + ":<br>Place the puck on your side (" + side + ")"
				});
				
				this.currentTurn = new Turn(this, this.board.settings.owner);
				this.currentTurn.recordMove("Begin round", null, null);
				this.view.showTurnState(this.board.settings.owner);

				// managing tooltips that will tell players why they can't place puck on forbidden tiles
				this.board.actors.forEach(function callback(actor) {
					if(actor.owner == this.board.settings.owner) {
						this.view.display.tiles[actor.x][actor.y].element.data('tooltip', 'You can\'t place the puck on top of the player');
					}else{
						this.view.display.tiles[actor.x][actor.y].element.data('tooltip', 'You can\'t place the puck on your opponent\'s side');
					}
					this.view.display.tiles[actor.x][actor.y].element.addClass('tile-place-puck-forbidden-' + this.board.settings.owner);
				}, this);

				$('.tile-place-puck-forbidden-' + this.board.settings.owner).addClass('tlp');
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
					if(!$('.message-container').is(':visible') && !this.client) {
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

					// puckTrajectory has all tiles where puck could move
					// if player clicked in middle of trajectory then we need to find where he clicked
					var trajectory = [];
					for(var i=0;i<this.puckTrajectory.length;i++) {
						var currentTile = this.puckTrajectory[i];
						trajectory.push(currentTile);
						if(currentTile.x == pos.x && currentTile.y == pos.y) break;
					}

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
				var owner = turn.owner;
				var opponent = Player.opponent(turn.owner);
				// get the turn data in serialized form, ready to be passed to
				// the server
				// var turnData = turn.serialize();
				
				// pass the turn data to the server
				
				// and store this turn on the turns list

				this.turns.push(turn);
				turn.notation(scored);

				// we should pass turn to other player only in local game
				if(!this.client) {
					// now that we've saved this turn, it is no longer current, so
					// create a new one and pass control of the board to the other
					// player
					this.currentTurn = new Turn(this, opponent);

					// this is check for looser starts new round
					if (scored &&
						turn.history[turn.history.length - 1].target.x == settings.zones[owner].goal[0].x) {
						this.board.settings.owner = owner;
						this.view.showTurnState(turn.owner);
					} else {
						this.board.settings.owner = opponent;
						this.view.showTurnState(opponent);
					}

					// if this turn ended by a player scoring, we need to reset the
					// board to allow for a new round to start, and we need to
					// update the score on the screen
					if (scored) {
						var score = this.turns.slice(-1)[0].score();

						// display updated scores
						this.view.updateScore(score);

						// is game won
						if (Math.max(score[turn.owner], score.player2) >= settings.game.scoreToWin) {
							setTimeout(function () {
								this.setUIState('game inactive');
								this.emit('game won', score);
							}.bind(this));
						} else {
							// reset the board
							this.reset();
						}
					}
				}else{
					// because of setTimeout in setUIState we need to send data after it switch
					var controller = this;


					if (scored) {
						if (turn.history[turn.history.length - 1].target.x == settings.zones[owner].goal[0].x) {
							this.board.settings.owner = owner;
							this.view.showTurnState(turn.owner);

							controller.client.send('turn', turn.packForServer(scored));
						}else{
							this.board.settings.owner = opponent;
							this.view.showTurnState(opponent);

							setTimeout(function () {
								this.setUIState("waiting turn");

								controller.client.send('turn', turn.packForServer(scored));
							}.bind(this));
						}

						// display updated scores
						var score_ = this.turns.slice(-1)[0].score();
						this.view.updateScore(score_);

						// is game won
						if(Math.max(score_.player1, score_[owner]) >= settings.game.scoreToWin) {
							setTimeout(function () {
								this.setUIState('game inactive');
								this.emit('game won', score_);
							}.bind(this));
						}else{
							// reset the board
							this.reset();
						}
					}else{
						setTimeout(function () {
							this.setUIState("waiting turn");

							controller.client.send('turn', turn.packForServer(scored));
						}.bind(this));
					}
				}
			},

			// create a new turn from the data that has been (ostensibly)
			// received from the server
			//TODO: check turn.js:finish (this is emulated server move)
			"receive turn": function (data, scored) {
				//console.log('receive turn (scored=' + scored + '):');
				//console.log(data);
				var controller = this;

				var turn = new Turn(this, Player.Two);
				turn.deserialize(data);
				//console.log(turn);

				var owner = turn.owner;
				var opponent = Player.opponent(turn.owner);

				// ordinarily we would want to call turn.display to render the
				// turn to this client, now that it's just been received from
				// the server -- however, because we're faking it and allowing
				// both players to make turns from this one client, it will have
				// already been displayed in the UI, and so there's no reason to
				// try to show it again

				// turn.display();

				this.turns.push(turn);
				//turn.notation(scored); // we need to move this out of here bacause .target will be current position of actor and it should be final

				// create a new turn and allow the other player to move
				this.currentTurn = new Turn(this, opponent);

				// we need to do our stuff after actors finished to move
				var postPlayMove = function (cb) {
					//console.log('receive turn->playMove finished, postPlay()');
					turn.notation(scored); // moved notation here
					// this is check for looser starts new round
					/*if(scored &&
						turn.history[turn.history.length-1].target.x == settings.zones[owner].goal[0].x) {
						this.board.settings.owner = owner;
						this.view.showTurnState(owner);
					}else{
						this.board.settings.owner = opponent;
						this.view.showTurnState(opponent);
					}*/

					// if this turn ended by a player scoring, we need to reset the
					// board to allow for a new round to start, and we need to
					// update the score on the screen
					if (scored) {
						this.board.settings.owner = Player.opponent(scored);
						this.view.showTurnState(this.board.settings.owner);

						var score = this.turns.slice(-1)[0].score();

						// display updated scores
						this.view.updateScore(score);

						// is game won
						if(Math.max(score.player1, score[owner]) >= settings.game.scoreToWin) {
							setTimeout(function () {
								this.setUIState('game inactive');
								this.emit('game won', score);
								cb();
							}.bind(this));
						}else{
							// reset the board
							this.reset(cb);
						}
					}else{
						this.board.settings.owner = opponent;
						this.view.showTurnState(opponent);
						cb();
					}
				};

				// visually moving actors on board
				turn.playMove(turn.history[0], true, function() {
					if(turn.history[1]) {
						setTimeout(function () {
							turn.playMove(turn.history[1], true, function() {
								postPlayMove.call(controller, data.done);
								// tell client that packet is processed
								//if(data.done) data.done();
							});
						}, settings.network.playMoveDelay);
					}else{
						postPlayMove.call(controller, data.done);
						// tell client that packet is processed
						//if(data.done) data.done();
					}
				});
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
			},

			"init state": function () {

			},

			"destroy state": function () {
				this.view.showResignButton(null);
			}
		},

		// state when game is not active
		// for example game finished or not started
		"game inactive": {
			"game won": function (scores, resigned, resign_code) {
				this.board.gamesHistory[this.board.settings.gameID].gameID = this.board.settings.gameID;
				this.board.gamesHistory[this.board.settings.gameID].scores = scores;
				this.board.gamesHistory[this.board.settings.gameID].winner = resigned ? Player.opponent(resigned) : (scores[Player.One] > scores[Player.Two] ? Player.One : Player.Two);

				if(resigned) {
					this.view.notate( 'move', 'gameresigned', (resigned == Player.One ? "1" : "2") + "r");
				}
				this.view.notate( 'move', 'gamewon', scores.player1 + '-' + scores.player2);
				this.view.notate( 'meta', 'gameresult', '[Result "' + scores.player1 + '-' + scores.player2 + '"]');
				if(resigned) {
					this.view.gameResigned(scores, resigned, resign_code);
				}else{
					this.view.gameWon(scores);
				}
			},

			"game resigned": function (player, code) {
				this.view.showResignButton(null); // hide resign button
				var score;

				if(this.turns.length) {
					score = this.turns.slice(-1)[0].score();
				}else{
					score = {};
					score[player] = 0;
				}
				score[Player.opponent(player)] = settings.game.scoreToWin;
				this.emit("game won", score, player, code);
			},

			"click another game": function () {
				if(this.client) {
					this.client.send('another_game');
					if($('#game-won-another-game-button').hasClass('game-won-another-game-button-requested')) {
						$('#game-won-window').addClass('hidden');
					}else{
						$('#game-won-another-game-button-span').addClass('hidden');
						$('#game-won-window-another-waiting-game-span').removeClass('hidden');
					}
				}else{
					settingsManager.applyLocalSettings();
					if(!settings.game.looserStartsAnotherGame) {
						this.board.settings.owner = Player.One;
					}
					$('#game-won-window').addClass('hidden');
					this.resetGame();
				}
			},

			"click new game": function () {
				if(window.game.controller.client) {
					window.game.controller.client.send('new_game');
					window.game.controller.client.kill('NEW_GAME', true);
				}
				// reset first move owner
				this.board.settings.owner = Player.One;
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
				var err = false;
				var p1name = $('#names-2p-input-p1').val() || 'Player 1';
				var p2name = $('#names-2p-input-p2').val() || 'Player 2';

				if(!p1name.trim() && p1name) {
					err = true;
					this.view.showErrorNames2P(Player.One, 'Enter non-empty name');
				}
				if(!p2name.trim() && p2name) {
					err = true;
					this.view.showErrorNames2P(Player.Two, 'Enter non-empty name');
				}
				if(err) return;

				Player.name[Player.One] = p1name.trim();
				Player.name[Player.Two] = p2name.trim();

				this.view.updateNames(Player.name[Player.One], Player.name[Player.Two]);
				this.view.hideNames2pWindow();

				settingsManager.applyLocalSettings();
				this.resetGame(true);
			},

			"click mode 1p human": function () {
				this.view.hideWelcomeWindow();
				this.view.showNetworkOnlineGameSelect();
			},

			"click online public": function () {
				this.view.hideNetworkOnlineGameSelect();
				this.client = new Client(this, settings.network, {type: 'public', name: $('#online-game-name-input').val()});
			},

			"click online private": function () {
				this.view.hideNetworkOnlineGameSelect();
				this.client = new Client(this, settings.network, {type: 'private', name: $('#online-game-name-input').val()});
			},

			"click network killed ok button": function () {
				$('#network-killed-window').addClass('hidden');
				this.view.showWelcomeWindow();
			},

			"click private game join cancel": function () {
				this.client.kill('Player clicked cancel button in join dialog', true);

				$('#join-private-game-window').addClass('hidden');
				this.view.showWelcomeWindow();
			},

			"click private game join": function () {
				$('#join-private-game-window').addClass('hidden');
				this.client.send('join_room', {room: window.location.hash.substr(1), name: $('#private-game-name-input').val()});
			}
		},

		// waiting turn from server
		"waiting turn": {
			"init state": function () {
				this.emit("message", {
					message: "Its turn of your opponent"
				});
			},

			"destroy state": function () {
				this.view.closeMessage();
			},

			"click actor": function () {
				this.view.message('Wait for your turn', 2000);
			},

			"click puck": function () {
				this.view.message('Wait for your turn', 2000);
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
		console.log('setUIState(' + stateName + ')');

		if(this.state == stateName) {
			console.log('setUIState ignored since we already in this state');
			return;
		}
		this.state = stateName;

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
	reset: function (cb) {
		setTimeout(function () {
			this.board.clear();
			this.view.display.clear();

			this.board.placeActors(window.globalVariables
				.mockServerResponse.actors);

			this.view.reshowGame();
			this.view.events.listenToActorEvents();

			// if online mode, we check who should place puck
			if(this.client) {
				if(this.client.side == this.board.settings.owner) {
					this.setUIState("placing puck");
				}else{
					this.setUIState("waiting turn");
				}
			}else{
				this.setUIState("placing puck");
			}
			if(cb) cb();
		}.bind(this));
	},

	// reset the game after one of player won
	resetGame: function (newGame) {
		// clear turns of previous game
		this.turns = [];

		// clear displayed score
		var scores = {};
		scores[Player.One] = '0';
		scores[Player.Two] = '0';
		this.view.updateScore(scores);

		// new round for new clean game
		this.reset();

		if(newGame) {
			// new game
			this.view.clearNotations();

			// reset expand-all icon in new game
			this.view.notationResetExpandAllIcon();

			this.board.settings.gameID = 1;
			this.board.gamesHistory[this.board.settings.gameID] = { notation_meta: [], notation_move: [] };
			this.view.notateMeta();
		}else{
			// another game
			this.board.settings.gameID++;
			this.board.gamesHistory[this.board.settings.gameID] = { notation_meta: [], notation_move: [] };
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

	placePuck: function (pos, done) {
		var self = this;

		this.board.placePuck(pos);
		this.view.display.createPuck(settings.animationSpeed);

		setTimeout(function () {
			self.view.display.clearPuckGhost();
			if(done) done();
		}, settings.animationSpeed);

		this.view.events.listenToPuckEvents();


		//todo recordMove
	}
};

/// exports
module.exports = Controller;
