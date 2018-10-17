/* The view for the game -- handles displaying the game and listening to events
 * generated by the user manipulating the display of the game */
"use strict";

/// requires
var Display = require("./display"),
	events = require("./events"),
	Player = require("./players"),
	utils = require("./utils"),
	settings = require("./settings");
	
/// object
function View(board) {
	/// public variables
	this.$message = $(".message");
	this.$messageContainer = $(".message-container");
	
	this.$playerOneName = $(".player-1-name-text");
	this.$playerOneScore = $(".player-1-score");
	
	this.$playerTwoName = $(".player-2-name-text");
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
	//todo move this to utils
	escapeHtml: function (string) {
		return utils.escapeHtml(string);
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
				return $(this).attr('data-tooltip');
			},
			/*classes: {
			 'ui-tooltip': 'score-tooltip-content'
			 },*/
			tooltipClass: 'tooltip-content',
			//extraClass: 'score-tooltip-content'
			track: true,
			// disable animation
			show: false, 
			hide: false
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
		$(".player-name-text").removeClass("turn-owner");
		$(".actor-player").stop(true).fadeTo(200, "1");

		if (player === Player.One) {
			this.$playerOneName.addClass("turn-owner");
			$(".actor-player2").stop(true).fadeTo(200, settings.game.inactivePlayerOpacity);
		} else {
			this.$playerTwoName.addClass("turn-owner");
			$(".actor-player1").stop(true).fadeTo(200, settings.game.inactivePlayerOpacity);
		}

		this.updatePlayerNamesTooltips();
		if(this.controller.turns.length) { // don't allow players to resign instantly after starting game
			this.showResignButton(player);
		}
	},

	// display "resign game" button for player
	showResignButton: function (player) {
		$('.resign-game').hide();

		if(player) {
			$('.resign-game-' + player).show();
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
		}).tooltipContent('You scored <b>' + score[Player.One] + '</b> goal' + (score[Player.One]>1?'s':'') +
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
		}).tooltipContent('You scored <b>' + score[Player.Two] + '</b>' + ' goal' + (score[Player.Two]>1?'s':'') +
			'<br>Your opponent scored <b>' + score[Player.One] + '</b>' +
			'<br>Game ends at <b>' + settings.game.scoreToWin + '</b> goals');
	},

	updatePlayerNamesTooltips: function () {
		var score = {};
		if(!this.controller.turns.length) {
			score[Player.One] = 0;
			score[Player.Two] = 0;
		}else{
			score = this.controller.turns.slice(-1)[0].score();
		}

		var scoreIs = 'The score is ' + score[Player.One] + '-' + score[Player.Two] + '.<br>';
		var tooltipP1 = scoreIs;
		var tooltipP2 = scoreIs;
		var lastGame = this.board.gamesHistory[this.board.settings.gameID-1];

		if(lastGame) {
			tooltipP1 += Player.getStaticSizeName(Player.One) + ' ' + (lastGame.winner == Player.One ? 'won' : 'lost') + ' Game ' + (this.board.settings.gameID-1) + '.<br>';
			tooltipP2 += Player.getStaticSizeName(Player.Two) + ' ' + (lastGame.winner == Player.Two ? 'won' : 'lost') + ' Game ' + (this.board.settings.gameID-1) + '.<br>';
		}

		if(score[Player.One] > score[Player.Two]) {
			tooltipP1 += Player.getStaticSizeName(Player.One) + ' is currently winning.<br>';
			tooltipP2 += Player.getStaticSizeName(Player.Two) + ' is currently losing.<br>';
		}else if(score[Player.One] < score[Player.Two]) {
			tooltipP1 += Player.getStaticSizeName(Player.One) + ' is currently losing.<br>';
			tooltipP2 += Player.getStaticSizeName(Player.Two) + ' is currently winning.<br>';
		}else{
			tooltipP1 += Player.getStaticSizeName(Player.One) + ' is neither winning nor losing.<br>';
			tooltipP2 += Player.getStaticSizeName(Player.Two) + ' is neither winning nor losing.<br>';
		}
		tooltipP1 += 'It is the turn of ' + Player.getStaticSizeName(this.board.settings.owner) + '.';
		tooltipP2 += 'It is the turn of ' + Player.getStaticSizeName(this.board.settings.owner) + '.';

		$('.player-1-name-text,.player-1-score').tooltipContent(tooltipP1);
		$('.player-2-name-text,.player-2-score').tooltipContent(tooltipP2);
	},

	// initialize our dialog windows
	initDialogsWindows: function () {
		$('#game-won-window').draggable({ containment: "window" });
		$('#names-2p-window').draggable({ containment: "window" });
		$('#game-select-window').draggable({ containment: "window" });
		$('#settings-window').draggable({ containment: "window" });
		$('#network-error-window').draggable({ containment: "window" });
		$('#network-online-game-select').draggable({ containment: "window" });
		$('#invite-friend-window').draggable({ containment: "window" });
		$('#join-private-game-window').draggable({ containment: "window" });
		$('#wait-opponent-window').draggable({ containment: "window" });
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

		var $settingsDialog = $('#settings-window');
		if(!$settingsDialog.hasClass('hidden')) {
			$settingsDialog.position({
				of: $board
			});
		}

		var $networkErrorDialog = $('#network-error-window');
		if(!$networkErrorDialog.hasClass('hidden')) {
			$networkErrorDialog.position({
				of: $board
			});
		}

		var $networkOnlineGameSelect = $('#network-online-game-select');
		if(!$networkOnlineGameSelect.hasClass('hidden')) {
			$networkOnlineGameSelect.position({
				of: $board
			});
		}

		var $inviteFriendDialog = $('#invite-friend-window');
		if(!$inviteFriendDialog.hasClass('hidden')) {
			$inviteFriendDialog.position({
				of: $board
			});
		}

		var $joinPrivateGameDialog = $('#join-private-game-window');
		if(!$joinPrivateGameDialog.hasClass('hidden')) {
			$joinPrivateGameDialog.position({
				of: $board
			});
		}

		var $waitOpponentDialog = $('#wait-opponent-window');
		if(!$waitOpponentDialog.hasClass('hidden')) {
			$waitOpponentDialog.position({
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
		var $p1name = $('.score-container .player-1-name');
		var $p2name = $('.score-container .player-2-name');
		var p1size = utils.calculateAllowedTextSize(Player.name[Player.One], $p1name.width(), 0.5, 1.3);
		var p2size = utils.calculateAllowedTextSize(Player.name[Player.Two], $p2name.width(), 0.5, 1.3);
		Player.textSizeDynamic[Player.One] = p1size;
		Player.textSizeDynamic[Player.Two] = p2size;

		$p1name.css('font-size', p1size + 'em');
		$p2name.css('font-size', p2size + 'em');

		$('.notation-meta-string-p1name').css('font-size', p1size + 'em');
		$('.notation-meta-string-p2name').css('font-size', p2size + 'em');
	},

	// display window with won message and button to start new game
	gameWon: function (scores) {
		if(scores.player1 > scores.player2) {
			$('#game-won-winner-name').text(Player.name[Player.One]).css('font-size', Player.textSizeStatic[Player.One] + 'em');
			$('#game-won-winner-score').text(scores.player1);
			$('#game-won-looser-score').text(scores.player2);
		}else{
			$('#game-won-winner-name').text(Player.name[Player.Two]).css('font-size', Player.textSizeStatic[Player.Two] + 'em');
			$('#game-won-winner-score').text(scores.player2);
			$('#game-won-looser-score').text(scores.player1);
		}
		$('#game-won-another-game-button-span').removeClass('hidden');
		$('#game-won-window-another-waiting-game-span').addClass('hidden');
		$('#game-won-window-another-game-opponent-left-span').addClass('hidden');
		$('.game-won-another-game-button-requested').removeClass('game-won-another-game-button-requested');

		$('#game-won-win-message').removeClass('hidden');
		$('#game-won-resign-message').addClass('hidden');
		$('#game-won-window').removeClass('hidden').position({
			of: $('#board')
		});
	},

	// display window with resigned message and button to start new game
	gameResigned: function (scores, resigned_player, code) {
		// codes:
		// CLIENT_DISCONNECTED - online disconnect
		// ONLINE_RESIGN - online opponent resigned
		// LOCAL_RESIGN - local opponent resigned
		$('#game-won-resigned-name').text(Player.name[resigned_player]).css('font-size', Player.textSizeStatic[resigned_player] + 'em');
		$('#game-won-resigned-winner-name').text(Player.name[Player.opponent(resigned_player)]).css('font-size', Player.textSizeStatic[Player.opponent(resigned_player)] + 'em');

		$('#game-won-another-game-button-span').removeClass('hidden'); //todo depends on code
		$('#game-won-window-another-waiting-game-span').addClass('hidden'); //todo depends on code
		$('#game-won-window-another-game-opponent-left-span').addClass('hidden');

		$('.game-won-another-game-button-requested').removeClass('game-won-another-game-button-requested');

		if(code == 'CLIENT_DISCONNECTED') {
			$('#game-won-window-another-game-opponent-left-span').removeClass('hidden').attr('data-tooltip', 'Opponent disconnected');
		}else if(code == 'ONLINE_RESIGN') {
			$('#game-won-another-game-button-span').removeClass('hidden');
		}else{
			//local 2p game
			$('#game-won-another-game-button-span').removeClass('hidden');
		}

		$('#game-won-win-message').addClass('hidden');
		$('#game-won-resign-message').removeClass('hidden');
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

	showNetworkOnlineGameSelect: function () {
		$('#network-online-game-select').removeClass('hidden').position({
			of: $('#board')
		});
	},

	hideNetworkOnlineGameSelect: function () {
		$('#network-online-game-select').addClass('hidden');
	},

	// add turn to notation box
	notate: function (type, id, str, html) {
		var notation = {id: id, str: str, html: !!html};
		this.board.gamesHistory[this.board.settings.gameID]['notation_' + type].push(notation);

		if($('.notation-' + type + '-table' + this.board.settings.gameID).hasClass('notation-collapsed')) {
			$('.notation-area-' + type + '-' + this.board.settings.gameID).html(utils.notation['collapsedHTML' + type](this.board.gamesHistory[this.board.settings.gameID]['notation_' + type]), html);
		}else{
			$('.notation-area-' + type + '-' + this.board.settings.gameID).html(utils.notation['expandedHTML' + type](this.board.gamesHistory[this.board.settings.gameID]['notation_' + type]), html);
		}

		if(type == 'move' && id == 1) {
			var $table = $('.notation-move-table' + this.board.settings.gameID);
			$table.removeClass('hidden');
			if($('.move-expand-all').data('state') == '3') {
				$table.find('.notation-expand-collapse-icon').click();
			}
		}
	},

	// remove all text from moves box
	clearNotations: function () {
		$('#moves').html('');
	},

	showErrorNames2P: function (player, msg) {
		var $el = $(player == Player.One ? '#names-2p-error-p1' : '#names-2p-error-p2');
		if($el.text().trim()) return;
		$el.text(msg);
		setTimeout(function () {
			$el.html('&nbsp;');
		}, 2000);
	},

	updateNames: function(p1name, p2name) {
		$('.player-1-name-text').text(p1name);
		$('.player-2-name-text').text(p2name);

		// dynamic sizes
		this.reCalculatePlayerNamesFontSize();

		// static sizes
		var p1size = utils.calculateAllowedTextSize(p1name, 190, 0.3, 1);
		var p2size = utils.calculateAllowedTextSize(p2name, 190, 0.3, 1);
		Player.textSizeStatic[Player.One] = p1size;
		Player.textSizeStatic[Player.Two] = p2size;
	},

	// when we start new/another game we call this
	notateMeta: function (/*anotherGame*/) {
		var ISO8601Date = utils.notation.ISO8601Date();

		// setup areas for notations
		var $moves = $('#moves');
		/*if(anotherGame) {
			$moves.append('<br>');
		}*/
		$moves.append('<table class="notation-table notation-meta-table notation-meta-table' + this.board.settings.gameID + ' notation-expanded" data-type="meta">' +
			'<tr>' +
				'<td class="notation-expand-collapse-td">' +
					'<i class="fa fa-chevron-down notation-expand-collapse-icon tlp" aria-hidden="true" data-gameid="' + this.board.settings.gameID + '" data-type="meta" data-tooltip="Collapse notation"></i>' +
				'</td>' +
				'<td>' +
					'<span class="notation-area-meta notation-area-meta-' + this.board.settings.gameID + '"></span>' +
				'</td>' +
			'</tr>' +
			'</table>');
		$moves.append('<br>');
		if($('.move-expand-all').data('state') == '3') {
			$('.notation-meta-table' + this.board.settings.gameID).find('.notation-expand-collapse-icon').click();
		}
		//$moves.append('<p class="notation-spacer"></p>');

		$moves.append('<table class="hidden notation-table notation-move-table notation-move-table' + this.board.settings.gameID + ' notation-expanded" data-type="move">' +
			'<tr>' +
				'<td class="notation-expand-collapse-td">' +
				'	<i class="fa fa-chevron-down notation-expand-collapse-icon tlp" aria-hidden="true" data-gameid="' + this.board.settings.gameID + '" data-type="move" data-tooltip="Collapse notation"></i>' +
				'</td>' +
				'<td>' +
					'<span class="notation-area-move notation-area-move-' + this.board.settings.gameID + '"></span>' +
				'</td>' +
			'</tr>' +
			'</table>');
		$moves.append('<br>');
		//$moves.append('<p class="notation-spacer"></p>');

		// notate
		/*if(anotherGame) {
			this.notate( 'meta', 'anothergame', '');
		}*/
		this.notate( 'meta', 'gamenumber', '[Game "' + this.board.settings.gameID + '"]');
		this.notate( 'meta', 'date', '[Date "' + ISO8601Date + '"]');
		this.notate( 'meta', 'p1name', '[White "' + Player.getStaticSizeName(Player.One) + '"]', true);
		this.notate( 'meta', 'p2name', '[Black "' + Player.getStaticSizeName(Player.Two) + '"]', true);
	},

	// expand or collapse notations
	notationsExpandCollapse: function ($el) {
		var type = $el.data('type');
		var gameID = $el.data('gameid');
		var $table = $el.closest('table');

		if($table.hasClass('notation-expanded')) {
			var html = utils.notation["collapsedHTML" + type](this.board.gamesHistory[gameID]["notation_" + type]);
			// if there is not enough text to collapse
			if(!html) return;

			$table.removeClass('notation-expanded');
			$table.addClass('notation-collapsed');
			$el.addClass('fa-chevron-right');
			$el.removeClass('fa-chevron-down');
			$el.tooltipContent('Expand notation');

			$('.notation-area-' + type + '-' + gameID).html(html);
		}else{
			$table.addClass('notation-expanded');
			$table.removeClass('notation-collapsed');
			$el.removeClass('fa-chevron-right');
			$el.addClass('fa-chevron-down');
			$el.tooltipContent('Collapse notation');

			$('.notation-area-' + type + '-' + gameID).html(utils.notation["expandedHTML" + type](this.board.gamesHistory[gameID]["notation_" + type]));
		}
	},

	notationRecalculateExpandAllIcon: function () {
		if($('.notation-collapsed:visible').length === 0) {
			// all notations expanded
			$('.move-expand-all')
				.removeClass('fa-rotate-45')
				.removeClass('fa-chevron-right')
				.addClass('fa-chevron-down')
				.tooltipContent('Collapse all')
				.data('state', '1');
		}else if($('.notation-expanded:visible').length === 0) {
			// all notations collapsed
			$('.move-expand-all')
				.removeClass('fa-rotate-45')
				.removeClass('fa-chevron-down')
				.addClass('fa-chevron-right')
				.tooltipContent('Expand all')
				.data('state', '3');
		}else{
			// part of notations collapsed/expanded
			$('.move-expand-all')
				.addClass('fa-rotate-45')
				.removeClass('fa-chevron-down')
				.addClass('fa-chevron-right')
				.tooltipContent('Expand all')
				.data('state', '2');
		}
	},

	notationExpandAll: function () {
		var $expandAllIcon = $('.move-expand-all');
		var state = $expandAllIcon.data('state');
		if(state == '1') {
			$('.notation-expanded:visible .notation-expand-collapse-icon').click();
			this.notationRecalculateExpandAllIcon();
		}else{
			$('.notation-collapsed:visible .notation-expand-collapse-icon').click();
			this.notationRecalculateExpandAllIcon();
		}
	},

	notationResetExpandAllIcon: function () {
		var $expandAllIcon = $('.move-expand-all');
		var state = $expandAllIcon.data('state');
		if(state != '1') {
			// set it back to 1 from 2 or 3
			$expandAllIcon.click();
		}
	},
	
	network: {
		killed: function (reason) {
			var $networkKilledDialog = $('#network-killed-window');
			var $game_won_window = $('#game-won-window');
			var $board = $('#board');

			if(!$game_won_window.hasClass('hidden')) {
				$game_won_window.addClass('hidden');
			}

			$networkKilledDialog.removeClass('hidden');
			$('#network-killed-message').text(reason);

			$networkKilledDialog.position({
				of: $board
			});
		},

		newGameRefused: function (code) {
			// code: CLIENT_DISCONNECTED / NEW_GAME
			$('#game-won-window-another-waiting-game-span').addClass('hidden');
			$('#game-won-another-game-button-span').addClass('hidden');
			$('#game-won-window-another-game-opponent-left-span').removeClass('hidden');

			if(code == 'CLIENT_DISCONNECTED') {
				$('#game-won-another-game-opponent-left').attr('data-tooltip', 'Opponent disconnected');
			}else if(code == 'NEW_GAME') {
				$('#game-won-another-game-opponent-left').attr('data-tooltip', 'Opponent refused to play another game');
			}else{
				$('#game-won-another-game-opponent-left').attr('data-tooltip', 'Unknown code: ' + code);
			}
		}
	}
};

/// exports
module.exports = View;
