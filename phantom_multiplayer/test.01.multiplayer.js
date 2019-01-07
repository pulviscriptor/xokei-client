describe('Testing multiplayer game', function () {
	this.timeout(5000);

	// set game config for this test
	window.game.settings.game.looserStartsAnotherGame = false;
	window.game.settings.network.server = 'ws://127.0.0.1:9900';

	describe('Go to P1 online mode', function () {
		it('should show welcome window', function () {
			expect($('#game-select-window').is(':visible')).to.equal(true);
		});

		it('should close welcome window after starting 1P online game', function () {
			$('#game-select-mode-1p-human').click();
			expect($('#game-select-window').is(':visible')).to.equal(false);
		});

		it('should show enter names dialog', function () {
			expect($('#network-online-game-select').is(':visible')).to.equal(true);
		});

		it('Wait 2s before joining so server-side player2 can join room first', function (done) {
			setTimeout(done, 2000);
		});
	});

	describe('Should join public game', function () {
		it('should accept name', function () {
			$('#online-game-name-input').val('PhantomPlayer');
			$('#network-online-game-public-btn').click();
			expect($('#network-online-game-select').is(':visible')).to.equal(false);
		});

		it('should show message container', function (done) {
			wait.appear('.message-container', done);
		});
	});

	describe('Basics', function () {
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

		it('should place puck at player1 territory', function (done) {
			simulate.placePuck('d5');
			wait.packet('turn', done);
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

		it('should show message when player1 tries to click puck', function (done) {
			simulate.clickPuck();
			wait.appear('.message-container', done);
		});

		it('should show message with "Wait for your turn" text', function () {
			expect($('.message-container .message').text()).to.contain('Wait for your turn');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should show message "Wait for your turn" if we try to click player1 actor(0)', function (done) {
			simulate.clickActor(0);
			wait.message('Wait for your turn', done);
		});

		it('should not create any valid moves', function (done) {
			expect($('.valid-move-circle').length).to.be.equal(0);
			wait.packet('["turn","player1"]', done);
		});

		it('should select actor(2) and display valid moves', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click actor(2) again', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor(2) and display valid moves', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click puck', function () {
			simulate.clickPuck();
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should show message with "must be near puck" text', function (done) {
			wait.message('must be near puck', done);
		});

		it('should select actor(2) and display valid moves', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click empty tile a7', function () {
			simulate.clickTile('a7');
			expect($('.valid-move-circle').length).to.be.equal(0);
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
	});

	describe('Blocking puck', function () {
		it('should make server-side moves', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(3) to g4', function (done) {
			Actor(3).moveTo('g4', done);
		});
		it('should move actor(2) to g5', function (done) {
			Actor(2).moveTo('g5', done);
		});
		it('should make server-side moves', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(4) to g2', function (done) {
			Actor(4).moveTo('g2', done);
		});
		it('should move actor(4) to h3', function (done) {
			Actor(4).moveTo('h3', done);
		});
		it('should make server-side moves', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(1) to g7', function (done) {
			Actor(1).moveTo('g7', done);
		});
		it('should move actor(1) to h6', function (done) {
			Actor(1).moveTo('h6', done);
		});
		it('should make server-side moves', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(1) to h5', function (done) {
			Actor(1).moveTo('h5', done);
		});
		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should make server-side moves', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should wait for message to disappear', function (done) {
			wait.disappear('.message-container', done);
		});
		it('should not select puck and display message that puck is blocked by players', function (done) {
			simulate.clickPuck();
			wait.message('Puck is blocked', done);
		});

		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should make server-side moves', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('i4');
			simulate.clickTile(']4');
			wait.packet('["turn","player1"]', done);
		});
	});

	describe('Goal in 1 move', function () {
		it('should click puck and display valid moves', function () {
			simulate.clickPuck();
			simulate.clickTile('h3');
			expect($('.valid-puck-move-circle').length).to.be.equal(6);
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 2,
				score2: 0,
				message: 'Its turn of your opponent',
				done: done
			});
		});

		it('should make goal to player1 side', function (done) {
			simulate.clickTile(']4');
			wait.finishPuckMove(done);
		});

		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});
	});

	describe('Bounce of corner of goal', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 3,
				score2: 0,
				message: 'Its turn of your opponent',
				done: done
			});
		});

		it('should see placed puck at g5 by server, click it and not bounce from corner of goal zone', function () {
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
				wait.packet('["turn","player1"]', done);
			});
		});
	});
	describe('Move puck without displaying valid points if there is only 1 move available', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 4,
				score2: 0,
				message: 'Its turn of your opponent',
				done: done
			});
		});


		it('should kick puck to g4 without showing valid moves dots', function (done) {
			simulate.clickPuck();
			simulate.clickTile('g4');
			wait.finishPuckMove(done);
		});

		it('should make goal to ]4', function (done) {
			simulate.clickPuck();
			simulate.clickTile('h4');
			simulate.clickTile(']4');

			wait.packet('["turn","player1"]', done);
		});

		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 5,
				score2: 0,
				message: 'Its turn of your opponent',
				done: done
			});
		});
	});
	describe('Goal from 1 tile away', function () {
		it('should move actor(2) to g5', function (done) {
			Actor(2).moveTo('g5', done);
		});

		it('should move actor(2) to h4', function (done) {
			Actor(2).moveTo('h4', done);
		});

		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(2) to i4', function (done) {
			Actor(2).moveTo('i4', done);
		});

		it('should move puck to l4', function (done) {
			simulate.clickPuck();
			simulate.clickTile('k4');
			simulate.clickTile('l4');
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(2) to j4', function (done) {
			Actor(2).moveTo('j4', done);
		});

		it('should move actor(2) to k4', function (done) {
			Actor(2).moveTo('k4', done);
		});

		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should make goal without showing valid moves dots', function (done) {
			simulate.clickPuck();
			simulate.clickTile(']4');
			wait.finishPuckMove(done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "PhantomPlayer"][Black "ServerPlayer"]' +
				'[Result "6-0"]\t1pd5 2g1h2i3 1f6e5 1pd5a2b1f5 2pf5j1]4+ 2ph4 1f3g4 1f6g5 2g1h2i3 1f1g2h3 2g6h6i5 ' +
				'1f8g7h6 2]5l5k5 1h6h5 1[4[5 2k5j5i4 1[5[4[5 2i4j4j5 1ph4]4+ 2pg4 1pg4j1]4+ 2pg5 1pg5f4]4 2pg5 ' +
				'1pg5g4]4 2pj4 1f6g5h4 2g6g7h7 1h4i4 1pj4l4 2h7h6h5 1i4j4k4 2h5h4h3 1pl4]4++ 6-0');
		});
	});

	describe('Starting another game', function () {
		it('should click another game and start it', function (done) {
			$('#game-won-another-game-button').click();
			//wait.disappear('#game-won-window', done);
			wait.packet('["another_game_started"]', done);
		});

		it('should display place puck message', function (done) {
			wait.appear('.message-container', done);
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "PhantomPlayer"][Black "ServerPlayer"]' +
			'[Result "6-0"]\t1pd5 2g1h2i3 1f6e5 1pd5a2b1f5 2pf5j1]4+ 2ph4 1f3g4 1f6g5 2g1h2i3 1f1g2h3 2g6h6i5 ' +
			'1f8g7h6 2]5l5k5 1h6h5 1[4[5 2k5j5i4 1[5[4[5 2i4j4j5 1ph4]4+ 2pg4 1pg4j1]4+ 2pg5 1pg5f4]4 2pg5 ' +
			'1pg5g4]4 2pj4 1f6g5h4 2g6g7h7 1h4i4 1pj4l4 2h7h6h5 1i4j4k4 2h5h4h3 1pl4]4++ 6-0' +
				'[Game "2"][White "PhantomPlayer"][Black "ServerPlayer"]\t');
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
			util.skipOnlineRoundAndValidate(1, 2, { // validate will be called after player2 placed puck so owner will be player1
				owner: 1,
				score1: 1,
				score2: 0,
				message: 'Its turn of your opponent',
				done: done
			});
		});
	});

	describe('Shoot puck backwards from wall', function () {
		it('should move actor(1) to g7', function (done) {
			Actor(1).moveTo('g7', done);
		});

		it('should move actor(1) to h7', function (done) {
			Actor(1).moveTo('h7', done);
		});

		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(1) to i7', function (done) {
			Actor(1).moveTo('i7', done);
		});

		it('should make goal shooting puck backwards', function (done) {
			simulate.clickPuck();
			simulate.clickTile('j7');
			simulate.clickTile(']4');
			wait.finishPuckMove(done);
		});
	});
	describe('Players blocking goal zone', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1, // again owner should be player2 but server will send his place puck before this check
				score1: 2,
				score2: 0,
				message: 'Its turn of your opponent',
				done: done
			});
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});
		it('should move actor(0) to [4', function (done) {
			Actor(0).moveTo('[4', done);
		});
		it('should receive server move', function (done) {
			wait.packet('["receive_turn",{"owner":"player2","scored":"player2"', done);
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
		it('should receive server move', function (done) {
			wait.packet('["turn","player1"]', done);
		});



		it('should display valid moving points', function () {
			simulate.clickPuck();
			simulate.clickTile('d6');
			expect($('.valid-puck-move-circle').length).to.be.equal(20);
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('d5');
			simulate.clickTile('[5');
			wait.finishPuckMove(done);
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
			util.skipOnlineRoundAndValidate(1, 2, { // validate will be called after player2 placed puck so owner will be player1
				owner: 1,
				score1: 3,
				score2: 2,
				message: 'Its turn of your opponent',
				done: done
			});
		});

		it('should make goal by player2 to player1', function (done) {
			util.skipOnlineRoundAndValidate(2, 1, {
				owner: 1,
				score1: 3,
				score2: 3,
				message: 'Place the puck on your side (left)',
				done: done
			});
		});

		it('should make goal by player1 to player2', function (done) {
			util.skipOnlineRoundAndValidate(1, 2, {
				owner: 1,  // validate will be called after player2 placed puck so owner will be player1
				score1: 4,
				score2: 3,
				message: 'Its turn of your opponent',
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipOnlineRoundAndValidate(2, 2, {
				owner: 1, // validate will be called after player2 placed puck so owner will be player1
				score1: 5,
				score2: 3,
				message: 'Its turn of your opponent',
				done: done
			});
		});

		it('should make goal by player2 to player2', function (done) {
			util.skipOnlineRound(2, 2, done);
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
			expect($('#game-won-winner-name').text()).to.be.equal('PhantomPlayer');
		});

		it('should say score is 6:3', function () {
			expect($('#game-won-scores').text()).to.be.equal('6:3');
		});

		it('should display correct notation', function () {
			expect(util.notationToText()).to.be.equal('[Game "1"][White "PhantomPlayer"][Black "ServerPlayer"]' +
				'[Result "6-0"]\t1pd5 2g1h2i3 1f6e5 1pd5a2b1f5 2pf5j1]4+ 2ph4 1f3g4 1f6g5 2g1h2i3 1f1g2h3 2g6h6i5 ' +
				'1f8g7h6 2]5l5k5 1h6h5 1[4[5 2k5j5i4 1[5[4[5 2i4j4j5 1ph4]4+ 2pg4 1pg4j1]4+ 2pg5 1pg5f4]4 2pg5 ' +
				'1pg5g4]4 2pj4 1f6g5h4 2g6g7h7 1h4i4 1pj4l4 2h7h6h5 1i4j4k4 2h5h4h3 1pl4]4++ 6-0[Game "2"][White ' +
				'"PhantomPlayer"][Black "ServerPlayer"][Result "6-3"]\t1pf5 2pf5j1]4+ 2pi8 1f8g7h7 2g8f8e8 1h7i7 ' +
				'1pi8]4+ 2pj5 1[4[5[4 2g8h7i6 1[4[5[4 2i6j6k6 1[4[5[4 2k6l5 2g6h6 1[4[5[4 2h6i5j4 1[4[5[4 2j4k4l4 ' +
				'1[4[5[4 2g3h3i3 1[4[5[4 2i3j3 2l5k5 1[4[5[4 2pj5[5+ 1pe5 2g1g2 2]5]4 1pe5[5+ 1pf5 2pf5j1]4+ 2pg4 ' +
				'1pg4c8[5+ 1pf5 2pf5j1]4+ 2pg4 1pg4]4+ 2pg4 1pg4]4++ 6-3');
		});

		it('should start new 1P online game', function () {
			$('#game-won-new-game-button').click();
			expect($('#game-won-window').is(':visible')).to.equal(false);
		});
	});

	describe('Should join public game', function () {
		it('should show welcome window', function () {
			expect($('#game-select-window').is(':visible')).to.equal(true);
		});


		it('should close welcome window after starting 1P online game', function () {
			$('#game-select-mode-1p-human').click();
			expect($('#game-select-window').is(':visible')).to.equal(false);
		});

		it('should show enter names dialog', function () {
			expect($('#network-online-game-select').is(':visible')).to.equal(true);
		});

		it('Wait 2s before joining so server-side player2 can join room first', function (done) {
			setTimeout(done, 2000);
		});

		it('should accept name', function () {
			$('#online-game-name-input').val('PhantomPlayer');
			$('#network-online-game-public-btn').click();
			expect($('#network-online-game-select').is(':visible')).to.equal(false);
		});

		it('should show message container', function (done) {
			wait.appear('.message-container', done);
		});
	});

	describe('Resign by server-emulated player', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should place puck at player1 territory', function (done) {
			simulate.placePuck('d5');
			wait.packet('["turn","player2"]', done);
		});

		it('should receive server-emulated player resigned message', function (done) {
			wait.appear('#game-won-window', done);
		});

		it('should display correct won window', function () {
			expect($('#game-won-resign-message').text().trim()).to.be.equal('ServerPlayer resigned, PhantomPlayer won!');
		});

		it('should request another game', function (done) {
			$('#game-won-another-game-button').click();
			wait.packet('["another_game_started"]', done);
		});
	});


	describe('Resign by client-side player', function () {
		it('should start new round', function (done) {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0,
				done: done
			});
		});

		it('should place puck at player1 territory', function (done) {
			simulate.placePuck('d5');
			wait.packet('["turn","player2"]', done);
		});

		it('should see actor at h3', function (done) {
			wait.actorAt('h3', done);
		});

		it('should see resign button', function (done) {
			wait.appear('.resign-game-player1', done);
		});

		it('should resign', function (done) {
			$('.resign-game-player1').click();
			wait.appear('#game-won-window', done);
		});

		it('should display correct won window', function () {
			expect($('#game-won-resign-message').text().trim()).to.be.equal('PhantomPlayer resigned, ServerPlayer won!');
		});

		it('should request another game', function (done) {
			$('#game-won-another-game-button').click();
			wait.packet('["another_game_started"]', done);
		});
	});

	describe('Basics', function () {
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

		it('should place puck at player1 territory', function (done) {
			simulate.placePuck('d5');
			wait.packet('["turn","player2"]', done);
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

		it('should tell server that we finished tests', function (done) {
			game.controller.client.send('clientTestFinished');
			wait.packet('["turn","player1"]', done);
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
			expect(util.notationToText()).to.be.equal('[Game "1"][White "PhantomPlayer"][Black "ServerPlayer"]' +
				'[Result "6-0"]\t1pd5 2r 6-0[Game "2"][White "PhantomPlayer"][Black "ServerPlayer"][Result "0-6"]\t' +
				'1pd5 2g1g2h3 1r 0-6[Game "3"][White "PhantomPlayer"][Black "ServerPlayer"]\t1pd5 2g1h2i3');
		});
	});

	describe('Done!', function () {
		it('should wait 1 sec to send data to server', function (done) {
			setTimeout(done, 1000);
		});/**/

		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});
});
