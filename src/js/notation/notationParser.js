var NotationGame = require('./notationGame');

function NotationParser(text) {
	this.text = text;
	this.games = [];

	this.lines = text.split('\n').map(function (str) { return str.trim() });

	this.parseGame();
}

NotationParser.prototype = {
	parseGame:function () {
		console.log('----parting game');
		var game = new NotationGame(this);

		if(game.parse()) {
			console.log('-----GAME PARSED!');
			this.games.push(game);
			if(this.lines.length) {
				this.parseGame();
			}
		}else{
			console.log('-------done');
			console.log(this.lines);
		}
	}
};

module.exports = NotationParser;
