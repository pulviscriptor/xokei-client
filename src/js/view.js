/* The view for the game -- handles displaying the game and listening to events
 * generated by the user manipulating the display of the game */
"use strict";

/// requires
var Display = require("./display"),
	events = require("./events"),
	Player = require("./players"),
	settings = require("./settings");
	
/// object
function View(board) {
	/// public variables
	this.$message = $(".message");
	this.$messageContainer = $(".message-container");
	
	this.$playerOneName = $(".player-1-name");
	this.$playerOneScore = $(".player-1-score");
	
	this.$playerTwoName = $(".player-2-name");
	this.$playerTwoScore = $(".player-2-score");
	
	this.board = board;
	this.controller = null;
	this.display = new Display(board);
	this.events = events;

	this.init();
}

/// public functions
// display a closable message over the board to the player
View.prototype = {
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

	init: function () {
		this.initMessages();
		this.initSettings();
		this.initTooltips();
	},

	initTooltips: function () {
		// we need jquery's tooltip, but its in conflict with bootstrap
		$.fn.tooltip.noConflict();


		$(window).tooltip({
			items: '.tlp',
			content: function () {
				return $(this).data('tooltip');
			},
			/*classes: {
			 'ui-tooltip': 'score-tooltip-content'
			 },*/
			tooltipClass: 'tooltip-content'
			//extraClass: 'score-tooltip-content'
		});
	},

	initSettings: function () {
		$('.name-input').attr('maxlength', settings.game.playerNameMaxLength);
	},

	closeMessage: function () {
		if (this.hideMessageTimer) {
			clearTimeout(this.hideMessageTimer);
			this.hideMessageTimer = null;
		}
		
		this.$messageContainer.fadeOut(400);
		this.controller.emit("close message");
	},
	
	initMessages: function () {
		this.$messageContainer.hide();
		this.$message.html("");
		$(".close-message").click(this.closeMessage.bind(this));
	},
	
	message: function (message, life) {
		var boardWidth = this.display.$board.width(),
			func,
			self = this;
		
		this.$message.html(message.message || message);
		this.$messageContainer
			.css("left", (boardWidth - this.$messageContainer.width()) / 2)
			.fadeIn(400);
		
		if (typeof life === "number" || typeof message.life === "number") {
			this.hideMessageTimer = setTimeout(function () {
				self.$messageContainer.fadeOut(400);
			}, life || message.life);
		} else if (typeof life === "string" || 
			typeof message.life === "string") {
			// we assume we have an event listener here
			func = this.controller
				.addListener(life || message.life, function () {
					self.closeMessage();
					self.controller.removeListener(life || message.life, func);
				});
		}
	},
	
	// if the window size is changed, the message needs to be replaced at the
	// center of the board
	resizeMessage: function () {
		this.$messageContainer.css("left", (this.display.$board.width() - 
			this.$messageContainer.width()) / 2);
	},
	
	reshowGame: function () {
		this.display.createActors();
		
		if (this.board.puck) {
			this.display.createPuck();
		}
	},

	// cause the game board to be displayed
	showGame: function () {
		this.display.createActors();
		
		if (this.board.puck) {
			this.display.createPuck();
		}
		
		this.events.listen(this.controller, this.display);
	},
	
	// display who's turn it is
	showTurnState: function (player) {
		$(".player-name").css("text-decoration", "none");
		$(".actor-player").stop(true).fadeTo(200, "1");

		if (player === Player.One) {
			this.$playerOneName.css("text-decoration", "underline");
			$(".actor-player2").stop(true).fadeTo(200, settings.game.inactivePlayerOpacity);
		} else {
			this.$playerTwoName.css("text-decoration", "underline");
			$(".actor-player1").stop(true).fadeTo(200, settings.game.inactivePlayerOpacity);
		}
	},
	
	// update the scores of the players on the screen
	updateScore: function (score) {
		this.$playerOneScore.html(score[Player.One]);
		this.$playerTwoScore.html(score[Player.Two]);

		$('.score-point-player1').each(function () {
			var $el = $(this);
			var dataScore = parseInt($el.data('score'));
			if(dataScore > score[Player.One] && !$el.hasClass('hidden')) {
				$el.addClass('hidden');
			}else if(dataScore <= score[Player.One] && $el.hasClass('hidden')) {
				$el.removeClass('hidden');
			}
		}).data('tooltip', 'You scored <b>' + score[Player.One] + '</b> goal' + (score[Player.One]>1?'s':'') +
			'<br>Your opponent scored <b>' + score[Player.Two] + '</b>' +
			'<br>Game ends at <b>' + settings.game.scoreToWin + '</b> goals');


		$('.score-point-player2').each(function () {
			var $el = $(this);
			var dataScore = parseInt($el.data('score'));
			if(dataScore > score[Player.Two] && !$el.hasClass('hidden')) {
				$el.addClass('hidden');
			}else if(dataScore <= score[Player.Two] && $el.hasClass('hidden')) {
				$el.removeClass('hidden');
			}
		}).data('tooltip', 'You scored <b>' + score[Player.Two] + '</b>' + ' goal' + (score[Player.Two]>1?'s':'') +
			'<br>Your opponent scored <b>' + score[Player.One] + '</b>' +
			'<br>Game ends at <b>' + settings.game.scoreToWin + '</b> goals');
	},

	// initialize our dialog windows
	initDialogsWindows: function () {
		$('#game-won-window').draggable({ containment: "window" });
		$('#names-2p-window').draggable({ containment: "window" });
		$('#game-select-window').draggable({ containment: "window" }).removeClass('hidden');
		this.resizeDialogsWindows();
	},

	// resize our dialog windows
	resizeDialogsWindows: function () {
		var $board = $('#board');
		var $wonDialog = $('#game-won-window');
		if(!$wonDialog.hasClass('hidden')) {
			$wonDialog.position({
				of: $board
			});
		}

		var $gameSelectDialog = $('#game-select-window');
		if(!$gameSelectDialog.hasClass('hidden')) {
			$gameSelectDialog.position({
				of: $board
			});
		}

		var $names2pDialog = $('#names-2p-window');
		if(!$names2pDialog.hasClass('hidden')) {
			$names2pDialog.position({
				of: $board
			});
		}

		// TODO move this code into some onResize function
		var width = ($board.width() / 2.6) + "px";
		$('.score-container .player-name').css('width', width);

		setTimeout(function () {
			$('.score-container').removeClass('hidden')
			.position({
				my: "center bottom",
				at: "top-10px",
				of: $board,
				collision: "none"
			});
		}, 1);

		this.reCalculatePlayerNamesFontSize();
	},

	// fit player names on top of board if they are too big
	// https://stackoverflow.com/questions/1582534/calculating-text-width
	reCalculatePlayerNamesFontSize: function () {
		var getTextSize = function (text, fontSize) {
			var $el = $('<span style="font-family:\'Helvetica Neue\', Helvetica, Arial, sans-serif;font-size: ' + (fontSize || '1.3') + 'em;font-weight:bold"></span>').text(text).hide().appendTo('body');
			var ret = $el.width();
			$el.remove();
			return ret;
		};
		var calculateAllowedSize = function ($el, nickname) {
			var allowedMaxSize = $el.width();
			for(var candidate = 1.3; candidate >= 0.5; candidate = parseFloat((candidate-0.01).toFixed(2))) {
				var candidateSize = getTextSize(nickname, candidate);
				if(candidateSize < allowedMaxSize) return candidate;
			}
			return 0.5;
		};

		var $p1name = $('.score-container .player-1-name');
		var $p2name = $('.score-container .player-2-name');
		var p1size = calculateAllowedSize($p1name, $p1name.text());
		var p2size = calculateAllowedSize($p2name, $p2name.text());
		$p1name.css('font-size', p1size + 'em');
		$p2name.css('font-size', p2size + 'em');
	},

	// display window with won message and button to start new game
	gameWon: function (scores) {
		if(scores.player1 > scores.player2) {
			$('#game-won-winner-name').text(Player.name[Player.One]);
			$('#game-won-winner-score').text(scores.player1);
			$('#game-won-looser-score').text(scores.player2);
		}else{
			$('#game-won-winner-name').text(Player.name[Player.Two]);
			$('#game-won-winner-score').text(scores.player2);
			$('#game-won-looser-score').text(scores.player1);
		}
		$('#game-won-window').removeClass('hidden').position({
			of: $('#board')
		});
	},

	// button "New Game" clicked in "won message" dialog
	newGameClicked: function () {
		$('#game-won-window').addClass('hidden');
		this.showWelcomeWindow();
	},

	showWelcomeWindow: function () {
		$('#game-select-window').removeClass('hidden').position({
			of: $('#board')
		});
	},

	hideWelcomeWindow: function () {
		$('#game-select-window').addClass('hidden');
	},

	showNames2pWindow: function () {
		$('#names-2p-window').removeClass('hidden').position({
			of: $('#board')
		});
	},

	hideNames2pWindow: function () {
		$('#names-2p-window').addClass('hidden');
	},

	// add turn to notation box
	notate: function (id, str, newLine) {
		var html = '<span class="move-notation" id="move-notation-game' + this.board.settings.gameID + '-' + id + '" class="move-notation-game-' + id + '">' + this.escapeHtml(str) + ' </span>' + (newLine ? '<br>' : '');
		if(id == 'gameresult') {
			$('#move-notation-game' + this.board.settings.gameID + '-postmeta').before(html);
		}else{
			$('#moves').append(html);
		}
	},

	// remove all text from moves box
	clearNotations: function () {
		$('#moves').html('');
	},

	updateNames: function(p1name, p2name) {
		$('.player-1-name').text(p1name);
		$('.player-2-name').text(p2name);

		this.reCalculatePlayerNamesFontSize();
	},

	notateMeta: function (anotherGame) {
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
		//[Date: 2017-08-28 14:33:28+00:00]

		if(anotherGame) {
			this.notate( 'anothergame', '', true);
		}
		this.notate( 'date', '[Date "' + ISO8601Date + '"]', true);
		this.notate( 'gamenumber', '[Game "' + this.board.settings.gameID + '"]', true);
		if(!anotherGame) {
			this.notate( 'p1name', '[White "' + Player.name[Player.One] + '"]', true);
			this.notate( 'p2name', '[Black "' + Player.name[Player.Two] + '"]', true);
		}
		this.notate( 'postmeta', '', true);
	}
};

/// exports
module.exports = View;
