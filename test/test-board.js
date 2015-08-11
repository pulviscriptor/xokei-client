/// require assertion library
var expect = require("chai").expect;

/// src requires
var Board = require("../src/js/board.js"),
	settings = require("../src/js/settings.js");

describe("board", function () {
	it("should place all actors passed in", function () {
		// setup
		var board = new Board({
			zones: settings.zones,
			layout: settings.boardLayout.map(function (row) {
				return row.split("");
			}),
			owner: "player1"
		}), actor, i;
		
		// execution
		board.placeActors([{
			x: 0,
			y: 4,
			owner: "player1"
		}, {
			x: 6,
			y: 0,
			owner: "player1"
		}, {
			x: 6,
			y: 2,
			owner: "player1"
		}]);
		
		// posttest
		expect(board.actors).to.have.length(3);
		
		for (i = 0; i < board.actors.length; i++) {
			actor = board.actors[i];
			expect(board.tiles[actor.x][actor.y])
				.to.have.property("actor", actor);
		}
	});
	
	it("should place puck when passed in", function () {
		// setup
		var board = new Board({
			zones: settings.zones,
			layout: settings.boardLayout.map(function (row) {
				return row.split("");
			}),
			owner: "player1"
		});
		
		// execution
		board.placePuck({
			x: 4,
			y: 5
		});
		
		// posttest
		expect(board).to.have.property("puck");
		expect(board.puck).to.have.property("x", 4);
		expect(board.puck).to.have.property("y", 5);
	});
	
	it("should correctly detect player's actors in their endzone", function () {
		// setup
		var actors = [],
			actorsInEndZone,
			board = new Board({
				zones: settings.zones,
				layout: settings.boardLayout.map(function (row) {
					return row.split("");
				}),
				owner: "player1"
			}),
			x,
			y,
			zone = settings.zones.player1.endZone;
		
		for (x = zone[0].x; x <= zone[1].x; x++) {
			for (y = zone[0].y; y <= zone[1].y; y++) {
				actors.push({
					x: x,
					y: y,
					owner: "player1"
				});
			}
		}
		
		board.placeActors(actors);
		
		// execution
		actorsInEndZone = board.actorsInEndZone("player1");
		
		// posttest
		expect(actorsInEndZone).to.have.length(actors.length);
	});
});