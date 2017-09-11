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

		it('should not be able to place puck at player2 territory', function () {
			simulate.clickTile('h8');
			expect($('.puck-actor').length).to.equal(0);
		});

		it('should not be able to place puck and player2 territory', function () {
			simulate.clickTile('h8');
			expect($('.puck-actor').length).to.equal(0);
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

	describe('Goal by player2 to player2', function () {
		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 2,
				score2: 1,
				done: done
			});
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

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] ' +
				'[Result "6-2"]  1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5j1]4+ ' +
				'2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-2 ');
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

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"]  ');
		});

		it('should start valid round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
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
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] [Result "6-0"]  ' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0 ');
		});
	});

	describe('Starting another game', function () {
		it('should start another game', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] [Result "6-0"]  ' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0  [Game "2"]  ');
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
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] [Result "6-0"]  ' +
				'1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0  [Game "2"] ' +
				'[Result "6-0"]  2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-0 ');
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

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"]  ');
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
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] ' +
				'[Result "2-6"]  1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6 ');
		});
	});

	describe('Starting another game', function () {
		it('should display won window', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] ' +
				'[Result "2-6"]  1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6  [Game "2"]  ');
		});
	});


	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});

});
