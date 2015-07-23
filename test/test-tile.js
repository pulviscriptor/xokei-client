/// require assertion library
var expect = require("chai").expect;

/// src requires
var Tile = require("../src/js/tile.js");

describe("tile", function () {
	var tile = new Tile(0, 0, "#");
	
	it("should have coordinates equal to those passed in", function () {
		expect(tile.x).to.equal(0);
		expect(tile.y).to.equal(0);
	});
	
	it("should not have a player initially", function () {
		expect(tile).to.have.property("player").that.is.null;
	});
});