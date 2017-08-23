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

		it('should show message container', function (done) {
			wait.appear('.message-container', done);
		});

		it('should show message with place puck message', function () {
			expect($('.message-container .message').text()).to.contain('puck');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should start new round', function () {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0
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

		it('should remove underline from player1 name', function () {
			expect($('.player-1-name').css('text-decoration')).to.contain('none');
		});

		it('should underline player2 name', function () {
			expect($('.player-2-name').css('text-decoration')).to.contain('underline');
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

		it('should show "Place the puck" message when we make goal to [5 and start new round', function (done) {
			simulate.clickTile('[5');
			wait.message('Player 2: place the puck.', done);
		});
	});
	describe('Blocking puck', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 0,
				score2: 1
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

		it('should make goal and display message "place puck"', function (done) {
			simulate.clickPuck();
			simulate.clickTile('g4');
			simulate.clickTile('[4');
			wait.message('Player 2: place the puck.', done);
		});
	});

	describe('Goal in 1 move', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 0,
				score2: 2
			});
		});

		it('should place puck and display valid moves', function () {
			simulate.placePuck('g4');
			simulate.clickPuck();
			simulate.clickTile('h3');
			expect($('.valid-puck-move-circle').length).to.be.equal(6);
		});

		it('should make goal to player2 side and display message "place puck"', function (done) {
			simulate.clickTile(']4');
			wait.message('Player 2: place the puck.', done);
		});
	});

	describe('Bounce of corner of goal', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 1,
				score2: 2
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

		it('should display message "place puck"', function (done) {
			wait.message('Player 2: place the puck.', done);
		});
	});
	describe('Move puck without displaying valid points if there is only 1 move available', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 2,
				score2: 2
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

		it('should display message "place puck"', function (done) {
			wait.message('Player 2: place the puck.', done);
		});
	});
	describe('Goal from 1 tile away', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 3,
				score2: 2
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

		it('should make goal without showing valid moves dots', function () {
			simulate.clickPuck();
			simulate.clickTile(']4');
		});

		it('should display message "place puck"', function (done) {
			wait.message('Player 2: place the puck.', done);
		});
	});
	describe('Shoot puck backwards from wall', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 4,
				score2: 2
			});
		});

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

		it('should display message "place puck"', function (done) {
			wait.message('Player 2: place the puck.', done);
		});

	});
	describe('Players blocking goal zone', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 5,
				score2: 2
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

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('i5');
			simulate.clickTile('[5');
			wait.message('Player 1: place the puck.', done);
		});
	});
	describe('Infinite puck bouncing', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 1,
				score1: 5,
				score2: 3
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

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('d5');
			simulate.clickTile('[5');
			wait.message('Player 2: place the puck.', done);
		});
	});
	describe('Skip round to 5:5', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 5,
				score2: 4
			});
		});

		it('should place puck at g4', function () {
			simulate.placePuck('g4');
		});

		it('should make goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile('f5');
			simulate.clickTile('[5');
			wait.message('Player 2: place the puck.', done);
		});
	});
	describe('Skip round to win', function () {
		it('should start new round', function () {
			util.validateNewRound({
				owner: 2,
				score1: 5,
				score2: 5
			});
		});

		it('should place puck at g4', function () {
			simulate.placePuck('g4');
		});

		it('should move actor(4) to f2', function (done) {
			Actor(4).moveTo('f2', done);
		});

		it('should move actor(0) to [5', function (done) {
			Actor(0).moveTo('[5', done);
		});

		it('should make goal', function () {
			simulate.clickPuck();
			simulate.clickTile('f4');
			simulate.clickTile('[4');
		});

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

		it('should say Player2 won the game', function () {
			expect($('#game-won-winner-name').text()).to.be.equal('Player2');
		});

		it('should say score is 6:5', function () {
			expect($('#game-won-scores').text()).to.be.equal('6:5');
		});

		it('should display correct notation', function () {
			expect($('#moves').text()).to.be.equal('pd5 2g1i3 1f6e5 pd5[5+ ph4 ' +
				'1f3g4 1f6g5 2g1i3 1f1h3 2g6i5 1f8h6 2]5k5 1h6h5 1[4[5 2k5i4 ' +
				'1g4f3 ph4[4+ pg4 pg4]4+ pg5 pg5]4+ pg5 pg5]4+ pj4 1f6h4 2g6h7 ' +
				'1h4i4 pj4l4 2h7h5 1i4k4 2h5h3 pl4]4+ pi8 1f8h7 2g8e8 1h7i7 ' +
				'pi8]4+ pj5 1[4[4 2g8i6 1[4[4 2i6k6 1[4[4 2k6l5 2g6h6 1[4[4 ' +
				'2h6j4 1[4[4 2j4l4 1[4[4 2g3i3 1[4[4 2i3j3 2l5k5 1[4[4 pj5[5+ ' +
				'pe5 2g1g2 2]5]4 pe5[5+ pg4 pg4[5+ pg4 1f1f2 1[4[5 pg4[4+ ');
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

		it('should show message container', function (done) {
			wait.appear('.message-container', done);
		});

		it('should show message with place puck message', function () {
			expect($('.message-container .message').text()).to.contain('puck');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should start new round', function () {
			util.validateNewRound({
				owner: 1,
				score1: 0,
				score2: 0
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

		it('should remove underline from player1 name', function () {
			expect($('.player-1-name').css('text-decoration')).to.contain('none');
		});

		it('should underline player2 name', function () {
			expect($('.player-2-name').css('text-decoration')).to.contain('underline');
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

		it('should show "Place the puck" message when we make goal to [5 and start new round', function (done) {
			simulate.clickTile('[5');
			wait.message('Player 2: place the puck.', done);
		});

		it('should display correct notation', function () {
			expect($('#moves').text()).to.be.equal("pd5 2g1i3 1f6e5 pd5[5+ ");
		});
	});
	describe('Done!', function () {
		it('No more test to run!', function () {
			expect(true).to.be.true;
		});
	});

});
