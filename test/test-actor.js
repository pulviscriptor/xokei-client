/// require assertion library
var expect = require("chai").expect;

/// src requires
var Actor = require("../src/js/actor.js"),
	Board = require("../src/js/board.js"),
	settings = require("../src/js/settings.js");

var board = new Board({
	zones: settings.zones,
	layout: settings.boardLayout.map(function (row) {
		return row.split("");
	}),
	owner: "player1"
});

board.placePuck({
	x: 4,
	y: 5
});

describe("actor", function () {
	var actor = new Actor({
		x: 0,
		y: 0,
		owner: "player1"
	}, board);
	
	it("should be able to move from one tile to another", function () {
		// setup
		actor.move(board.tiles[0][4], true);
		
		// pretest
		expect(board.tiles[0][4].actor).to.equal(actor);
		
		// execution
		actor.move(board.tiles[1][4]);
		
		// posttest
		expect(board.tiles[1][4].actor).to.equal(actor);
		expect(actor.tile).to.equal(board.tiles[1][4]);
	});
	
	it("should not be able to move off the board", function () {
		// setup
		actor.move(board.tiles[1][0], true);
		
		// execution
		actor.move(board.tiles[1][-1]);
		
		// posttest
		expect(actor.tile).to.equal(board.tiles[1][0]);
	});
	
	it("should not be able to move into a wall", function () {
		// setup
		actor.move(board.tiles[1][0], true)
		
		// execution
		actor.move(board.tiles[0][0]);
		
		// posttest
		expect(actor.tile).to.equal(board.tiles[1][0]);
	});
	
	it("should not be able to move into another actor's tile", function () {
		// setup
		actor.move(board.tiles[5][5], true);
		var otherActor = new Actor({
			x: 5,
			y: 6,
			owner: "player1"
		}, board);
		
		// execution
		actor.move(board.tiles[5][6]);
		
		// posttest
		expect(actor.tile).to.equal(board.tiles[5][5]);
	});
	
	it("should not be able to move into the puck's tile", function () {
		// setup
		actor.move(board.tiles[5][5], true);
		
		// execution
		actor.move(board.tiles[4][5]);
		
		// posttest
		expect(actor.tile).to.equal(board.tiles[5][5]);
	});
	
	it("should not be able to move more than one tile away", function () {
		// setup
		actor.move(board.tiles[5][5], true);
		
		// execution
		actor.move(board.tiles[5][3]);
		
		// posttest
		expect(actor.tile).to.equal(board.tiles[5][5]);
	});
	
	it("should not be able to move into the endzone if there are already too " +
	   "many players there", function () {
		// setup
		var actor2 = new Actor({
				x: 1,
				y: 3,
				owner: "player1"
			}, board),
			actor3 = new Actor({
				x: 1,
				y: 4,
				owner: "player1"
			}, board);
		
		actor.move(board.tiles[3][3], true);
		
		// execution
		actor.move(board.tiles[2][3]);
		
		// posttest
		expect(actor.tile).to.equal(board.tiles[3][3]);
	});
});