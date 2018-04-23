var utils = require('../utils');
var Player = require('../players');
var settings = require("../settings");

// "this" will be "Client"
module.exports = {
	'welcome': function (version) {
		clearTimeout(this.timers.connect);

		if(version != this.VERSION) {
			return this.kill('Version mismatch! Client uses ' + this.VERSION + ' but server is ' + version);
		}

		this.connectionEstablished();
	},

	'joined_room': function (opt) {
		window.location.hash = opt.room_id;
		this.side = opt.side;

		var name;
		if(opt.name && (name = opt.name.trim())) {
			Player.name[this.side] = name;
			this.controller.view.updateNames(Player.name[Player.One], Player.name[Player.Two]);
		}
	},

	'invite_friend': function () {
		$('#invite-friend-window').removeClass('hidden').position({
			of: $('#board')
		});
		$('#invite-friend-input-url').val(window.location.href);
	},

	'check_room_result': function (result) {
		if(result == 'NOT_FOUND') return this.kill('Game ' + utils.escapeHtml(window.location.hash) + ' not found');
		if(result == 'GAME_RUNNING') return this.kill('Game ' + utils.escapeHtml(window.location.hash) + ' already running');
		if(result == 'AVAILABLE') {
			$('#join-private-game-id').text(window.location.hash);
			$('#join-private-game-window').removeClass('hidden').position({
				of: $('#board')
			});
		}
	},

	'opponent_joined': function (opt) {
		var name;
		if(opt.name && (name = opt.name.trim())) {
			Player.name[opt.side] = name;
			this.controller.view.updateNames(Player.name[Player.One], Player.name[Player.Two]);
		}

		var $window = $('#invite-friend-window');
		if(!$window.hasClass('hidden')) {
			$window.addClass('hidden');
		}
	},
	
	'board': function (board) {
		window.globalVariables.mockServerResponse = board;
	},

	'place_puck': function (owner) {
		this.controller.board.settings.owner = owner;
		this.controller.resetGame(true);
		if(owner != this.side) {
			this.controller.view.showTurnState(owner);
		}
	},
	
	'puck_placed': function (x, y) {
		if(this.board.puck) {
			console.log(this.board.puck);
		}else{
			this.controller.placePuck({x: x, y: y});
		}
	},

	'turn': function (owner) {
		if(owner == this.side) {
			this.controller.setUIState("playing round");
		}else{
			//this.controller.view.showTurnState(owner);

			this.controller.board.settings.owner = owner;
			this.controller.view.showTurnState(owner);

			setTimeout(function () {
				this.setUIState("waiting turn");
			}.bind(this.controller));
		}
	},

	'receive_turn': function (turn) {
		// convert JSON turn to controller understandable turn
		var obj = {
			owner: turn.owner,
			history: []
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
				throw new Error('Unknown move.target.type: ' + move.target.type);
			}
		}

		// tell controller that we received turn
		this.controller.setUIState("playing round");
		setTimeout(function () {
			this.controller.emit("receive turn", obj, turn.scored || false);
		}.bind(this));
	},
	
	'another_game_request': function () {
		$('#game-won-another-game-button').addClass('game-won-another-game-button-requested');
	},
	
	'another_game_started': function () {
		if(!settings.game.looserStartsAnotherGame) {
			this.controller.board.settings.owner = Player.One;
		}
		$('#game-won-window').addClass('hidden');
		this.controller.resetGame();
	}
};