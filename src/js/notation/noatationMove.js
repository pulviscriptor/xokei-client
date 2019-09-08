var utils = require('../utils.js');

function NotationMove(game, id, str, board, score) {
	this.game = game;
	this.id = id;
	this.str = str;
	this.board = board; // state of board before this move
	this.score = score; // player1 and player2 scores before this move

	this.type 	= null;
	this.player = null; // 1 or 2
	this.scored = false; // true / false
	this.actor  = null; // actor type - puck/player
	this.start  = null;	// cords {x:x, y:y}
	this.path   = [];     // array of cords {x:x, y:y}

}

NotationMove.prototype = {
	TYPES: {
		PUCK_PLACE: 1,
		ACTOR_MOVE: 2,
		RESIGN: 3
	},

	// this will be called by Game and we need to return true/false to detect if we finished parsing notation
	parse: function () {
		// final score
		if(this.str.match(/^\d-\d$/i)) {
			return false;
		}

		// player
		if(this.str[0] == '1') {
			this.player = 1;
		}else if(this.str[0] == '2') {
			this.player = 2;
		}else{
			throw new Error('Unknown player side in notation move#' + this.id + ': ' + this.str);
		}

		// type
		if(this.str[1] == 'r') {
			// resigned
			this.type = this.TYPES.RESIGN;
			return true;
		}else if(this.str[1] == 'p'&& this.str.length == 4) {
			// puck placed
			this.type = this.TYPES.PUCK_PLACE;
			this.start = utils.notationToCoordinates(this.str.substr(2));
			return true;
		}
		// else move

		// actor
		if(this.str[1] == 'p') {
			this.type = this.TYPES.ACTOR_MOVE;
			this.actor = 'puck';
			this.parseCords(this.str.substr(2));
		}else{
			this.type = this.TYPES.ACTOR_MOVE;
			this.actor = 'player';
			this.parseCords(this.str.substr(1));
		}

		if(this.str.substr(-1) == '+') {
			this.scored = true;
		}

		return true;
	},

	parseCords: function (str) {
		var moves = str.match(/.{2}/g);
		this.start = utils.notationToCoordinates(moves[0]);

		for(var i=1;i<moves.length;i++) {
			var move = moves[i];
			if(move == '++') continue;
			this.path.push(utils.notationToCoordinates(move));
		}
	},

	toString: function () {
		var ret = {};

		ret.str = this.str;
		ret.id = this.id;
		ret.type = this.type == this.TYPES.PUCK_PLACE ? 'PUCK_PLACE' : (this.type == this.TYPES.RESIGN ? 'RESIGN' : 'ACTOR_MOVE');
		ret.player = this.player;
		ret.scored = this.scored;
		ret.actor  = this.actor;
		ret.start  = this.start;
		ret.path   = this.path;

		return "[NotationMove " + JSON.stringify(ret) + "]";
	},
	
	execute: function (game, board) {
		console.log('----execute: ' + this);

		if(this.type == this.TYPES.PUCK_PLACE) {
			game.setState(game.STATES.PLAYING_ROUND);
			board.placePuck(this.start);
		}else if(this.type == this.TYPES.ACTOR_MOVE) {
			if(!this.path.length) throw new Error('Empty trajectory');

			board.moveActor(this.start, this.path[0]);
			if(this.path[1]) {
				board.moveActor(this.path[0], this.path[1]);
			}

			if(this.scored) {
				return {scored: this.scored, player: this.player};
			}
		}else{
			throw new Error('Unknown move type: ' + this.type);
		}
	}
};

module.exports = NotationMove;
