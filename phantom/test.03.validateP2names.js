describe('Testing nicknames validation', function () {
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
	});

	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});
});
