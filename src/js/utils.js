var utils = {
	notation: {
		collapsedHTMLmeta: function (notations) {
			var date = notations.slice(0, 1);
			return this.mapMeta(date)[0] +
				'<span class="notation-hidden"><br>' + this.mapMeta(notations.slice(1)).join('<br>') + '</span>';
		},

		expandedHTMLmeta: function (notations) {
			return this.mapMeta(notations).join('<br>');
		},

		collapsedHTMLmove: function (notations) {
			var ret = this.mapMove(notations);
			var amount = this.calculateCollapsedElementsAmount(notations);
			// if there is not enough text to collapse
			//if(!amount) return false;

			if(!amount) {
				return ret.join(' ');
			}else{
				// dirty hack to disable text selection by creating fake HTML dots that looks like text
				return ret.slice(0, amount).join(' ') +
					'<span class="notation-hidden">&nbsp;' + ret.slice(amount).join(' ') + '</span>' +
					'<span class="notation-dot"></span><span class="notation-dot"></span><span class="notation-dot"></span>';
			}
		},

		expandedHTMLmove: function (notations) {
			return this.mapMove(notations).join(' ');
		},

		mapMove: function (notations) {
			var util_notation = this;
			return 	notations.map(function (move) {
				return util_notation.generateHTMLmove(move);
			});
		},

		mapMeta: function (notations) {
			var util_notation = this;
			return 	notations.map(function (meta) {
				return util_notation.generateHTMLmeta(meta);
			});
		},

		generateHTMLmove: function (move) {
			return '<span class="notation-move notation-move-' + move.id + '">' + this.wrapMovesInTooltips(move.str) + '</span>';
		},

		generateHTMLmeta: function (meta) {
			return '<span class="notation-meta notation-meta-' + meta.id + '">' + utils.escapeHtml(meta.str) + '</span>';
		},

		wrapMovesInTooltips: function (moves) {
			var single = moves.split(' ');
			var ret = [];
			for(var i=0;i<single.length;i++) {
				ret.push(this.wrapSingleMoveInTooltip(single[i]));
			}
			return ret.join(' ');
		},

		wrapSingleMoveInTooltip: function (move) {
			var ret = '';
			if(move.match(/^\d-\d$/i)) {
				return this.generateTooltipHTML(move, 'Game finished with score ' + move);
			}
			ret += (move[0] == '1') ? 'Player 1 ' : 'Player 2 ';
			if(move[1] == 'p' && move.length == 4) {
				ret += 'placed puck at ' + move.substr(2);
				return this.generateTooltipHTML(move, ret);
			}else{
				ret += 'moved ';
			}
			if(move[1] == 'p') {
				ret += 'puck ';
				ret += this.movesNotationCoordinatesToTooltip(move.substr(2));
			}else{
				ret += this.movesNotationCoordinatesToTooltip(move.substr(1));
			}

			if(move.substr(-2) == '++') {
				ret += 'and won the game';
			}else if(move.substr(-1) == '+') {
				ret += 'and scored';
			}

			return this.generateTooltipHTML(move, ret);
		},

		movesNotationCoordinatesToTooltip: function (str) {
			var moves = str.match(/.{2}/g);
			var ret = 'from ' + moves[0] + ' ';
			for(var i=1;i<moves.length;i++) {
				var move = moves[i];
				if(move == '++') continue;
				ret += 'to ' + move + ' ';
			}

			return ret;
		},

		generateTooltipHTML: function (move, tooltip) {
			return '<span class="notation-move-tooltip tlp" data-tooltip="' + tooltip + '">' + move + '</span>';
		},

		calculateCollapsedElementsAmount: function (arr) {
			var max_size = 32;
			var tmp = arr[0].str;
			var count = 1;

			for(var i=1;i<arr.length;i++) {
				tmp += ' ' + arr[i].str;
				if(tmp.length >= max_size) return count;
				count++;
			}

			return 0;
		},

		ISO8601Date: function () {
			var pad = function(number) {
				if (number < 10) {
					return '0' + number;
				}
				return number;
			};
			var offset = function (date) {
				var timezoneOffset = date.getTimezoneOffset();
				var hours = Math.floor(Math.abs(date.getTimezoneOffset())/60);
				var minutes = date.getTimezoneOffset()%60;
				var format = pad(hours) + ((minutes > 0) ? (':' + pad(minutes)) : '');
				//var format = pad(hours) + ':' + pad(minutes);

				if(timezoneOffset === 0) return '';
				if(timezoneOffset > 0) {
					return '-' + format;
				}else{
					return '+' + format;
				}
			};
			var date = new Date();
			var ISO8601Date = date.getFullYear() +
				'-' + pad(date.getMonth() + 1) +
				'-' + pad(date.getDate()) +
				' ' + pad(date.getHours()) +
				':' + pad(date.getMinutes()) +
				':' + pad(date.getSeconds()) +
				offset(date);
			return ISO8601Date;
		},

		export: function (gamesHistory) {
			var ret = [];
			for(var gameID in gamesHistory) {
				var meta = [];
				for(var metaID in gamesHistory[gameID].notation_meta) {
					meta.push(gamesHistory[gameID].notation_meta[metaID].str);
				}
				ret.push(meta.join("\r\n"));

				var move = [];
				for(var moveID in gamesHistory[gameID].notation_move) {
					move.push(gamesHistory[gameID].notation_move[moveID].str);
				}
				ret.push(move.join(" "));
			}

			return ret.join("\r\n\r\n");
		}
	},

	escapeHtml: function (string) {
		var entityMap = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'/': '&#x2F;',
			'`': '&#x60;',
			'=': '&#x3D;'
		};

		return String(string).replace(/[&<>"'`=\/]/g, function (s) {
			return entityMap[s];
		});
	},

	copyTextToClipboard: function(text) {
		// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
		var textArea = window.document.createElement("textarea");
		var result = false;

		textArea.style.position = 'fixed';
		textArea.style.top = 0;
		textArea.style.left = 0;
		textArea.style.width = '2em';
		textArea.style.height = '2em';
		textArea.style.padding = 0;
		textArea.style.border = 'none';
		textArea.style.outline = 'none';
		textArea.style.boxShadow = 'none';
		textArea.style.background = 'transparent';

		textArea.value = text;

		window.document.body.appendChild(textArea);

		textArea.select();

		try {
			result = window.document.execCommand('copy');
		} catch (err) {

		}
		window.document.body.removeChild(textArea);

		return result;
	},


	notationToCoordinates: function (notation) {
		var settings = require('./settings');
		var x = settings.coordinates.horizontal.indexOf(notation.toLowerCase()[0]);
		var y = settings.coordinates.vertical.indexOf(notation.toLowerCase()[1]);

		if(x < 0) throw new Error('Unknown notation X coordinate: ' + notation[0]);
		if(y < 0) throw new Error('Unknown notation Y coordinate: ' + notation[1]);

		return {x: x, y: y};
	},

	coordinatesToNotation: function (cords, y) {
		var settings = require('./settings');
		if(typeof y == 'number') { cords = {x: cords, y: y}; }

		if(typeof cords.x != 'number') throw new Error('Expected cords.x to be a number and it was ' + cords.x);
		if(typeof cords.y != 'number') throw new Error('Expected cords.y to be a number and it was ' + cords.y);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);

		return settings.coordinates.horizontal[cords.x] + settings.coordinates.vertical[cords.y];
	}
};

module.exports = utils;