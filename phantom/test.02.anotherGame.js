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

	describe('Goal by player2 to player1', function () {
		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		it('should start new round and pass turn to player1', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});
	});

	describe('Goal by player2 to player2', function () {
		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('g4');
			simulate.clickTile(']4');
			wait.finishPuckMove(done);
		});

		it('should start new round and pass turn to player2', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 1,
				score2: 1,
				done: done
			});
		});
	});

	describe('Goal by player1 to player2', function () {
		it('should place puck at g4', function () {
			simulate.placePuck('g4');
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('h3');
			simulate.clickTile(']4');
			wait.finishPuckMove(done);
		});

		it('should start new round and pass turn to player2', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 2,
				score2: 1,
				done: done
			});
		});
	});

	describe('Goal by player1 to player1', function () {
		it('should place puck at g4', function () {
			simulate.placePuck('g4');
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('f5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		it('should start new round and pass turn to player2', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 2,
				done: done
			});
		});
	});

	describe('Finishing game', function () {
		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 3,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 4,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 5,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] ' +
				'[White "Player 1"] [Black "Player 2"] [Result "2-6"]  1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2pg4 ' +
				'1pg4j1]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 2-6 ');
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

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 2,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 3,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 4,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 5,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] ' +
				'[White "Player 1"] [Black "Player 2"] [Result "0-6"]  1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 ' +
				'2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 0-6 ');
		});
	});

	describe('Starting another game', function () {
		it('should display won window', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] [Result "0-6"]  ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 0-6  [Game "2"]  ');
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

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 2,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 3,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 4,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 5,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] [Result "0-6"]  ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 0-6  [Game "2"] ' +
				'[Result "0-6"]  1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 0-6 ');
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

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 1,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 2,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 3,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 4,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 5,
				done: done
			});
		});

		it('should place puck at f5', function () {
			simulate.placePuck('f5');
		});
		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] ' +
				'[White "Player 1"] [Black "Player 2"] [Result "0-6"]  1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 ' +
				'2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 0-6 ');
		});
	});

	describe('Starting another game', function () {
		it('should display won window', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "Player 1"] [Black "Player 2"] [Result "0-6"]  ' +
				'1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5++ 0-6  [Game "2"]  ');
		});
	});


	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});

});
