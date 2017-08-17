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

	finishActorMove: function (id, done) {
		var $el = $('circle[data-actor=' + id + ']');
		this.finish(done, $el, 0, 0, 0, function () {
			var pos = $el[0].getBoundingClientRect();;
			return pos.top + ':' + pos.left;
		});
	},

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

describe('Testing game', function () {
	describe('Game', function () {
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
	});
});