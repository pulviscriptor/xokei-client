var NotationBoard = require('./noatationBoard');
var NotationMove = require('./noatationMove');

function NotationGame(notationParser) {
	this.notationParser = notationParser;
	this.lines = this.notationParser.lines;

	this.game_id = null;
	this.meta = null;

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
		this.parseMeta();
		this.parseMove();

		this.buildBoard();

		//todo return true/false
	},

	parseMeta:function () {
		var meta = this.parseMetaLine();
		if(!meta.player1) meta.player1 = 'Player 1';
		if(!meta.player2) meta.player2 = 'Player 2';
		if(!meta.game) meta.game = '1';
		if(!meta.game) meta.game = '1';
	},

	parseMetaLine: function (meta) {
		if(!meta) meta = {};
		if(!this.lines.length) throw new Error('Failed to parse meta. Moves data missing in notation?');
		var line = this.lines[0];
		if(line.trim().length) {
			if(line[0] != '[') return meta; // No more meta to parse
			var parsed = line.match(/^\[([a-zA-Z]*) "(.*)"]$/);
			var meta_name = parsed[1];
			var meta_value = parsed[2];

			if(meta_name == 'Game') {
				meta.game = meta_value;
			}else if(meta_name == 'Date') {
				meta.date = meta_value;
			}else if(meta_name == 'White') {
				meta.player1 = meta_value;
			}else if(meta_name == 'Black') {
				meta.player2 = meta_value;
			}else if(meta_name == 'Result') {
				meta.result = meta_value;
			}else{
				throw new Error('Unknow meta name in line: ' + line);
			}
		}

		this.lines.shift();
		return this.parseMetaLine(meta);
	},
	
	buildBoard: function () {
		this.board = new NotationBoard(this);
	},

	parseMove: function () {
		if(!this.lines.length) return;
		var moves_str_arr = this.lines[0].split(' ');

		for(var i=0;i<moves_str_arr.length;i++) {
			console.log('Creating NotationMove: ' + moves_str_arr[i].trim());
			var move = new NotationMove(this, i+1, moves_str_arr[i].trim(), this.board, this.score);
			if(!move.parse()) return;
			this.moves.push(move);

			//execute create new board and execute move on it
			this.board = new NotationBoard(this, this.board);
			var result = move.execute(this, this.board);

			if(result && result.scored) {
				this.scored(result.player);
			}
		}
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
