// set game config for this test
window.game.settings.game.looserStartsAnotherGame = true;

describe('Testing game', function () {
	this.timeout(5000);

	describe('Basics', function () {
		it('should show welcome window', function () {
			expect($('#game-select-window').is(':visible')).to.equal(true);
		});

		it('should close welcome window after starting 2P game', function () {
			$('#game-select-mode-2p-local').click();
			expect($('#game-select-window').is(':visible')).to.equal(false);
		});

		it('should show enter names dialog', function () {
			expect($('#names-2p-message').is(':visible')).to.equal(true);
		});

		it('should display tooltip on submit button', function (done) {
			util.testTooltip('#names-2p-submit-btn', 'Start the game', done);
		});

		it('should accept values and start game', function () {
			$('#names-2p-submit-btn').click();
			expect($('#names-2p-message').is(':visible')).to.equal(false);
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 0-0.Player 1 is neither winning nor losing.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 0-0.Player 1 is neither winning nor losing.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 0-0.Player 2 is neither winning nor losing.It is the turn of Player 1.', done);
		});

		it('should not be able to place puck at player2 territory', function () {
			simulate.clickTile('h8');
			expect($('.puck-actor').length).to.equal(0);
		});

		it('should not be able to place puck and player2 territory', function () {
			simulate.clickTile('h8');
			expect($('.puck-actor').length).to.equal(0);
		});
	});

	describe('Tile tooltips tests with player1 owner', function () {
		var opponent = 'You can\'t place the puck on your opponent\'s side';
		var goaley = 'You can\'t place the puck in the goaley\'s zone';
		var goal = 'You can\'t place the puck in the goal';
		var ontop = 'You can\'t place the puck on top of the player';

		it('should display tooltip on tile g8', function (done) {
			util.testTileTooltip('g8', opponent, done);
		});
		it('should display tooltip on tile g7', function (done) {
			util.testTileTooltip('g7', opponent, done);
		});
		it('should display tooltip on tile g6', function (done) {
			util.testTileTooltip('g6', opponent, done);
		});
		it('should display tooltip on tile g3', function (done) {
			util.testTileTooltip('g3', opponent, done);
		});
		it('should display tooltip on tile g1', function (done) {
			util.testTileTooltip('g1', opponent, done);
		});
		it('should display tooltip on tile l8', function (done) {
			util.testTileTooltip('l8', opponent, done);
		});
		it('should display tooltip on tile l1', function (done) {
			util.testTileTooltip('l1', opponent, done);
		});

		it('should display tooltip on tile k6', function (done) {
			util.testTileTooltip('k6', goaley, done);
		});
		it('should display tooltip on tile l3', function (done) {
			util.testTileTooltip('l3', goaley, done);
		});
		it('should display tooltip on tile a6', function (done) {
			util.testTileTooltip('a6', goaley, done);
		});
		it('should display tooltip on tile b3', function (done) {
			util.testTileTooltip('b3', goaley, done);
		});

		it('should display tooltip on tile [5', function (done) {
			util.testTileTooltip('[5', goal, done);
		});
		it('should display tooltip on tile ]4', function (done) {
			util.testTileTooltip(']4', goal, done);
		});

		it('should display tooltip on tile f8', function (done) {
			util.testTileTooltip('f8', ontop, done);
		});
		it('should display tooltip on tile f6', function (done) {
			util.testTileTooltip('f6', ontop, done);
		});
		it('should display tooltip on tile f3', function (done) {
			util.testTileTooltip('f3', ontop, done);
		});
		it('should display tooltip on tile f1', function (done) {
			util.testTileTooltip('f1', ontop, done);
		});
	});

	describe('Goal by player1 to player1', function () {
		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});

		it('should display correct tooltip for meta collapse icon', function (done) {
			util.testTooltip('.notation-meta-table1 .notation-expand-collapse-icon', 'Collapse notation', done);
		});

		it('should display correct tooltip for move collapse icon', function (done) {
			util.testTooltip('.notation-move-table1 .notation-expand-collapse-icon', 'Collapse notation', done);
		});
	});

	describe('Goal by player1 to player2', function () {
		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 1,
				score2: 1,
				done: done
			});
		});
	});

	describe('Tile tooltips tests with player2 owner', function () {
		var opponent = 'You can\'t place the puck on your opponent\'s side';
		var goaley = 'You can\'t place the puck in the goaley\'s zone';
		var goal = 'You can\'t place the puck in the goal';
		var ontop = 'You can\'t place the puck on top of the player';

		it('should display tooltip on tile f8', function (done) {
			util.testTileTooltip('f8', opponent, done);
		});
		it('should display tooltip on tile f7', function (done) {
			util.testTileTooltip('f7', opponent, done);
		});
		it('should display tooltip on tile f6', function (done) {
			util.testTileTooltip('f6', opponent, done);
		});
		it('should display tooltip on tile f3', function (done) {
			util.testTileTooltip('f3', opponent, done);
		});
		it('should display tooltip on tile f1', function (done) {
			util.testTileTooltip('f1', opponent, done);
		});
		it('should display tooltip on tile a8', function (done) {
			util.testTileTooltip('a8', opponent, done);
		});
		it('should display tooltip on tile a1', function (done) {
			util.testTileTooltip('a1', opponent, done);
		});

		it('should display tooltip on tile b6', function (done) {
			util.testTileTooltip('b6', goaley, done);
		});
		it('should display tooltip on tile a3', function (done) {
			util.testTileTooltip('a3', goaley, done);
		});
		it('should display tooltip on tile l6', function (done) {
			util.testTileTooltip('l6', goaley, done);
		});
		it('should display tooltip on tile k3', function (done) {
			util.testTileTooltip('k3', goaley, done);
		});

		it('should display tooltip on tile [5', function (done) {
			util.testTileTooltip('[5', goal, done);
		});
		it('should display tooltip on tile ]4', function (done) {
			util.testTileTooltip(']4', goal, done);
		});

		it('should display tooltip on tile g8', function (done) {
			util.testTileTooltip('g8', ontop, done);
		});
		it('should display tooltip on tile g6', function (done) {
			util.testTileTooltip('g6', ontop, done);
		});
		it('should display tooltip on tile g3', function (done) {
			util.testTileTooltip('g3', ontop, done);
		});
		it('should display tooltip on tile g1', function (done) {
			util.testTileTooltip('g1', ontop, done);
		});
	});

	describe('Goal by player2 to player2', function () {
		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 2,
				score2: 1,
				done: done
			});
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 2-1.Player 1 is currently winning.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 2-1.Player 2 is currently losing.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player1 score', function (done) {
			util.testTooltip('#score-point-player1-2', 'You scored 2 goalsYour opponent scored 1Game ends at 6 goals', done);
		});

		it('should display tooltip on player2 score', function (done) {
			util.testTooltip('#score-point-player2-1', 'You scored 1 goalYour opponent scored 2Game ends at 6 goals', done);
		});
	});

	describe('Goal by player2 to player1', function () {
		it('should make goal by player2 to player1', function (done) {
			util.skipRoundAndValidate(2, 1, {
				owner: 1,
				score1: 2,
				score2: 2,
				done: done
			});
		});
	});

	describe('Finishing game', function () {
		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 3,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 4,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 5,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRound(2, 2, done);
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"]' +
				'[Result "6-2"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 ' +
				'2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-2');
		});

		it('should collapse meta of game 1', function () {
			$('.notation-meta-table1 .notation-expand-collapse-icon').click();
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"]' +
				'[Result "6-2"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 ' +
				'2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-2');
		});

		it('should display correct tooltip for meta collapse icon', function (done) {
			util.testTooltip('.notation-meta-table1 .notation-expand-collapse-icon', 'Expand notation', done);
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(2, done);
		});

		it('should display collapsed icon of notation of game 1', function () {
			expect($('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')).to.be.true;
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 6-2.Player 1 is currently winning.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 6-2.Player 2 is currently losing.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player1 score', function (done) {
			util.testTooltip('#score-point-player1-6', 'You scored 6 goalsYour opponent scored 2Game ends at 6 goals', done);
		});

		it('should display tooltip on player2 score', function (done) {
			util.testTooltip('#score-point-player2-1', 'You scored 2 goalsYour opponent scored 6Game ends at 6 goals', done);
		});

		it('should display tooltip on another game button', function (done) {
			util.testTooltip('#game-won-another-game-button', 'Play another game with same opponent', done);
		});

		it('should display tooltip on new game button', function (done) {
			util.testTooltip('#game-won-new-game-button', 'Start new game', done);
		});

		it('should display tooltip on save game button', function (done) {
			util.testTooltip('#game-won-save-game-button', 'Copy game notation to clipboard', done);
		});

		it('should display tooltip on save game icon', function (done) {
			util.testTooltip('#copy-moves', 'Copy game notation to clipboard', done);
		});
	});

	describe('Starting new game', function () {
		it('should display won window', function (done) {
			$('#game-won-new-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should show welcome window', function (done) {
			wait.appear('#game-select-window', done);
		});

		it('should close welcome window after starting 2P game', function (done) {
			$('#game-select-mode-2p-local').click();
			wait.disappear('#game-select-window', done);
		});

		it('should show enter names dialog', function (done) {
			wait.appear('#names-2p-message', done);
		});

		it('should accept values and start game', function (done) {
			$('#names-2p-submit-btn').click();
			wait.disappear('#names-2p-message', done);
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display correct tooltip for meta collapse icon', function (done) {
			util.testTooltip('.notation-meta-table1 .notation-expand-collapse-icon', 'Collapse notation', done);
		});

		it('should display correct tooltip for move collapse icon', function (done) {
			util.testTooltip('.notation-move-table1 .notation-expand-collapse-icon', 'Collapse notation', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"]\t');
		});

		it('should start valid round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 0-0.Player 1 is neither winning nor losing.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 0-0.Player 2 is neither winning nor losing.It is the turn of Player 1.', done);
		});
	});

	describe('Finishing game', function () {
		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 1,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 2,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 3,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 4,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 5,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRound(2, 2, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]\t' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0');
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 6-0.Player 1 is currently winning.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 6-0.Player 2 is currently losing.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player1 score', function (done) {
			util.testTooltip('#score-point-player1-3', 'You scored 6 goalsYour opponent scored 0Game ends at 6 goals', done);
		});
	});

	describe('Starting another game', function () {
		it('should start another game', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]\t' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0[Game "2"][White "Player 1"][Black "Player 2"]\t');
		});
	});

	describe('Finishing game', function () {
		it('should start new round with player2 owner due to looserStartsAnotherGame=true', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 1,
				score2: 0,
				done: done
			});
		});

		it('should collapse all notations but game2 moves', function () {
			$('.notation-meta-table1 .notation-expand-collapse-icon').click();
			$('.notation-move-table1 .notation-expand-collapse-icon').click();
			$('.notation-meta-table2 .notation-expand-collapse-icon').click();
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]' +
				'\t1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0[Game "2"]' +
				'[White "Player 1"][Black "Player 2"]\t2pg4 1pg4]4+');
		});

		it('should display correct tooltip for meta collapse icon', function (done) {
			util.testTooltip('.notation-meta-table1 .notation-expand-collapse-icon', 'Expand notation', done);
		});

		it('should display correct tooltip for move collapse icon', function (done) {
			util.testTooltip('.notation-move-table1 .notation-expand-collapse-icon', 'Expand notation', done);
		});

		it('should display collapsed icon of notation of game 1', function () {
			if(!$('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game1 meta have wrong collapsed icon');
			if(!$('.notation-move-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game1 move have wrong collapsed icon');
			if(!$('.notation-meta-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game2 meta have wrong collapsed icon');
			if($('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right'))  throw new Error('Game2 move have wrong collapsed icon');

			if($('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game1 meta have wrong additional icon');
			if($('.notation-move-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game1 move have wrong additional icon');
			if($('.notation-meta-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game2 meta have wrong additional icon');
			if(!$('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down'))throw new Error('Game2 move have wrong additional icon');
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(2, done);
		});

		it('should collapse game2 moves', function () {
			$('.notation-move-table2 .notation-expand-collapse-icon').click();
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]' +
				'\t1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0[Game "2"]' +
				'[White "Player 1"][Black "Player 2"]\t2pg4 1pg4]4+');
		});

		it('should display collapsed icon of moves of game 2', function () {
			if(!$('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game2 move have wrong collapsed icon');
			if($('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down'))   throw new Error('Game2 move have wrong additional icon');
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(3, done);
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 2,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 3,
				score2: 0,
				done: done
			});
		});

		it('should display correct notation for collapsed game2 moves', function () {
			if($('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game2 move have wrong collapsed icon');
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]\t' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0[Game "2"]' +
				'[White "Player 1"][Black "Player 2"]\t2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+');
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 4,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 5,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRound(2, 2, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]' +
				'\t1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0[Game "2"]' +
				'[White "Player 1"][Black "Player 2"][Result "6-0"]\t2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 ' +
				'1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0');
		});

		it('should expand all notations', function () {
			$('.move-expand-all').click();

			if($('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game1 meta have wrong collapsed icon');
			if($('.notation-move-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game1 move have wrong collapsed icon');
			if($('.notation-meta-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game2 meta have wrong collapsed icon');
			if($('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game2 move have wrong collapsed icon');

			if(!$('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game1 meta have wrong additional icon');
			if(!$('.notation-move-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game1 move have wrong additional icon');
			if(!$('.notation-meta-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game2 meta have wrong additional icon');
			if(!$('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game2 move have wrong additional icon');
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "6-0"]\t' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0[Game "2"][White "Player 1"][Black "Player 2"]' +
				'[Result "6-0"]\t2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0');
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 6-0.Player 1 won Game 1.Player 1 is currently winning.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 6-0.Player 2 lost Game 1.Player 2 is currently losing.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player1 score', function (done) {
			util.testTooltip('#score-point-player1-6', 'You scored 6 goalsYour opponent scored 0Game ends at 6 goals', done);
		});

		it('should collapse all notations', function () {
			$('.move-expand-all').click();
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(3, done);
		});
	});

	describe('Starting new game', function () {
		it('should display won window', function (done) {
			$('#game-won-new-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should show welcome window', function (done) {
			wait.appear('#game-select-window', done);
		});

		it('should close welcome window after starting 2P game', function (done) {
			$('#game-select-mode-2p-local').click();
			wait.disappear('#game-select-window', done);
		});

		it('should show enter names dialog', function (done) {
			wait.appear('#names-2p-message', done);
		});

		it('should accept values and start game', function (done) {
			$('#names-2p-submit-btn').click();
			wait.disappear('#names-2p-message', done);
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"]\t');
		});
	});

	describe('Finishing game', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 1,
				score2: 1,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 2,
				score2: 1,
				done: done
			});
		});

		it('should make goal by player2 to player1', function (done) {
			util.skipRoundAndValidate(2, 1, {
				owner: 1,
				score1: 2,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 2,
				score2: 3,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 2,
				score2: 4,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 2,
				score2: 5,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRound(1, 1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"]' +
				'[Result "2-6"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6');
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 2-6.Player 1 is currently losing.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 2-6.Player 2 is currently winning.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player1 score', function (done) {
			util.testTooltip('#score-point-player1-2', 'You scored 2 goalsYour opponent scored 6Game ends at 6 goals', done);
		});

		it('should display tooltip on player2 score', function (done) {
			util.testTooltip('#score-point-player2-5', 'You scored 6 goalsYour opponent scored 2Game ends at 6 goals', done);
		});

		it('should collapse all notations', function () {
			$('.move-expand-all').click();
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(3, done);
		});
	});

	describe('Starting another game', function () {
		it('should display won window', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(3, done);
		});

		it('should expand all notations', function () {
			$('.move-expand-all').click();
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"]' +
				'[Result "2-6"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6[Game "2"][White "Player 1"][Black "Player 2"]\t');
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 0-0.Player 1 lost Game 1.Player 1 is neither winning nor losing.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 0-0.Player 2 won Game 1.Player 2 is neither winning nor losing.It is the turn of Player 1.', done);
		});
	});

	describe('Finishing game', function () {
		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 1,
				score2: 1,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 2,
				score2: 1,
				done: done
			});
		});

		it('should make goal by player2 to player1', function (done) {
			util.skipRoundAndValidate(2, 1, {
				owner: 1,
				score1: 2,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 2,
				score2: 3,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 2,
				score2: 4,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 2,
				score2: 5,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRound(1, 1, done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "2-6"]\t' +
				'1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 ' +
				'2pf5[5++ 2-6[Game "2"][White "Player 1"][Black "Player 2"][Result "2-6"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 ' +
				'2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6');
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 2-6.Player 1 lost Game 1.Player 1 is currently losing.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 2-6.Player 2 won Game 1.Player 2 is currently winning.It is the turn of Player 1.', done);
		});

		it('should display tooltip on player1 score', function (done) {
			util.testTooltip('#score-point-player1-2', 'You scored 2 goalsYour opponent scored 6Game ends at 6 goals', done);
		});

		it('should display tooltip on player2 score', function (done) {
			util.testTooltip('#score-point-player2-5', 'You scored 6 goalsYour opponent scored 2Game ends at 6 goals', done);
		});
	});

	describe('Testing notation tooltips', function () {
		it('should display tooltip game 1 move 1', function (done) {
			util.testNotationTooltip(1, 1, 1, 'Player 1 placed puck at f5', done);
		});

		it('should display tooltip game 1 move 2', function (done) {
			util.testNotationTooltip(1, 2, 1, 'Player 2 moved puck from f5 to [5 and scored', done);
		});

		it('should display tooltip game 1 move 3', function (done) {
			util.testNotationTooltip(1, 3, 1, 'Player 1 placed puck at f5', done);
		});

		it('should display tooltip game 1 move 4', function (done) {
			util.testNotationTooltip(1, 4, 1, 'Player 2 moved puck from f5 to j1 to ]4 and scored', done);
		});

		it('should display tooltip game 1 move 5', function (done) {
			util.testNotationTooltip(1, 5, 1, 'Player 2 placed puck at g4', done);
		});

		it('should display tooltip game 1 move 6', function (done) {
			util.testNotationTooltip(1, 6, 1, 'Player 1 moved puck from g4 to ]4 and scored', done);
		});

		it('should display tooltip game 1 move 7', function (done) {
			util.testNotationTooltip(1, 7, 1, 'Player 2 placed puck at g4', done);
		});

		it('should display tooltip game 1 move 8', function (done) {
			util.testNotationTooltip(1, 8, 1, 'Player 1 moved puck from g4 to c8 to [5 and scored', done);
		});

		it('should display tooltip game 1 move 9', function (done) {
			util.testNotationTooltip(1, 9, 1, 'Player 1 placed puck at f5', done);
		});

		it('should display tooltip game 1 move 10', function (done) {
			util.testNotationTooltip(1, 10, 1, 'Player 2 moved puck from f5 to [5 and scored', done);
		});

		it('should display tooltip game 1 move 11', function (done) {
			util.testNotationTooltip(1, 11, 1, 'Player 1 placed puck at f5', done);
		});

		it('should display tooltip game 1 move 12', function (done) {
			util.testNotationTooltip(1, 12, 1, 'Player 2 moved puck from f5 to [5 and scored', done);
		});

		it('should display tooltip game 1 move 13', function (done) {
			util.testNotationTooltip(1, 13, 1, 'Player 1 placed puck at f5', done);
		});

		it('should display tooltip game 1 move 14', function (done) {
			util.testNotationTooltip(1, 14, 1, 'Player 2 moved puck from f5 to [5 and scored', done);
		});

		it('should display tooltip game 1 move 15', function (done) {
			util.testNotationTooltip(1, 15, 1, 'Player 1 placed puck at f5', done);
		});

		it('should display tooltip game 1 move 16', function (done) {
			util.testNotationTooltip(1, 16, 1, 'Player 2 moved puck from f5 to [5 and won the game', done);
		});

		it('should display tooltip game 1 move gamewon', function (done) {
			util.testNotationTooltip(1, 'gamewon', 1, 'Game finished with score 2-6', done);
		});

		it('should collapse game2 moves', function () {
			$('.notation-move-table2 .notation-expand-collapse-icon').click();
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "2-6"]\t' +
				'1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 ' +
				'2pf5[5++ 2-6[Game "2"][White "Player 1"][Black "Player 2"][Result "2-6"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ ' +
				'2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6');
		});

		it('should display correct collapsed icons', function () {
			if($('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game1 meta have wrong collapsed icon');
			if($('.notation-move-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game1 move have wrong collapsed icon');
			if($('.notation-meta-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right')) throw new Error('Game2 meta have wrong collapsed icon');
			if(!$('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-right'))  throw new Error('Game2 move have wrong collapsed icon');

			if(!$('.notation-meta-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game1 meta have wrong additional icon');
			if(!$('.notation-move-table1 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game1 move have wrong additional icon');
			if(!$('.notation-meta-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down')) throw new Error('Game2 meta have wrong additional icon');
			if($('.notation-move-table2 .notation-expand-collapse-icon').hasClass('fa-chevron-down'))throw new Error('Game2 move have wrong additional icon');
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(2, done);
		});

	});

	describe('Starting another game', function () {
		it('should display won window', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(2, done);
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 1,
				score2: 0,
				done: done
			});
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Player 2"][Result "2-6"]\t' +
				'1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 ' +
				'2pf5[5++ 2-6[Game "2"][White "Player 1"][Black "Player 2"][Result "2-6"]\t1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 ' +
				'2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6[Game "3"][White "Player 1"][Black "Player 2"]\t1pf5 2pf5j1]4+');
		});

		it('should display tooltip on player1 name', function (done) {
			util.testTooltip('.player-1-name-text', 'The score is 1-0.Player 1 lost Game 2.Player 1 is currently winning.It is the turn of Player 2.', done);
		});

		it('should display tooltip on player2 name', function (done) {
			util.testTooltip('.player-2-name-text', 'The score is 1-0.Player 2 won Game 2.Player 2 is currently losing.It is the turn of Player 2.', done);
		});

		it('should expand all notations', function () {
			$('.move-expand-all').click();
		});

		it('should display correct expand all icon', function (done) {
			util.validateCollapseAllNotationsIconState(1, done);
		});
	});

	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});

});
