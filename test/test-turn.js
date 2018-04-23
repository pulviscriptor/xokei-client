/// src requires
var Board = require("../src/js/board.js"),
	Controller = require("../src/js/controller.js"),
	Player = require("../src/js/players.js"),
	settings = require("../src/js/settings.js"),
	Turn = require("../src/js/turn.js");
	
/// private variables
// describe a set of turns made by player one for testing purposes
// setup
var board = new Board({
		zones: settings.zones,
		layout: settings.boardLayout.map(function (row) {
			return row.split("");
		}),
		owner: Player.One
	}),
	playerOneMoves = [
		{
			finish: null,
			start: null,
			target: "Begin round"
		},
		{
			finish: {
				x: 6,
				y: 4
			},
			start: null,
			target: board.puck
		},
		{
			finish: {
				x: 13,
				y: 4
			},
			start: {
				x: 6,
				y: 4
			},
			target: board.puck
		}
	],
	playerTwoMoves = [
		{
			finish: {
				x: 6,
				y: 6
			},
			start: {
				x: 7,
				y: 5
			},
			target: board.actors[8]
		},
		{
			finish: {
				x: 5,
				y: 5
			},
			start: {
				x: 6,
				y: 6
			},
			target: board.actors[8]
		}
	];

/// tests
describe("turn", function () {
	var controller;
	
	board.placePuck({
		x: 4,
		y: 5
	});
	
	beforeEach(function () {
		controller = {
			board: board,
			view: {
				display: {
					moveActor: sinon.spy(),
					renderPuck: sinon.spy()
				}
			},
			emit: sinon.spy(),
			turns: []
		};
	});
	
	it("should initalize with a controller, owner, and empty future and " + 
	   "history", function () {
	   	// setup
		var turn = new Turn(controller, Player.One);
					
		// posttest
		expect(turn.controller).to.equal(controller);
		expect(turn.owner).to.equal(Player.One);
		expect(turn.future).to.be.empty;
		expect(turn.history).to.be.empty;
	});
	
	describe(".deserialize", function () {
		it("should load history and owner from serialized data", function () {
			// setup
			var firstMove = playerOneMoves[0],
				loadedTurn = new Turn(controller, Player.One),
				secondMove = playerOneMoves[1],
				turnToSave = new Turn(controller, Player.One);
				
			// execution
			turnToSave.recordMove(firstMove.target, firstMove.start, 
				firstMove.finish);
			
			turnToSave.recordMove(secondMove.target, secondMove.start,
				secondMove.finish);
			
			loadedTurn.deserialize(turnToSave.serialize());
			
			// posttest
			expect(loadedTurn).to.eql(turnToSave);
		});
	});
	
	describe(".finish", function () {
		it("should emit a 'finish turn' even if owner is Player " + 
		   "One", function () {
			// setup
			var firstMove = playerOneMoves[0],
				secondMove = playerOneMoves[1],
				turn = new Turn(controller, Player.One);
				
			// execution
			turn.recordMove(firstMove.target, firstMove.start, 
				firstMove.finish);
			
			turn.recordMove(secondMove.target, secondMove.start,
				secondMove.finish);
			
			// posttest
			expect(controller.emit.args[0][0]).to.equal("finish turn");
			expect(controller.emit.args[0][1]).to.eql(turn);
			expect(controller.emit.args[0][2]).to.equal(undefined);
		});
		
		it("should emit a 'finish turn' event if owner is Player " +
		   "Two", function () {
			// setup
			var firstMove = playerTwoMoves[0],
				secondMove = playerTwoMoves[1],
				turn = new Turn(controller, Player.Two);
				
			// execution
			turn.recordMove(firstMove.target, firstMove.start, 
				firstMove.finish);
			
			turn.recordMove(secondMove.target, secondMove.start,
				secondMove.finish);
			
			// posttest
			expect(controller.emit.args[0][0]).to.equal("finish turn");
			expect(controller.emit.args[0][1]).to.eql(turn);
			expect(controller.emit.args[0][2]).to.equal(undefined);
		});
	});
	
	describe(".recordMove", function () {
		it("should error on trying to record more than two moves", function () {
			// setup
			var failingFunc,
				move,
				turn = new Turn(controller, Player.One);
						
			// execution
			move = playerOneMoves[0];
			turn.recordMove(move.target, move.start, move.finish);
			
			move = playerOneMoves[1];
			turn.recordMove(move.target, move.start, move.finish);
			
			move = playerOneMoves[2];
			
			// posttest
			failingFunc = turn.recordMove
				.bind(turn, move.target, move.start, move.finish);
				
			expect(failingFunc).to.throw(Error, 
				"This turn has already been completed.");
		});
		
		it("should maintain score based on last turn's score", function () {
			// setup
			var expectedScore = {},
				move = playerOneMoves[2],
				turn = new Turn(controller, Player.One);
								
			expectedScore[Player.One] = 1;
			expectedScore[Player.Two] = 1;
				
			// create a mock turn to return a manually set score
			controller.turns = [{
				score: function () {
					var score = {};
					score[Player.One] = 1;
					score[Player.Two] = 1;
					
					return score;
				}
			}];
			
			// execution
			turn.recordMove(move.target, move.start, move.finish);
			
			// posttest
			expect(turn.score()).to.eql(expectedScore);
		});
	});
});