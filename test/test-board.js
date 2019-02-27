/// src requires
var Board = require("../src/js/board.js"),
	Player = require("../src/js/players.js"),
	settings = require("../src/js/settings.js"),
	p1ValidPuckPositions = require("./p1ValidPuckPositions.json");

/// utility functions
function placeActors(player, zone) {
	var actors = [],
		x,
		y;
	
	for (x = zone[0].x; x <= zone[1].x; x++) {
		for (y = zone[0].y; y <= zone[1].y; y++) {
			actors.push({
				x: x,
				y: y,
				owner: player
			});
		}
	}
	
	return actors;
}

/// tests
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
		actorsInEndZone = board.actorsInZone(Player.One, "endZone");
		
		// posttest
		expect(actorsInEndZone).to.have.length(actors.length);
	});
	
	it("should correctly detect player's actors in their goal", function () {
		// setup
		var actors = placeActors(Player.One, settings.zones[Player.One].goal),
			actorsInGoal,
			board = new Board({
				zones: settings.zones,
				layout: settings.boardLayout.map(function (row) {
					return row.split("");
				}),
				owner: Player.One
			});
			
		board.placeActors(actors);
		
		// execution
		actorsInGoal = board.actorsInZone(Player.One, "goal");
		
		// posttest
		expect(actorsInGoal).to.have.length(actors.length);
	});
	
	describe(".tile", function () {
		it("should correctly return the requested tile", function () {
			// setup
			var board = new Board({
					zones: settings.zones,
					layout: settings.boardLayout.map(function (row) {
						return row.split("");
					}),
					owner: Player.One
				}),
				manualTile = board.tiles[5][5],
				programmaticTile;
			
			// execution
			programmaticTile = board.tile(5, 5);
			
			// posttest
			expect(programmaticTile).to.equal(manualTile);
		});
		
		it("should return undefined for tiles outside the board", function () {
			// setup
			var board = new Board({
					zones: settings.zones,
					layout: settings.boardLayout.map(function (row) {
						return row.split("");
					}),
					owner: Player.One
				}),
				tile;
			
			// execution
			tile = board.tile(-5, 5);
			
			// posttest
			expect(tile).to.be.undefined;
		});
	});
	
	describe(".clear", function () {
		it("should remove all actors from the board", function () {
			// setup
			var actors = placeActors(Player.One, 
				settings.zones[Player.One].goal),
				board = new Board({
					zones: settings.zones,
					layout: settings.boardLayout.map(function (row) {
						return row.split("");
					}),
					owner: Player.One
				}),
				x,
				y;
				
			board.placeActors(actors);
			
			// execution
			board.clear();
			
			// posttest
			expect(board.actors.length).to.equal(0);
			
			for (x = 0; x < board.width; x++) {
				for (y = 0; y < board.height; y++) {
					expect(board.tile(x, y).actor).to.be.null;
				}
			}
		});
	});
	
	describe(".validPuckPositions", function () {
		it("should return tiles in the player's zone that are not occupied, " +
		   "goal tiles, or endzone tiles", function () {
   			// setup
			var board = new Board({
				zones: settings.zones,
				layout: settings.boardLayout.map(function (row) {
					return row.split("");
				}),
				owner: Player.One
			});
			
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
			}, {
				x: 6,
				y: 5,
				owner: Player.One
			}, {
				x: 6,
				y: 7,
				owner: Player.One
			}, {
				x: 13,
				y: 3,
				owner: Player.Two
			}, {
				x: 7,
				y: 0,
				owner: Player.Two
			}, {
				x: 7,
				y: 2,
				owner: Player.Two
			}, {
				x: 7,
				y: 5,
				owner: Player.Two
			}, {
				x: 7,
				y: 7,
				owner: Player.Two
			}]);
			
			expect(board.getValidPuckPositions().map(function (tile) {
				return {
					x: tile.x,
					y: tile.y
				};
			})).to.eql(p1ValidPuckPositions);
		});
	});
});