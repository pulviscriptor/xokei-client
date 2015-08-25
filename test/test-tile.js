/// require assertion library
var expect = require("chai").expect;

/// requires
var Board = require("../src/js/board.js"),
	Player = require("../src/js/players.js"),
	settings = require("../src/js/settings.js"),
	Tile = require("../src/js/tile.js");

/// initialization
var board = new Board({
	zones: settings.zones,
	layout: settings.boardLayout.map(function (row) {
		return row.split("");
	}),
	owner: Player.One
});

describe("tile", function () {
	it("should have coordinates equal to those passed in", function () {
		// setup
		var tile = new Tile(0, 0, "#");
		
		// posttest
		expect(tile.x).to.equal(0);
		expect(tile.y).to.equal(0);
	});
	
	it("should not have an actor initially", function () {
		// setup
		var tile = new Tile(0, 0, "#");
		
		// posttest
		expect(tile).to.have.property("actor").that.is.null;
	});
	
	it("should allow properties to be set", function () {
		// setup
		var tile = new Tile(0, 0, "#");
		
		// execution
		tile.set("x", 10);
		
		// posttest
		expect(tile.x).to.equal(10);
	});
	
	describe(".neighborhood", function () {
		it("should return eight tiles if surrounded by tiles", function () {
			// setup
			var i,
				manualNeighborhood = [
					board.tiles[3][3],
					board.tiles[3][4],
					board.tiles[3][5],
					board.tiles[4][3],
					board.tiles[4][5],
					board.tiles[5][3],
					board.tiles[5][4],
					board.tiles[5][5],
				],
				neighborhood,
				tile = board.tiles[4][4];
				
			// execution
			neighborhood = tile.neighborhood();
			
			// posttest
			expect(neighborhood).to.have.length(manualNeighborhood.length);
			
			for (i = 0; i < manualNeighborhood; i++) {
				expect(neighborhood).to.contain(manualNeighborhood[i]);
			}
		});
		
		it("should only return tiles that are part of the field", function () {
			// setup
			var neighborhood,
				tile = board.tiles[1][0];
				
			// execution
			neighborhood = tile.neighborhood();
			
			// posttest
			expect(neighborhood).to.have.length(3);
		});
	});
});