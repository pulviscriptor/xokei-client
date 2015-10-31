/// src requires
var Puck = require("../src/js/puck.js"),
	Board = require("../src/js/board.js"),
	Player = require("../src/js/players.js"),
	settings = require("../src/js/settings.js");

var board = new Board({
	zones: settings.zones,
	layout: settings.boardLayout.map(function (row) {
		return row.split("");
	}),
	owner: Player.One
});

board.placePuck({
	x: 4,
	y: 5
});

describe("puck", function () {
	it("should be placed at the location passed in", function () {
		// posttest
		expect(board.puck.x).to.equal(4);
		expect(board.puck.y).to.equal(5);
	});
	
	describe(".kick", function () {
		it("should move the puck to the tile passed in", function () {
			// execution
			board.puck.kick(board.tile(5, 5));
			
			// posttest
			expect(board.puck.x).to.equal(5);
			expect(board.puck.y).to.equal(5);
		});
		
		it("should remove reference to itself on old tile", function () {
			// execution
			board.puck.kick(board.tile(5, 6));
			
			// posttest
			expect(board.tile(5, 5).actor).to.be.null;
		});
		
		it("should add a reference to itself on new tile", function () {
			// execution
			board.puck.kick(board.tile(5, 7));
			
			// posttest
			expect(board.tile(5, 7).actor).to.equal(board.puck);
		});
	});
});