var testValues = {
	player1Name: 'ᖫ✧ΔWΞSƟΜΞ✧ᖭ',
	player2Name: '<pro>ⓅⓁⒶⓎⒺⓇ⊕🔫'
};

// set game config for this test
window.game.settings.game.looserStartsAnotherGame = false;

describe('Testing game', function () {
	this.timeout(5000);

	describe('Basics', function () {
		it('should show welcome window', function () {
			expect($('#game-select-window').is(':visible')).to.equal(true);
		});

		it('should drag welcome window screen', function () {
			var $el = $('#game-select-welcome-message');
			var offset = $el.offset();
			$el.simulate( "mouseover" ).simulate( "drag", { dx: 200, dy: -100 } );
			var newOffset = $el.offset();

			expect(newOffset.top == offset.top || newOffset.left == offset.left).to.equal(false);
		});

		it('should close welcome window after starting 2P game', function () {
			$('#game-select-mode-2p-local').click();
			expect($('#game-select-window').is(':visible')).to.equal(false);
		});

		it('should show enter names dialog', function () {
			expect($('#names-2p-message').is(':visible')).to.equal(true);
		});

		it('should accept values and start game', function () {
			$('#names-2p-input-p1').val(testValues.player1Name);
			$('#names-2p-input-p2').val(testValues.player2Name);
			$('#names-2p-submit-btn').click();
			expect($('#names-2p-message').is(':visible')).to.equal(false);
		});

		it('should show message container', function (done) {
			wait.appear('.message-container', done);
		});

		it('should show message with place puck message', function () {
			expect($('.message-container .message').text()).to.contain('puck');
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should not be able to place puck and player2 territory', function () {
			simulate.clickTile('h8');
			expect($('.puck-actor').length).to.equal(0);
		});

		it('should place puck at player1 territory', function () {
			simulate.placePuck('d5');
		});

		it('should find puck at d5', function () {
			expect(util.tile('d5').actor).to.be.instanceOf(game.puck);
		});

		it('should pass turn to player2', function () {
			expect(game.board.settings.owner).to.be.equal('player2');
		});

		it('should remove highlight from player1 name', function () {
			expect($('.player-1-name-text').hasClass('turn-owner')).to.be.false;
		});

		it('should add highlight to player2 name', function () {
			expect($('.player-2-name-text').hasClass('turn-owner')).to.be.true;
		});

		it('should show message when player2 tries to click puck', function (done) {
			simulate.clickPuck();
			wait.appear('.message-container', done);
		});

		it('should show message with "must be near puck" text', function () {
			expect($('.message-container .message').text()).to.contain('near puck');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should show message "Wait for your turn" if we try to click player1 actor(0)', function (done) {
			simulate.clickActor(0);
			wait.message('Wait for your turn', done);
		});

		it('should not create any valid moves', function () {
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor(8) and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click actor(8) again', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor(8) and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click puck', function () {
			simulate.clickPuck();
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should show message with "must be near puck" text', function (done) {
			wait.message('must be near puck', done);
		});

		it('should select actor(8) and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click empty tile a7', function () {
			simulate.clickTile('a7');
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should move selected actor(9) to h2', function (done) {
			Actor(9).moveTo('h2', done);
		});

		it('should select actor and display valid moves', function () {
			simulate.clickActor(9);
			expect($('.valid-move-circle').length).to.be.equal(7);
			simulate.clickActor(9);
		});

		it('should move actor(9) to i3', function (done) {
			Actor(9).moveTo('i3', done);
		});

		it('should pass turn to player1', function () {
			expect(game.board.settings.owner).to.be.equal('player1');
		});

		it('should select actor(2) and display valid moves', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(7);
			simulate.clickActor(2);
		});

		it('should move actor(2) to e5', function (done) {
			Actor(2).moveTo('e5', done);
		});

		it('should display arrows for puck when we click it', function () {
			simulate.clickPuck();
			expect($('.kick-direction-arrow').length).to.be.equal(5);
		});

		it('should display valid moves when we click on arrow at c4', function () {
			simulate.clickTile('c4');
			expect($('.valid-puck-move-circle').length).to.be.equal(8);
		});

		it('should kick puck to f5', function (done) {
			simulate.clickTile('f5');
			wait.finishPuckMove(done);
		});

		it('should make goal', function () {
			simulate.clickPuck();
			simulate.clickTile('g4');
			simulate.clickTile(']4');
		});


	});
	describe('Blocking puck', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 1,
				score2: 0,
				done: done
			});
		});

		it('should place puck at h4', function () {
			simulate.placePuck('h4');
		});

		it('should move actor(3) to g4', function (done) {
			Actor(3).moveTo('g4', done);
		});

		it('should move actor(2) to g5', function (done) {
			Actor(2).moveTo('g5', done);
		});

		it('should move actor(9) to h2', function (done) {
			Actor(9).moveTo('h2', done);
		});

		it('should move actor(9) to i3', function (done) {
			Actor(9).moveTo('i3', done);
		});

		it('should move actor(4) to g2', function (done) {
			Actor(4).moveTo('g2', done);
		});

		it('should move actor(4) to h3', function (done) {
			Actor(4).moveTo('h3', done);
		});

		it('should move actor(7) to h6', function (done) {
			Actor(7).moveTo('h6', done);
		});

		it('should move actor(7) to i5', function (done) {
			Actor(7).moveTo('i5', done);
		});

		it('should move actor(1) to g7', function (done) {
			Actor(1).moveTo('g7', done);
		});

		it('should move actor(1) to h6', function (done) {
			Actor(1).moveTo('h6', done);
		});

		it('should move actor(5) to l5', function (done) {
			Actor(5).moveTo('l5', done);
		});

		it('should move actor(5) to k5', function (done) {
			Actor(5).moveTo('k5', done);
		});

		it('should move actor(1) to h5', function (done) {
			Actor(1).moveTo('h5', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(5) to j5', function (done) {
			Actor(5).moveTo('j5', done);
		});

		it('should move actor(5) to i4', function (done) {
			Actor(5).moveTo('i4', done);
		});

		it('should not select puck and display message that puck is blocked by players', function (done) {
			simulate.clickPuck();
			wait.message('Puck is blocked', done);
		});

		it('should move actor(3) to f3', function (done) {
			Actor(3).moveTo('f3', done);
		});

		it('should move actor(3) to e2', function (done) {
			Actor(3).moveTo('e2', done);
		});

		it('should move actor(5) to j3', function (done) {
			Actor(5).moveTo('j3', done);
		});

		it('should make goal', function () {
			simulate.clickPuck();
			simulate.clickTile('i4');
			simulate.clickTile(']4');
		});
	});

	describe('Goal in 1 move', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 2,
				score2: 0,
				done: done
			});
		});

		it('should place puck and display valid moves', function () {
			simulate.placePuck('g4');
			simulate.clickPuck();
			simulate.clickTile('h3');
			expect($('.valid-puck-move-circle').length).to.be.equal(6);
		});

		it('should make goal to player1 side', function () {
			simulate.clickTile(']4');
		});
	});

	describe('Bounce of corner of goal', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 3,
				score2: 0,
				done: done
			});
		});

		it('should place puck at g5 and not bounce from corner of goal zone', function () {
			simulate.placePuck('g5');
			simulate.clickPuck();
			simulate.clickTile('f4');
			expect($('.valid-puck-move-circle').length).to.be.equal(6);
		});

		it('should make another goal into player2 zone', function (done) {
			simulate.clickTile('f4');
			wait.finishPuckMove(function () {
				simulate.clickPuck();
				simulate.clickTile('g4');
				simulate.clickTile(']4');
				wait.finishPuckMove(done);
			});
		});
	});
	describe('Move puck without displaying valid points if there is only 1 move available', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 4,
				score2: 0,
				done: done
			});
		});

		it('should place puck at g5', function () {
			simulate.placePuck('g5');
		});

		it('should kick puck to g4 without showing valid moves dots', function (done) {
			simulate.clickPuck();
			simulate.clickTile('g4');
			wait.finishPuckMove(done);
		});

		it('should make goal to ]4', function () {
			simulate.clickPuck();
			simulate.clickTile('h4');
			simulate.clickTile(']4');
		});
	});
	describe('Goal from 1 tile away', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 5,
				score2: 0,
				done: done
			});
		});

		it('should place puck at j4', function () {
			simulate.placePuck('j4');
		});

		it('should move actor(2) to g5', function (done) {
			Actor(2).moveTo('g5', done);
		});

		it('should move actor(2) to h4', function (done) {
			Actor(2).moveTo('h4', done);
		});

		it('should move actor(7) to g7', function (done) {
			Actor(7).moveTo('g7', done);
		});

		it('should move actor(7) to h7', function (done) {
			Actor(7).moveTo('h7', done);
		});

		it('should move actor(2) to i4', function (done) {
			Actor(2).moveTo('i4', done);
		});

		it('should move puck to l4', function (done) {
			simulate.clickPuck();
			simulate.clickTile('k4');
			simulate.clickTile('l4');
			wait.finishPuckMove(done);
		});

		it('should move actor(7) to h6', function (done) {
			Actor(7).moveTo('h6', done);
		});

		it('should move actor(7) to h5', function (done) {
			Actor(7).moveTo('h5', done);
		});

		it('should move actor(2) to j4', function (done) {
			Actor(2).moveTo('j4', done);
		});

		it('should move actor(2) to k4', function (done) {
			Actor(2).moveTo('k4', done);
		});

		it('should move actor(7) to h6', function (done) {
			Actor(7).moveTo('h4', done);
		});

		it('should move actor(7) to h5', function (done) {
			Actor(7).moveTo('h3', done);
		});

		it('should make goal without showing valid moves dots', function (done) {
			simulate.clickPuck();
			simulate.clickTile(']4');
			wait.finishPuckMove(done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "ᖫ✧ΔWΞSƟΜΞ✧ᖭ"] ' +
				'[Black "<pro>ⓅⓁⒶⓎⒺⓇ⊕🔫"] [Result "6-0"]  1pd5 2g1h2i3 1f6e5 1pd5a2b1f5 ' +
				'2pf5j1]4+ 2ph4 1f3g4 1f6g5 2g1h2i3 1f1g2h3 2g6h6i5 1f8g7h6 2]5l5k5 1h6h5 1[4[5 ' +
				'2k5j5i4 1g4f3e2 2i4j3 2ph4]4+ 2pg4 1pg4j1]4+ 2pg5 1pg5f4]4 2pg5 1pg5g4]4 2pj4 ' +
				'1f6g5h4 2g6g7h7 1h4i4 1pj4l4 2h7h6h5 1i4j4k4 2h5h4h3 1pl4]4++ 6-0 ');
		});
	});

	describe('Starting another game', function () {
		it('should display won window', function (done) {
			$('#game-won-another-game-button').click();
			wait.disappear('#game-won-window', done);
		});

		it('should display place puck message', function (done) {
			wait.appear('.message-container', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "ᖫ✧ΔWΞSƟΜΞ✧ᖭ"] ' +
				'[Black "<pro>ⓅⓁⒶⓎⒺⓇ⊕🔫"] [Result "6-0"]  1pd5 2g1h2i3 1f6e5 1pd5a2b1f5 ' +
				'2pf5j1]4+ 2ph4 1f3g4 1f6g5 2g1h2i3 1f1g2h3 2g6h6i5 1f8g7h6 2]5l5k5 1h6h5 ' +
				'1[4[5 2k5j5i4 1g4f3e2 2i4j3 2ph4]4+ 2pg4 1pg4j1]4+ 2pg5 1pg5f4]4 2pg5 1pg5g4]4 ' +
				'2pj4 1f6g5h4 2g6g7h7 1h4i4 1pj4l4 2h7h6h5 1i4j4k4 2h5h4h3 1pl4]4++ 6-0  [Game "2"]  ');
		});
	});

	describe('Skip round', function () {
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
	});

	describe('Shoot puck backwards from wall', function () {
		it('should place puck at i8', function () {
			simulate.placePuck('i8');
		});

		it('should move actor(1) to g7', function (done) {
			Actor(1).moveTo('g7', done);
		});

		it('should move actor(1) to h7', function (done) {
			Actor(1).moveTo('h7', done);
		});


		it('should move actor(6) to f8', function (done) {
			Actor(6).moveTo('f8', done);
		});

		it('should move actor(6) to e8', function (done) {
			Actor(6).moveTo('e8', done);
		});

		it('should move actor(1) to i7', function (done) {
			Actor(1).moveTo('i7', done);
		});

		it('should make goal shooting puck backwards', function () {
			simulate.clickPuck();
			simulate.clickTile('j7');
			simulate.clickTile(']4');
		});
	});
	describe('Players blocking goal zone', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 2,
				score1: 2,
				score2: 0,
				done: done
			});
		});

		it('should place puck at j5', function () {
			simulate.placePuck('j5');
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(6) to h7', function (done) {
			Actor(6).moveTo('h7', done);
		});

		it('should move actor(6) to i6', function (done) {
			Actor(6).moveTo('i6', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(6) to j6', function (done) {
			Actor(6).moveTo('j6', done);
		});

		it('should move actor(6) to k6', function (done) {
			Actor(6).moveTo('k6', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(6) to l5', function (done) {
			Actor(6).moveTo('l5', done);
		});

		it('should move actor(7) to h6', function (done) {
			Actor(7).moveTo('h6', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(7) to i5', function (done) {
			Actor(7).moveTo('i5', done);
		});

		it('should move actor(7) to j4', function (done) {
			Actor(7).moveTo('j4', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(7) to k4', function (done) {
			Actor(7).moveTo('k4', done);
		});

		it('should move actor(7) to l4', function (done) {
			Actor(7).moveTo('l4', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(8) to h3', function (done) {
			Actor(8).moveTo('h3', done);
		});

		it('should move actor(8) to i3', function (done) {
			Actor(8).moveTo('i3', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should move actor(8) to j3', function (done) {
			Actor(8).moveTo('j3', done);
		});

		it('should not allow actor(8) to move into goal zone', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(6);
		});

		it('should not allow actor(7) to move into goal zone', function () {
			simulate.clickActor(7);
			expect($('.valid-move-circle').length).to.be.equal(4);
		});

		it('should move actor(6) to k5', function (done) {
			Actor(6).moveTo('k5', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});

		it('should make goal', function () {
			simulate.clickPuck();
			simulate.clickTile('i5');
			simulate.clickTile('[5');
		});
	});
	describe('Infinite puck bouncing', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 1,
				done: done
			});
		});

		it('should place puck at e5', function () {
			simulate.placePuck('e5');
		});

		it('should move actor(9) to g2', function (done) {
			Actor(9).moveTo('g2', done);
		});

		it('should move actor(5) to ]4', function (done) {
			Actor(5).moveTo(']4', done);
		});

		it('should display valid moving points', function () {
			simulate.clickPuck();
			simulate.clickTile('d6');
			expect($('.valid-puck-move-circle').length).to.be.equal(20);
		});

		it('should make goal', function () {
			simulate.clickPuck();
			simulate.clickTile('d5');
			simulate.clickTile('[5');
			//wait.message(testValues.player2Name + ':Place the puck on your side (right)', done);
		});
	});
	describe('Skip game to 5:6', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 3,
				score2: 2,
				done: done
			});
		});

		it('should make goal by player2 to player1', function (done) {
			util.skipRoundAndValidate(2, 1, {
				owner: 1,
				score1: 3,
				score2: 3,
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipRoundAndValidate(1, 2, {
				owner: 2,
				score1: 4,
				score2: 3,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRoundAndValidate(2, 2, {
				owner: 2,
				score1: 5,
				score2: 3,
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipRound(2, 2, done);
		});
	});
	describe('Starting new game', function () {
		it('should show game won message', function (done) {
			wait.appear('#game-won-win-message', done);
		});

		it('should drag won window', function () {
			var $el = $('#game-won-window');
			var offset = $el.offset();
			$el.simulate( "mouseover" ).simulate( "drag", { dx: 200, dy: -100 } );
			var newOffset = $el.offset();

			expect(newOffset.top == offset.top || newOffset.left == offset.left).to.equal(false);
		});

		it('should say Player 1 won the game', function () {
			expect($('#game-won-winner-name').text()).to.be.equal(testValues.player1Name);
		});

		it('should say score is 6:3', function () {
			expect($('#game-won-scores').text()).to.be.equal('6:3');
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "ᖫ✧ΔWΞSƟΜΞ✧ᖭ"] [Black "<pro>ⓅⓁⒶⓎⒺⓇ⊕🔫"] ' +
				'[Result "6-0"]  1pd5 2g1h2i3 1f6e5 1pd5a2b1f5 2pf5j1]4+ 2ph4 1f3g4 1f6g5 2g1h2i3 1f1g2h3 2g6h6i5 ' +
				'1f8g7h6 2]5l5k5 1h6h5 1[4[5 2k5j5i4 1g4f3e2 2i4j3 2ph4]4+ 2pg4 1pg4j1]4+ 2pg5 1pg5f4]4 2pg5 1pg5g4]4 ' +
				'2pj4 1f6g5h4 2g6g7h7 1h4i4 1pj4l4 2h7h6h5 1i4j4k4 2h5h4h3 1pl4]4++ 6-0  [Game "2"] [Result "6-3"]  ' +
				'1pf5 2pf5j1]4+ 2pi8 1f8g7h7 2g8f8e8 1h7i7 1pi8]4+ 2pj5 1[4[5[4 2g8h7i6 1[4[5[4 2i6j6k6 1[4[5[4 2k6l5 ' +
				'2g6h6 1[4[5[4 2h6i5j4 1[4[5[4 2j4k4l4 1[4[5[4 2g3h3i3 1[4[5[4 2i3j3 2l5k5 1[4[5[4 2pj5[5+ 1pe5 2g1g2 ' +
				'2]5]4 1pe5[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4c8[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-3 ');
		});

		it('should start new 2P game', function () {
			$('#game-won-new-game-button').click();
			expect($('#game-won-window').is(':visible')).to.equal(false);
		});
	});
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

		it('should not be able to place puck and player2 territory', function () {
			simulate.clickTile('h8');
			expect($('.puck-actor').length).to.equal(0);
		});

		it('should place puck at player1 territory', function () {
			simulate.placePuck('d5');
		});

		it('should find puck at d5', function () {
			expect(util.tile('d5').actor).to.be.instanceOf(game.puck);
		});

		it('should pass turn to player2', function () {
			expect(game.board.settings.owner).to.be.equal('player2');
		});

		it('should remove highlight from player1 name', function () {
			expect($('.player-1-name-text').hasClass('turn-owner')).to.be.false;
		});

		it('should highlight player2 name', function () {
			expect($('.player-2-name-text').hasClass('turn-owner')).to.be.true;
		});

		it('should show message when player2 tries to click puck', function (done) {
			simulate.clickPuck();
			wait.appear('.message-container', done);
		});

		it('should show message with "must be near puck" text', function () {
			expect($('.message-container .message').text()).to.contain('near puck');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should show message "Wait for your turn" if we try to click player1 actor(0)', function (done) {
			simulate.clickActor(0);
			wait.message('Wait for your turn', done);
		});

		it('should not create any valid moves', function () {
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor(8) and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click actor(8) again', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor(8) and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click puck', function () {
			simulate.clickPuck();
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should show message with "must be near puck" text', function (done) {
			wait.message('must be near puck', done);
		});

		it('should select actor(8) and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click empty tile a7', function () {
			simulate.clickTile('a7');
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should move selected actor(9) to h2', function (done) {
			Actor(9).moveTo('h2', done);
		});

		it('should select actor and display valid moves', function () {
			simulate.clickActor(9);
			expect($('.valid-move-circle').length).to.be.equal(7);
			simulate.clickActor(9);
		});

		it('should move actor(9) to i3', function (done) {
			Actor(9).moveTo('i3', done);
		});

		it('should pass turn to player1', function () {
			expect(game.board.settings.owner).to.be.equal('player1');
		});

		it('should select actor(2) and display valid moves', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(7);
			simulate.clickActor(2);
		});

		it('should move actor(2) to e5', function (done) {
			Actor(2).moveTo('e5', done);
		});

		it('should display arrows for puck when we click it', function () {
			simulate.clickPuck();
			expect($('.kick-direction-arrow').length).to.be.equal(5);
		});

		it('should display valid moves when we click on arrow at c5', function () {
			simulate.clickTile('c5');
			expect($('.valid-puck-move-circle').length).to.be.equal(4);
		});

		it('make goal to [5 and start new round', function () {
			simulate.clickTile('[5');
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"] [White "ᖫ✧ΔWΞSƟΜΞ✧ᖭ"] [Black "<pro>ⓅⓁⒶⓎⒺⓇ⊕🔫"]  1pd5 2g1h2i3 ');
		});
	});
	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});

});
