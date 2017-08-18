// positioning test resilts
var rePositionResult = function () {
	setTimeout(function () {
		$( "#mocha" ).position({
			my: "left top",
			at: "right top",
			of: "#board",
			collision: 'fit'
		});
	}, 100);
};
rePositionResult();
$(window).resize(rePositionResult);


// can't find how to do async testing correctly so will do this:
var wait = {
	attempts: 100,
	interval: 20,
	stable: 3,

	// repeat test() function until we get result that we exect
	repeat: function (done, expectation, test, attempt) {
		if(!attempt) attempt = 1;

		if(test() == expectation) {
			done();
		}else{
			attempt++;
			if(attempt > this.attempts) {
				done('Timeout inside wait.repeat');
			}else{
				setTimeout(this.repeat.bind(this, done, expectation, test, attempt), this.interval);
			}
		}
	},

	// repeat getValue() function until it returns same result for %stable% times
	finish: function (done, $el, attempt, stable, lastValue, getValue) {
		attempt++;
		if(attempt > this.attempts) {
			return done('Finish failed to wait until result');
		}

		var currentValue = getValue();
		if(currentValue == lastValue) {
			stable++;
			if(stable >= this.stable) {
				return done();
			}
		}else{
			stable = 0;
		}
		setTimeout(this.finish.bind(this, done, $el, attempt, stable, currentValue, getValue), this.interval);
	},

	// repeat getValue() until it changes from currentValue
	change: function (currentValue, getValue, done, attempt) {
		if(!attempt) attempt = 1;

		if(getValue() != currentValue) {
			done();
		}else{
			attempt++;
			if(attempt > this.attempts) {
				done('Timeout inside wait.change');
			}else{
				setTimeout(this.change.bind(this, currentValue, getValue, done, attempt));
			}
		}
	},

	appear: function (el, done) {
		this.repeat(done, true, function () {
			return $(el).is(':visible');
		});
	},

	disappear: function (el, done) {
		this.repeat(done, false, function () {
			return $(el).is(':visible');
		});
	},

	/*finishActorMove: function (id, done) {
		var $el = $('circle[data-actor=' + id + ']');
		this.finish(done, $el, 0, 0, 0, function () {
			var pos = $el[0].getBoundingClientRect();;
			return pos.top + ':' + pos.left;
		});
	},*/

	finishPuckMove: function (done) {
		var $el = $('.puck-actor');
		this.finish(done, $el, 0, 0, 0, function () {
			var pos = $el[0].getBoundingClientRect();
			return pos.top + ':' + pos.left;
		});
	}
};

var simulate = {
	// https://stackoverflow.com/questions/3277369/how-to-simulate-a-click-by-using-x-y-coordinates-in-javascript
	click: function(el)	{
		var ev = document.createEvent("MouseEvent");
		ev.initMouseEvent(
			"click",
			true /* bubble */, true /* cancelable */,
			window, null,
			0, 0, 0, 0, /* coordinates */
			false, false, false, false, /* modifier keys */
			0 /*left*/, null
		);
		el.dispatchEvent(ev);
	},

	clickTile: function (x, y) {
		var el = $('rect[data-position="{\\\"x\\\":' + x + ',\\\"y\\\":' + y + '}"]')[0];
		this.click(el);
	},

	placePuck: function (x, y) {
		this.clickTile(x, y);
	},

	clickPuck: function () {
		this.click($('.puck-actor')[0]);
	},

	clickActor: function (id) {
		this.click($('circle[data-actor=' + id + ']')[0]);
	}
};

var util = {
	cordsX: '[abcdefghijkl]',
	cordsY: '87654321',

	notationToCoordinates: function (notation) {
		var x = this.cordsX.indexOf(notation.toLowerCase()[0]);
		var y = this.cordsY.indexOf(notation.toLowerCase()[1]);

		if(x < 0) throw new Error('Unknown notation X coordinate: ' + notation[0]);
		if(y < 0) throw new Error('Unknown notation Y coordinate: ' + notation[1]);

		return {x: x, y: y};
	},

	coordinatesToNotation: function (cords, y) {
		if(y) { cords = {x: cords, y: y}; };

		if(typeof cords.x != 'number') throw new Error('Expected cords.x to be a number and it was ' + cords.x);
		if(typeof cords.y != 'number') throw new Error('Expected cords.y to be a number and it was ' + cords.y);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);

		return this.cordsX[cords.x] + this.cordsY[cords.y];
	}
};

function Actor(id) {
	if(typeof id != 'number') throw new Error('Actor ID should be a number and it was ' + id);
	if(id < 0 || id > 9) throw new Error('Actor ID should be 0-9 and it was ' + id);

	return {
		moveTo: function (notation, done) {
			var cords = util.notationToCoordinates(notation);
			var actor = game.board.actors[id];
			var diffX = Math.abs(cords.x - actor.x);
			var diffY = Math.abs(cords.y - actor.y);

			if(diffX > 1) throw new Error('Actor should be not more than 1 tile away from target on X and it was ' + diffX);
			if(diffY > 1) throw new Error('Actor should be not more than 1 tile away from target on Y and it was ' + diffY);
			if(diffY == 0 && diffX == 0) throw new Error('Actor should move somewhere, but his current position is his destination');
			if(game.board.tile(cords.x, cords.y).actor) throw new Error('Tile ' + notation + ' is already occupied');

			simulate.clickActor(id);
			simulate.clickTile(cords.x, cords.y);
			wait.change(game.controller.turns.length, function () {
				return game.controller.turns.length;
			}, function () {
				var currentActor = game.board.actors[id];
				if( currentActor.x != cords.x || currentActor.y != cords.y ) throw new Error('Expected to see actor in ' + notation + ' but it moved to ' + util.coordinatesToNotation(currentActor));
				done();
			});
		}
	};
}

describe('Testing game', function () {
	describe('Game', function () {
		this.timeout(5000);

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

		it('should find player1 actors at F8 F6 F3 F1 [4', function () {
			expect(
				game.board.tile(0,4).actor.owner == 'player1' &&
				game.board.tile(6,0).actor.owner == 'player1' &&
				game.board.tile(6,2).actor.owner == 'player1' &&
				game.board.tile(6,5).actor.owner == 'player1' &&
				game.board.tile(6,7).actor.owner == 'player1'
			).to.be.true;
		});

		it('should find player2 actors at G8 G6 G3 G1 ]5', function () {
			expect(
				game.board.tile(13,3).actor.owner == 'player2' &&
				game.board.tile(7,0).actor.owner == 'player2' &&
				game.board.tile(7,2).actor.owner == 'player2' &&
				game.board.tile(7,5).actor.owner == 'player2' &&
				game.board.tile(7,7).actor.owner == 'player2'
			).to.be.true;
		});

		it('should pass turn to player1', function () {
			expect(game.board.settings.owner).to.be.equal('player1');
		});

		it('should underline player1 name', function () {
			expect($('.player-1-name').css('text-decoration')).to.contain('underline');
		});

		it('should display 0:0 score', function () {
			expect($('.player-1-score').text() + ':' + $('.player-2-score').text()).to.be.equal('0:0');
		});

		it('should not be able to place puck and player2 territory', function () {
			simulate.placePuck(8,0);
			expect($('.puck-actor').length).to.equal(0);
		});

		it('should place puck at player1 territory', function () {
			simulate.placePuck(4,3);
			expect($('.puck-actor').length).to.equal(1);
		});

		it('should find puck at D3', function () {
			expect(game.board.tile(4,3).actor).to.be.instanceOf(game.puck);
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

		it('should show message if we try to click player1 actor', function (done) {
			simulate.clickActor(0);
			wait.appear('.message-container', done);
		});

		it('should show message with "wait for your turn" text', function () {
			expect($('.message-container .message').text()).to.contain('for your turn');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should not create any valid moves', function () {
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor and display valid moves', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should hide moves if we click actor again', function () {
			simulate.clickActor(8);
			expect($('.valid-move-circle').length).to.be.equal(0);
		});

		it('should select actor and display valid moves', function () {
			simulate.clickActor(9);
			expect($('.valid-move-circle').length).to.be.equal(4);
		});

		it('should move selected actor', function (done) {
			simulate.clickTile(8, 6);
			wait.finishActorMove(9, done);
		});

		it('should select actor and display valid moves', function () {
			simulate.clickActor(9);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should move selected actor', function (done) {
			simulate.clickTile(9, 5);
			wait.finishActorMove(9, done);
		});

		it('should pass turn to player1', function () {
			expect(game.board.settings.owner).to.be.equal('player1');
		});

		it('should select actor and display valid moves', function () {
			simulate.clickActor(2);
			expect($('.valid-move-circle').length).to.be.equal(7);
		});

		it('should move selected actor', function (done) {
			simulate.clickTile(5, 3);
			wait.finishActorMove(2, done);
		});

		it('should display arrows for puck when we click it', function () {
			simulate.clickPuck();
			expect($('.kick-direction-arrow').length).to.be.equal(5);
		});

		it('should display valid moves when we click on arrow', function () {
			simulate.clickTile(3, 3);
			expect($('.valid-puck-move-circle').length).to.be.equal(4);
		});

		it('should delete puck after we made goal', function (done) {
			simulate.clickTile(0, 3);
			wait.appear($('.message-container .message'), done);
		});

		it('should find player1 actors at F8 F6 F3 F1 [4', function () {
			expect(
				game.board.tile(0,4).actor.owner == 'player1' &&
				game.board.tile(6,0).actor.owner == 'player1' &&
				game.board.tile(6,2).actor.owner == 'player1' &&
				game.board.tile(6,5).actor.owner == 'player1' &&
				game.board.tile(6,7).actor.owner == 'player1'
			).to.be.true;
		});

		it('should find player2 actors at G8 G6 G3 G1 ]5', function () {
			expect(
				game.board.tile(13,3).actor.owner == 'player2' &&
				game.board.tile(7,0).actor.owner == 'player2' &&
				game.board.tile(7,2).actor.owner == 'player2' &&
				game.board.tile(7,5).actor.owner == 'player2' &&
				game.board.tile(7,7).actor.owner == 'player2'
			).to.be.true;
		});

		it('should pass turn to player2', function () {
			expect(game.board.settings.owner).to.be.equal('player2');
		});

		it('should underline player2 name', function () {
			expect($('.player-2-name').css('text-decoration')).to.contain('underline');
		});

		it('should display 0:1 score', function () {
			expect($('.player-1-score').text() + ':' + $('.player-2-score').text()).to.be.equal('0:1');
		});

		it('should display 1 score point', function () {
			expect($('.score-point:visible').length).to.be.equal(1);
		});

		it('should display player2 score point', function () {
			expect($('.score-point-player2:visible').length).to.be.equal(1);
		});

		it('should place puck at H4', function () {
			simulate.clickTile(8, 4);
			expect(game.board.tile(8,4).actor).to.be.instanceOf(game.puck);
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(3);
			simulate.clickTile(7, 4);
			wait.finishActorMove(3, function () {
				if(game.board.tile(7,4).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(2);
			simulate.clickTile(7, 3);
			wait.finishActorMove(2, function () {
				if(game.board.tile(7,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(9);
			simulate.clickTile(8, 6);
			wait.finishActorMove(9, function () {
				if(game.board.tile(8,6).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(9);
			simulate.clickTile(9, 5);
			wait.finishActorMove(9, function () {
				if(game.board.tile(9,5).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(4);
			simulate.clickTile(7, 6);
			wait.finishActorMove(4, function () {
				if(game.board.tile(7,6).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(4);
			simulate.clickTile(8, 5);
			wait.finishActorMove(4, function () {
				if(game.board.tile(8,5).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(7);
			simulate.clickTile(8, 2);
			wait.finishActorMove(7, function () {
				if(game.board.tile(8,2).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(7);
			simulate.clickTile(9, 3);
			wait.finishActorMove(7, function () {
				if(game.board.tile(9,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(1);
			simulate.clickTile(7, 1);
			wait.finishActorMove(1, function () {
				if(game.board.tile(7,1).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(1);
			simulate.clickTile(8, 2);
			wait.finishActorMove(1, function () {
				if(game.board.tile(8,2).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(5);
			simulate.clickTile(12, 3);
			wait.finishActorMove(5, function () {
				if(game.board.tile(12,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(5);
			simulate.clickTile(11, 3);
			wait.finishActorMove(5, function () {
				if(game.board.tile(11,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(1);
			simulate.clickTile(8, 3);
			wait.finishActorMove(1, function () {
				if(game.board.tile(8,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(0);
			simulate.clickTile(0, 3);
			wait.finishActorMove(0, function () {
				if(game.board.tile(0,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(5);
			simulate.clickTile(10, 3);
			wait.finishActorMove(5, function () {
				if(game.board.tile(10,3).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should move actor towards puck', function (done) {
			simulate.clickActor(5);
			simulate.clickTile(9, 4);
			wait.finishActorMove(5, function () {
				if(game.board.tile(9,4).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should not select puck', function (done) {
			simulate.clickPuck();
			wait.appear($('.message-container .message'), done);
		});

		it('should display message that puck is blocked by players', function () {
			expect($('.message-container .message').text()).to.contain('blocked by');
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should move actor away from puck', function (done) {
			simulate.clickActor(3);
			simulate.clickTile(6, 5);
			wait.finishActorMove(3, function () {
				if(game.board.tile(6,5).actor) {
					done();
				}else{
					done('Can\'t find actor in destination');
				}
			});
		});

		it('should kick puck to goal', function (done) {
			simulate.clickPuck();
			simulate.clickTile(7, 4);
			simulate.clickTile(0, 4);
			wait.appear($('.message-container .message'), done);
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should siplay 2 score points', function () {
			expect($('.score-point:visible').length).to.be.equal(2);
		});

		it('should place puck and display valid moves', function () {
			simulate.clickTile(7, 4);
			simulate.clickPuck();
			simulate.clickTile(8,5);
			expect($('.valid-puck-move-circle').length).to.be.equal(6);
		});

		it('should make goal to player2 side', function (done) {
			simulate.clickTile(13,4);
			wait.appear($('.message-container .message'), done);
		});

		it('should place puck and not bounce from corner of goal zone', function () {
			simulate.clickTile(7,3);
			simulate.clickPuck();
			simulate.clickTile(6,4);
			expect($('.valid-puck-move-circle').length).to.be.equal(6);
		});

		it('should make another goal into player2 zone', function (done) {
			simulate.clickTile(6,4);
			wait.finishPuckMove(function () {
				simulate.clickPuck();
				simulate.clickTile(7,4);
				simulate.clickTile(13,4);
				wait.finishPuckMove(done);
			});
		});

		it('should hide message when we close it', function (done) {
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
		});

		it('should move puck without displaying valid points if there is only 1 move available', function (done) {
			simulate.clickTile(8,1);
			simulate.clickActor(1);
			simulate.clickTile(7,1);
			wait.finishActorMove(1, function () {
				simulate.clickPuck();
				simulate.clickTile(8,0);
				wait.finishPuckMove(function () {
					if(game.board.tile(8,0).actor instanceof game.puck) {
						done();
					}else{
						done('Something went wrong');
					}
				});
			});
		});

		it('No more tests!', function () {
			expect(true).true;
		});
	});
});
