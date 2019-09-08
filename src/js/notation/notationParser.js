var NotationGame = require('./notationGame');

function NotationParser(text) {
	this.text = text;
	this.games = [];

	this.lines = text.split('\n').map(function (str) { return str.trim() });

	this.parseGame();
}

NotationParser.prototype = {
	parseGame:function () {
		var game = new NotationGame(this);
		if(game.parse()) {
			this.games.push(game);
			this.parseGame();
		}
	}
};

module.exports = NotationParser;
