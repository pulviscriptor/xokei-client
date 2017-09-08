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
	attempts: 400,
	interval: 10,
	stable: 3,

	// repeat test() function until we get result that we exect
	repeat: function (done, expectation, test, attempt) {
		if(!done) throw new Error('Forgot to pass `done` callback?');
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
		if(!done) throw new Error('Forgot to pass `done` callback?');
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
		if(!done) throw new Error('Forgot to pass `done` callback?');
		/*if(!attempt) attempt = 1;

		 if(getValue() != currentValue) {
		 done();
		 }else{
		 attempt++;
		 if(attempt > this.attempts) {
		 done('Timeout inside wait.change');
		 }else{
		 setTimeout(this.change.bind(this, currentValue, getValue, done, attempt));
		 }
		 }*/
		this.repeat(done, false, function (err) {
			if(err) return done(err);
			return currentValue == getValue();
		});
	},

	appear: function (el, done) {
		if(!done) throw new Error('Forgot to pass `done` callback?');
		this.repeat(done, true, function (err) {
			if(err) return done(err);
			return $(el).is(':visible');
		});
	},

	disappear: function (el, done) {
		if(!done) throw new Error('Forgot to pass `done` callback?');
		this.repeat(done, false, function (err) {
			if(err) return done(err);
			return $(el).is(':visible');
		});
	},

	finishPuckMove: function (done) {
		if(!done) throw new Error('Forgot to pass `done` callback?');
		/*var $el = $('.puck-actor');
		this.finish(done, $el, 0, 0, 0, function () {
			var pos = $el[0].getBoundingClientRect();
			return pos.top + ':' + pos.left;
		});*/
		var turn = game.controller.currentTurn;
		wait.change(turn.history.length, function (err) {
			if(err) return done(err);
			return turn.history.length;
		}, done);
	},

	message: function (text, done) {
		if(!done) throw new Error('Forgot to pass `done` callback?');
		this.appear('.message-container', function (err) {
			if(err) return done(err);
			var currentText = $('.message-container .message').text();
			if(currentText.indexOf(text) < 0) return done('Expected message to contain "' + text + '" but it was "' + currentText + '"');
			$('i.fa.fa-times-circle.fa-lg.close-message').click();
			wait.disappear('.message-container', done);
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
		if(typeof x == 'string') {
			var cords = util.notationToCoordinates(x);
			x = cords.x;
			y = cords.y;
		}
		var el = $('rect[data-position="{\\\"x\\\":' + x + ',\\\"y\\\":' + y + '}"]')[0];
		this.click(el);
	},

	placePuck: function (x, y) {
		if(typeof x == 'string') {
			var cords = util.notationToCoordinates(x);
			x = cords.x;
			y = cords.y;
		}

		if(game.board.tile(x, y).actor) throw new Error('Tile ' + notation + ' is already occupied');
		this.clickTile(x, y);
		if(!game.board.tile(x, y).actor) throw new Error('Attempted to place puck at ' + util.coordinatesToNotation(x, y) + ' but did not found it there');
		if($('.puck-actor').length != 1) throw new Error('Expected to find 1 puck on board but found ' + $('.puck-actor').length);
	},

	clickPuck: function () {
		this.click($('.puck-actor')[0]);
	},

	clickActor: function (id) {
		this.click($('circle[data-actor=' + id + ']')[0]);
	}
};

var util = {
	/*cordsX: '[abcdefghijkl]',
	cordsY: '87654321',*/

	notationToCoordinates: function (notation) {
		/*var x = this.cordsX.indexOf(notation.toLowerCase()[0]);
		var y = this.cordsY.indexOf(notation.toLowerCase()[1]);

		if(x < 0) throw new Error('Unknown notation X coordinate: ' + notation[0]);
		if(y < 0) throw new Error('Unknown notation Y coordinate: ' + notation[1]);

		return {x: x, y: y};*/
		return window.game.controller.notationToCoordinates(notation);
	},

	coordinatesToNotation: function (cords, y) {
		/*if(typeof y == 'number') { cords = {x: cords, y: y}; };

		if(typeof cords.x != 'number') throw new Error('Expected cords.x to be a number and it was ' + cords.x);
		if(typeof cords.y != 'number') throw new Error('Expected cords.y to be a number and it was ' + cords.y);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);
		if(cords.x < 0 || cords.x > 13) throw new Error('Expected cords.x to be 0-13 and it was ' + cords.x);

		return this.cordsX[cords.x] + this.cordsY[cords.y];*/
		return window.game.controller.coordinatesToNotation(cords, y);
	},

	// opt.owner = 1/2 = owner of current turn
	// opt.score1 = score of player 1
	// opt.score2 = score of player 2
	validateNewRound: function (opt) {
		if(!opt.done) throw new Error('Forgot to pass `done` callback?');
		wait.message('Place the puck on your side (' + (opt.owner == 1?'left':'right') + ')', function (err) {
			if(err) return opt.done(err);
			if(game.board.tile(0, 4).actor.owner != 'player1') return opt.done('Can\'t find player1 actor at ' + util.coordinatesToNotation(0, 4));
			if(game.board.tile(6, 0).actor.owner != 'player1') return opt.done('Can\'t find player1 actor at ' + util.coordinatesToNotation(6, 0));
			if(game.board.tile(6, 2).actor.owner != 'player1') return opt.done('Can\'t find player1 actor at ' + util.coordinatesToNotation(6, 2));
			if(game.board.tile(6, 5).actor.owner != 'player1') return opt.done('Can\'t find player1 actor at ' + util.coordinatesToNotation(6, 5));
			if(game.board.tile(6, 7).actor.owner != 'player1') return opt.done('Can\'t find player1 actor at ' + util.coordinatesToNotation(6, 7));

			if(game.board.tile(13,3).actor.owner != 'player2') return opt.done('Can\'t find player2 actor at ' + util.coordinatesToNotation(13, 3));
			if(game.board.tile(7, 0).actor.owner != 'player2') return opt.done('Can\'t find player2 actor at ' + util.coordinatesToNotation(7, 0));
			if(game.board.tile(7, 2).actor.owner != 'player2') return opt.done('Can\'t find player2 actor at ' + util.coordinatesToNotation(7, 2));
			if(game.board.tile(7, 5).actor.owner != 'player2') return opt.done('Can\'t find player2 actor at ' + util.coordinatesToNotation(7, 5));
			if(game.board.tile(7, 7).actor.owner != 'player2') return opt.done('Can\'t find player2 actor at ' + util.coordinatesToNotation(7, 7));

			if(game.board.settings.owner != 'player' + opt.owner)return opt.done('Expected owner of turn to be player' + opt.owner + ' but it was ' + game.board.settings.owner);
			if($('.player-' + opt.owner + '-name').css('text-decoration').indexOf('underline') < 0) return opt.done('Expected player' + opt.owner + ' name to be underlined');

			var scores = $('.player-1-score').text() + ':' + $('.player-2-score').text();
			var validScores = opt.score1 + ':' + opt.score2;
			if(scores != validScores) return opt.done('Expected scores to be ' + validScores + ' but it was ' + scores);

			if($('.score-point:visible').length != opt.score1+opt.score2) return opt.done('Expected to see ' + opt.score1+opt.score2 + ' score points, but it was ' + $('.score-point:visible').length);
			if($('.score-point-player1:visible').length != opt.score1) return opt.done('Expected to see ' + opt.score1 + ' score points of player1, but it was ' + $('.score-point-player1:visible').length);
			if($('.score-point-player2:visible').length != opt.score2) return opt.done('Expected to see ' + opt.score2 + ' score points of player2, but it was ' + $('.score-point-player2:visible').length);

			opt.done();
		});
	},

	tile: function (x, y) {
		if(typeof x == 'string') {
			var cords = util.notationToCoordinates(x);
			x = cords.x;
			y = cords.y;
		}
		return game.board.tile(x, y);
	},
	
	notationToText: function () {
		return $('#moves').text().replace(/\[Date "([0-9\-:+ ]*)"] /g, '');
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

			if(!done) throw new Error('Forgot to pass `done` callback?');
			if(diffX > 1) throw new Error('Actor should be not more than 1 tile away from target on X and it was ' + diffX);
			if(diffY > 1) throw new Error('Actor should be not more than 1 tile away from target on Y and it was ' + diffY);
			if(diffY == 0 && diffX == 0) throw new Error('Actor should move somewhere, but his current position is his destination');
			if(game.board.tile(cords.x, cords.y).actor) throw new Error('Tile ' + notation + ' is already occupied');

			simulate.clickActor(id);
			simulate.clickTile(cords.x, cords.y);
			wait.change(game.controller.currentTurn.history.length, function (err) {
				if(err) return done(err);
				return game.controller.currentTurn.history.length;
			}, function (err) {
				if(err) return done(err);
				var currentActor = game.board.actors[id];
				if( currentActor.x != cords.x || currentActor.y != cords.y ) throw new Error('Expected to see actor in ' + notation + ' but it moved to ' + util.coordinatesToNotation(currentActor));
				done();
			});
		}
	};
}