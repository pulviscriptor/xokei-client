module.exports = {
	get One() {
		return "player1";
	},

	set One(val) {
		throw new Error('Attempted to set Player.One to ' + val);
	},

	get Two() {
		return "player2";
	},

	set Two(val) {
		throw new Error('Attempted to set Player.Two to ' + val);
	},

	name: {
		"player1": "Player 1",
		"player2": "Player 2"
	},

	// will be set after calculateAllowedSize()
	basicFontSize: {
		"player1": 1,
		"player2": 1
	}
};