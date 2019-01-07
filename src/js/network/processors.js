var utils = require('../utils');
var Player = require('../players');
var settings = require("../settings");

// "this" will be "Client"
module.exports = {
	'welcome': function (done, version) {
		clearTimeout(this.timers.connect);

		if(version != this.VERSION) {
			done();
			return this.kill('Version mismatch! Client uses ' + this.VERSION + ' but server is ' + version);
		}

		this.connectionEstablished();
		done();
	},

	'joined_room': function (done, opt) {
		utils.hash.set(opt.room_id);
		this.side = opt.side;

		var name;
		if(opt.name && (name = opt.name.trim())) {
			Player.name[this.side] = name;
			this.controller.view.updateNames(Player.name[Player.One], Player.name[Player.Two]);
		}
		done();
	},

	'invite_friend': function (done) {
		$('#invite-friend-window').removeClass('hidden').position({
			of: $('#board')
		});
		$('#invite-friend-input-url').val(window.location.href).select();
		done();
	},


	'wait_opponent': function (done) {
		$('#wait-opponent-window').removeClass('hidden').position({
			of: $('#board')
		});
		done();
	},

	'check_room_result': function (done, result) {
		if(result == 'NOT_FOUND') {
			this.kill('Game ' + utils.escapeHtml(window.location.hash) + ' not found');
			return done();
		}
		if(result == 'GAME_RUNNING') {
			this.kill('Game ' + utils.escapeHtml(window.location.hash) + ' already running');
			return done();
		}
		if(result == 'AVAILABLE') {
			$('#join-private-game-id').text(window.location.hash);
			$('#join-private-game-window').removeClass('hidden').position({
				of: $('#board')
			});
		}
		done();
	},

	'opponent_joined': function (done, opt) {
		var name;
		if(opt.name && (name = opt.name.trim())) {
			Player.name[opt.side] = name;
			this.controller.view.updateNames(Player.name[Player.One], Player.name[Player.Two]);
		}

		var $invite_window = $('#invite-friend-window');
		if(!$invite_window.hasClass('hidden')) {
			$invite_window.addClass('hidden');
		}

		var $wait_window = $('#wait-opponent-window');
		if(!$wait_window.hasClass('hidden')) {
			$wait_window.addClass('hidden');
		}
		done();
	},
	
	'board': function (done, board) {
		window.globalVariables.mockServerResponse = board;
		done();
	},

	'place_puck': function (done, owner) {
		this.controller.board.settings.owner = owner;
		this.controller.resetGame(true);
		if(owner != this.side) {
			this.controller.view.showTurnState(owner);
		}
		done();
	},
	
	'puck_placed': function (done, x, y) {
		if(this.board.puck) {
			done();
		}else{
			this.controller.placePuck({x: x, y: y}, done);
		}
	},

	'turn': function (done, owner) {
		if(owner == this.side) {
			//receive_turn will call setUIState("playing round");
			//this.controller.setUIState("playing round");
			done();
		}else{
			//this.controller.view.showTurnState(owner);

			this.controller.board.settings.owner = owner;
			this.controller.view.showTurnState(owner);

			setTimeout(function () {
				this.setUIState("waiting turn");
				done();
			}.bind(this.controller));
		}
	},

	'receive_turn': function (done, turn) {
		// convert JSON turn to controller understandable turn
		var obj = {
			owner: turn.owner,
			history: [],
			done: done
		};

		for(var i=0;i<turn.history.length;i++) {
			var move = turn.history[i];
			if(move.target.type == 'Begin round') {
				obj.history.push({
					target: 'Begin round',
					score: move.score
				});
			}else if(move.target.type == 'place puck') {
				this.controller.placePuck({x: move.target.x, y: move.target.y});
				obj.history.push({
					target: this.controller.board.puck,
					finish: {x: move.target.x, y: move.target.y},
					score: move.score
				});
			}else if(move.target.type == 'actor') {
				var actor = this.board.tile(move.start.x, move.start.y).actor;

				// this one is tricky
				// if we can't find actor in start tile then that may mean that this is move #1 and we have move #0 where actor is starting his move
				if(!actor && i == 1 && turn.history[0].target.type == 'actor') {
					actor = this.board.tile(turn.history[0].start.x, turn.history[0].start.y).actor;
				}

				obj.history.push({
					start: move.start,
					finish: move.finish,
					target: actor,
					score: move.score
				});
			}else if(move.target.type == 'puck') {
				var client = this;
				var trajectory = move.trajectory.map(function (t) {
					return client.controller.board.tile(t.x, t.y);
				});

				obj.history.push({
					start: move.start,
					finish: this.board.tile(move.finish.x, move.finish.y),
					target: this.controller.board.puck,
					trajectory: trajectory,
					score: move.score
				});
			}else{
				done();
				throw new Error('Unknown move.target.type: ' + move.target.type);
			}
		}

		// tell controller that we received turn
		this.controller.setUIState("playing round");
		setTimeout(function () {
			this.controller.emit("receive turn", obj, turn.scored || false);
		}.bind(this));
	},
	
	'another_game_request': function (done) {
		$('#game-won-another-game-button').addClass('game-won-another-game-button-requested');
		done();
	},
	
	'another_game_started': function (done) {
		if(!settings.game.looserStartsAnotherGame) {
			this.controller.board.settings.owner = Player.One;
		}
		$('#game-won-window').addClass('hidden');
		this.controller.resetGame();
		done();
	},
	
	'kill': function (done, code) {
		if(code == 'CLIENT_DISCONNECTED') {
			if(window.game.board.gamesHistory[window.game.board.settings.gameID].winner) {
				this.controller.view.network.newGameRefused(code);
				this.controller.client.kill('Opponent disconnected after game won', true);
			}else{
				setTimeout(function () {
					this.setUIState('game inactive');
					this.emit('game resigned', Player.opponent(this.client.side), 'CLIENT_DISCONNECTED');
					this.client.kill('Opponent disconnected while game running (resigned)', true);
				}.bind(this.controller));
			}
		}else if(code == 'SERVER_SHUTDOWN') {
			this.controller.client.kill('Server shutting down');
		}else if(code == 'NEW_GAME') {
			if(window.game.board.gamesHistory[window.game.board.settings.gameID].winner) {
				this.controller.view.network.newGameRefused(code);
				this.controller.client.kill('Opponent started new game after game won', true);
			}else{
				this.controller.client.kill('Opponent started new game while this game is not finished. Bug?');
			}
		}else{
			this.controller.client.kill('Server forced disconnect with unknown code: ' + code);
		}
		done();
	},
	
	'opponent_resigned': function (done, code) {
		setTimeout(function () {
			this.setUIState('game inactive');
			this.emit('game resigned', Player.opponent(this.client.side), code);
			done();
		}.bind(this.controller));
	}
};

//todo move_rejected

