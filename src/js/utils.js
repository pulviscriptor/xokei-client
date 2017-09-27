var utils = {
	notation: {
		collapsedHTMLmeta: function (notations) {
			var date = notations.slice(0, 1);
			return this.mapMeta(date)[0];
		},

		expandedHTMLmeta: function (notations) {
			return this.mapMeta(notations).join('<br>');
		},

		collapsedHTMLmove: function (notations) {
			var ret = this.mapMove(notations);
			var amount = this.calculateCollapsedElementsAmount(notations);
			// if there is not enough text to collapse
			if(!amount) return false;

			if(!amount) {
				return ret.join(' ');
			}else{
				return ret.slice(0, amount).join(' ') + '...';
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
			return '<span class="notation-move notation-move-' + move.id + '">' + utils.escapeHtml(move.str) + '</span>';
		},

		generateHTMLmeta: function (meta) {
			return '<span class="notation-meta notation-meta-' + meta.id + '">' + utils.escapeHtml(meta.str) + '</span>';
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
	}
};

module.exports = utils;