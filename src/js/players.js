var utils = require('./utils');

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
	/*basicFontSize: {
		"player1": 1,
		"player2": 1
	},
	
	getFontSize: function (player, multiplier, max) {
		var basicSize = this.basicFontSize[player];
		var calculated = basicSize * multiplier;
		return Math.min(max, calculated);
	}*/
	/*textSizes: {
		above_board: {
			min: 0.5,
			max: 1.3
		},
		notation_meta: {
			min: 0.3,
			max: 1
		},
		player_won_window: {
			min: 0.3,
			max: 1
		},
		tooltip: {
			min: 0.3,
			max: 1
		},
		message: {
			min: 0.3,
			max: 1
		}
	},*/

	// re-calculated on resize
	textSizeDynamic: {
		"player1": null,
		"player2": null
	},

	// calculated after names set
	textSizeStatic: {
		"player1": null,
		"player2": null
	},

	getStaticSizeName: function (player) {
		return '<span style="font-size: ' + this.textSizeStatic[player] + 'em">' + utils.escapeHtml(this.name[player]) + '</span>';
	}
};