/// require assertion library
var expect = require("chai").expect;

/// src requires
var Board = require("../src/js/board.js"),
	Player = require("../src/js/players.js"),
	settings = require("../src/js/settings.js");

describe("board", function () {
	it("should place all actors passed in", function () {
		// setup
		var board = new Board({
			zones: settings.zones,
			layout: settings.boardLayout.map(function (row) {
				return row.split("");
			}),
			owner: Player.One
		}), actor, i;
		
		// execution
		board.placeActors([{
			x: 0,
			y: 4,
			owner: Player.One
		}, {
			x: 6,
			y: 0,
			owner: Player.One
		}, {
			x: 6,
			y: 2,
			owner: Player.One
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
			owner: Player.One
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
				owner: Player.One
			}),
			x,
			y,
			zone = settings.zones[Player.One].endZone;
		
		for (x = zone[0].x; x <= zone[1].x; x++) {
			for (y = zone[0].y; y <= zone[1].y; y++) {
				actors.push({
					x: x,
					y: y,
					owner: Player.One
				});
			}
		}
		
		board.placeActors(actors);
		
		// execution
		actorsInEndZone = board.actorsInEndZone(Player.One);
		
		// posttest
		expect(actorsInEndZone).to.have.length(actors.length);
	});
});