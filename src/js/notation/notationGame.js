var NotationBoard = require('./noatationBoard');
var NotationMove = require('./noatationMove');

function NotationGame(notationParser) {
	this.notationParser = notationParser;
	this.lines = this.notationParser.lines;

	this.game_id = null;
	this.meta = {};

	// We will not access moves/board/score to replay
	// replay should read that info from `move`.
	// Here we storing it only for writing it to `move`
	this.moves = [];
	this.board = null;
	this.score = {
		player1: 0,
		player2: 0
	};
	this.owner = 'player1';
	this.state = this.STATES.PLACING_PUCK;
}

NotationGame.prototype = {
	STATES: {
		PLACING_PUCK: 'placing puck',
		PLAYING_ROUND: 'playing round'
	},


	parse: function () {
		var meta = this.parseMeta();
		var moves = this.parseMoves();

		if(!moves) {
			if(meta.present) throw new Error('Meta is present but there is no moves');
			return false;
		}

		return true;
	},

	parseMeta:function () {
		var meta = this.parseMetaLine();
		if(!meta.player1) meta.player1 = 'Player 1';
		if(!meta.player2) meta.player2 = 'Player 2';
		if(!meta.game) meta.game = '1';

		return meta;
	},

	parseMetaLine: function (meta) {
		if(!meta) meta = this.meta;
		if(!this.lines.length) return meta; // throw new Error('Failed to parse meta. Moves data missing in notation?');
		var line = this.lines[0];
		if(line.trim().length) {
			if(line[0] != '[') return meta; // No more meta to parse
			var parsed = line.match(/^\[([a-zA-Z]*) "(.*)"]$/);
			var meta_name = parsed[1];
			var meta_value = parsed[2];

			if(meta_name == 'Game') {
				meta.game = meta_value;
				this.game_id = meta_value;
			}else if(meta_name == 'Date') {
				meta.date = meta_value;
			}else if(meta_name == 'White') {
				meta.player1 = meta_value;
			}else if(meta_name == 'Black') {
				meta.player2 = meta_value;
			}else if(meta_name == 'Result') {
				meta.result = meta_value;
			}else{
				throw new Error('Unknown meta name in line: ' + line);
			}

			// Meta is present in notation
			meta.present = true;
		}

		this.lines.shift();
		return this.parseMetaLine(meta);
	},
	
	buildBoard: function () {
		this.board = new NotationBoard(this);
	},

	parseMoves: function () {
		if(!this.lines.length) return false;
		var moves_str_arr = this.lines.shift().split(' ');

		for(var i=0;i<moves_str_arr.length;i++) {
			console.log('Creating NotationMove: ' + moves_str_arr[i].trim());
			var move = new NotationMove(this, i+1, moves_str_arr[i].trim(), this.board, this.score);
			
			// move.parse() return false when its done parsing
			if(!move.parse()) {
				// Did we parse anything?
				return this.moves.length > 0;
			}

			this.moves.push(move);

			//execute create new board and execute move on it
			this.board = new NotationBoard(this, this.board);
			var result = move.execute(this, this.board);

			if(result && result.scored) {
				this.scored(result.player);
			}
		}

		return true;
	},

	setState: function (state) {
		if(this.state == state) throw new Error('Attempted to change state to ' + state + ' but game already in this state');
		this.state = state;
	},

	scored: function (player) {
		this.score['player' + player]++;
		this.setState(this.STATES.PUCK_PLACE);
		this.buildBoard();
	}
};

module.exports = NotationGame;
