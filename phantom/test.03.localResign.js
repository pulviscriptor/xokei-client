describe('Testing local resign and nicknames validation', function () {
	this.timeout(5000);

	describe('Go to P2 local mode', function () {
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

		it('should hide resign buttons', function () {
			expect($('.resign-game').is(':visible')).to.equal(false);
		});
	});

	describe('Player1 space symbol', function () {
		it('should not accept values and start game', function () {
			$('#names-2p-input-p1').val(' ');
			$('#names-2p-submit-btn').click();
			expect($('#names-2p-message').is(':visible')).to.equal(true);
		});

		it('should show Player1 error', function () {
			expect($('#names-2p-error-p1').text()).to.be.equal('Enter non-empty name');
		});

		it('should not show Player2 error', function () {
			expect($('#names-2p-error-p2').text().trim()).to.be.equal('');
		});

		it('should hide resign buttons', function () {
			expect($('.resign-game').is(':visible')).to.equal(false);
		});
	});

	describe('Player2 tab symbol', function () {
		it('should not accept values and start game', function () {
			$('#names-2p-input-p1').val('');
			$('#names-2p-input-p2').val('	');
			$('#names-2p-submit-btn').click();
			expect($('#names-2p-message').is(':visible')).to.equal(true);
		});

		it('should show Player2 error', function () {
			expect($('#names-2p-error-p2').text()).to.be.equal('Enter non-empty name');
		});
	});

	describe('Error messages disappearing', function () {
		it('should wait until errors disappears', function (done) {
			wait.change($('#names-2p-error').text().trim() == '', function () {
				return $('#names-2p-error').text().trim() == '';
			}, done);
		});
	});

	describe('Player2 tab/space/\\r/\\n symbols', function () {
		it('should not accept values and start game', function () {
			$('#names-2p-input-p1').val('');
			$('#names-2p-input-p2').val('	 \r\n');
			$('#names-2p-submit-btn').click();
			expect($('#names-2p-message').is(':visible')).to.equal(true);
		});

		it('should show Player2 error', function () {
			expect($('#names-2p-error-p2').text()).to.be.equal('Enter non-empty name');
		});
	});

	describe('Accept valid names', function () {
		it('should accept values and start game', function () {
			$('#names-2p-input-p1').val('');
			$('#names-2p-input-p2').val('Mega Player');
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

		it('should hide resign buttons', function () {
			expect($('.resign-game').is(':visible')).to.equal(false);
		});
	});

	describe('Place puck and resign', function () {
		it('should place puck at player1 territory', function () {
			simulate.placePuck('d5');
		});

		it('should hide p1 resign button', function () {
			expect($('.resign-game-player1').is(':visible')).to.equal(false);
		});

		it('should show p2 resign button', function () {
			expect($('.resign-game-player2').is(':visible')).to.equal(true);
		});

		it('should hide game regisned message', function () {
			expect($('#game-won-resign-message').is(':visible')).to.equal(false);
		});

		it('should hide game won message', function () {
			expect($('#game-won-win-message').is(':visible')).to.equal(false);
		});

		it('should resign game', function (done) {
			$('.resign-game-player2').click();
			wait.appear('#game-won-window', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Mega Player"][Result "6-0"]\t1pd5 2r 6-0');
		});
	});

	describe('Start another game and resign', function () {
		it('should start another game', function (done) {
			$("#game-won-another-game-button").click();
			wait.disappear("#game-won-another-game-button", done);
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should place puck at player2 territory', function () {
			simulate.placePuck('g5');
		});

		it('should hide p1 resign button', function () {
			expect($('.resign-game-player1').is(':visible')).to.equal(true);
		});

		it('should show p2 resign button', function () {
			expect($('.resign-game-player2').is(':visible')).to.equal(false);
		});

		it('should resign game', function (done) {
			$('.resign-game-player2').click();
			wait.appear('#game-won-window', done);
		});

		it('should show game regisned message', function () {
			expect($('#game-won-resign-message').is(':visible')).to.equal(true);
		});

		it('should hide game won message', function () {
			expect($('#game-won-win-message').is(':visible')).to.equal(false);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Mega Player"][Result "6-0"]\t1pd5 2r 6-0[Game "2"][White "Player 1"][Black "Mega Player"][Result "0-6"]\t2pg5 1r 0-6');
		});
	});

	describe('Start new game, play and resign', function () {
		it('should click new game', function (done) {
			$("#game-won-new-game-button").click();
			wait.appear("#game-select-window", done);
		});

		it('should click 2p local game', function (done) {
			$("#game-select-mode-2p-local").click();
			wait.appear("#names-2p-window", done);
		});

		it('should accept values and start game', function () {
			$('#names-2p-input-p1').val('');
			$('#names-2p-input-p2').val('Mega Player');
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

		it('should place puck at player1 territory', function () {
			simulate.placePuck('f5');
		});

		it('should hide p2 resign button', function () {
			expect($('.resign-game-player2').is(':visible')).to.equal(true);
		});

		it('should show p1 resign button', function () {
			expect($('.resign-game-player1').is(':visible')).to.equal(false);
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('e5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
		});

		/*it('should show message container', function (done) {
			wait.appear('.message-container', done);
		});*/

		it('should show message with place puck message', function (done) {
			wait.message("Player 1:Place the puck on your side (left)", done);
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 0,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player1 to player1', function (done) {
			util.skipRoundAndValidate(1, 1, {
				owner: 1,
				score1: 0,
				score2: 3,
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 1,
				score2: 3,
				done: done
			});
		});

		it('should hide p1 resign button', function () {
			expect($('.resign-game-player1').is(':visible')).to.equal(false);
		});

		it('should show p2 resign button', function () {
			expect($('.resign-game-player2').is(':visible')).to.equal(true);
		});

		it('should resign game', function (done) {
			$('.resign-game-player2').click();
			wait.appear('#game-won-window', done);
		});

		it('should hide p2 resign button', function () {
			expect($('.resign-game-player2').is(':visible')).to.equal(false);
		});

		it('should hide p1 resign button', function () {
			expect($('.resign-game-player1').is(':visible')).to.equal(false);
		});

		it('should show game regisned message', function () {
			expect($('#game-won-resign-message').is(':visible')).to.equal(true);
		});

		it('should hide game won message', function () {
			expect($('#game-won-win-message').is(':visible')).to.equal(false);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "Player 1"][Black "Mega Player"][Result "6-3"]\t1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5[5+ 1pf5 2pf5j1]4+ 2r 6-3');
		});
	});


	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});
});
