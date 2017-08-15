// positioning test resilts
$( "#mocha" ).position({
	my: "left top",
	at: "right+10 top",
	of: "#board"
});

// can't find how to do async testing correctly so will do this:
var wait = {
	attempts: 100,
	interval: 20,

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

	appear: function (el, done) {
		this.repeat(done, true, function () {
			return $(el).is(':visible');
		});
	},

	disappear: function (el, done) {
		this.repeat(done, false, function () {
			return $(el).is(':visible');
		});
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