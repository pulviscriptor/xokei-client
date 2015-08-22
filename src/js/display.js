/* Render the board to the DOM using SVG -- this is the view component of the
 * client
 */
"use strict"; 

/// requires
var SVG = require("svg.js"),
	settings = require("./settings");

require("jquery-knob");

/// object
function Display(board) {
	/// public variables
	// get references to the DOM elements that contain the board
	this.$board = $("#board");
	this.$boardContainer = $("#board-container");
	this.$kickDirections = [];
	this.$knob = $("#kick-strength-knob");
	this.$moveBox = $(".move-container");
	
	this.actors = [];
	this.board = board;
	this.borders = [];
	this.highlight = null;
	this.highlightedTile = null;
	this.kickProjectionLine = null;
	this.legend = {
		horizontal: [],
		vertical: []
	};
	this.puck = null;
	this.symbols = {};
	this.tiles = [];
	this.validKickIndicators = [];
	this.validMoveIndicators = [];
	this.validMoves = [];
	
	// generate an SVG element to render the game to
	this.draw = SVG("board");
	
	// render the board
	this.createBoard();
	
	// properly size the move box based on the JavaScript determined height of
	// the game board
	this.$moveBox.height(this.$board.height() - this.$moveBox.position().top - 
		30 + Math.floor(settings.borderWidth / 2));
	
	// create and hide the kick strength knob
	this.$knob
		.knob({
			bgColor: "#333",
			fgColor: settings.colors.field.valid,
			width: this.tileSize * 2
		})
		.css({
			position: "absolute",
			opacity: 0.3
		})
		.hide();
}

/// public functions
// remove styling from any tiles which have been marked as valid moves
Display.prototype = {
	clearKickDirections: function () {
		this.$kickDirections.forEach(function ($kickIndicator) {
			$kickIndicator.animate({
				opacity: 0
			}, settings.animationSpeed / 2, function () {
				$(this).remove();
			});
		});
		
		this.$kickDirections.length = 0;
		
		this.validKickIndicators.forEach(function (kickIndicator) {
			kickIndicator.validKickDirection = false;
		});
		
		this.validKickIndicators.length = 0;
	},
	
	clearKickProjection: function () {
		var self = this;
		
		if (!this.kickProjectionLine) {
			return;
		}
		
		this.kickProjectionLine
			.animate(settings.animationSpeed)
			.stroke({
				opacity: 0
			});
			
		setTimeout(function () {
			self.kickProjectionLine.remove();
			self.kickProjectionLine = null;
		}, settings.animationSpeed + 10);
	},
	
	clearValidMoves: function () {
		var self = this;
		
		this.validMoveIndicators.forEach(function (indicator) {
			indicator.remove();
		});
		
		this.validMoves.forEach(function (move) {
			self.tiles[move.x][move.y].validMove = false;
		});
		
		this.validMoveIndicators.length = 0;
		this.validMoves.length = 0;
	},

	// draw and store the actors
	createActors: function () {
		var actor,
			i;
		
		// draw actors
		for (i = 0; i < this.board.actors.length; i++) {
			actor = this.board.actors[i];
			
			this.actors[i] = {
				draw: this.draw.nested()
					.move(actor.x * this.tileSize, actor.y * this.tileSize)
			};
			
			this.actors[i].element = this.actors[i].draw
				.circle(this.actorDiameter)
				.fill(settings.colors.actors[actor.owner])
				.move(this.actorOffset, this.actorOffset)
				.data("actor", i);
				
			if (actor.owner === "player1") {
				this.actors[i].symbol = this.actors[i].draw
					.use(this.symbols.player1Actor)
					.style("pointer-events", "none");
			} else if (actor.owner === "player2") {
				this.actors[i].element.stroke({
					width: settings.actorBorderWidth
				});
			}
			
			if (actor.owner === this.board.settings.owner) {
				this.actors[i].element.style("cursor", "pointer");
			}
		}
	},

	// draw the board (tiles and borders) to the DOM
	createBoard: function () {
		var border,
			i,
			x,
			y;
		
		// make sure the board is the appropriate size, and the tileSize 
		// variable is determined as well
		this.sizeBoard();
		
		// render symbols passed in in the settings file for later use
		this.renderSymbols();
		
		// draw tiles
		for (x = 0; x < this.board.width; x++) {
			this.tiles[x] = [];
			
			for (y = 0; y < this.board.height; y++) {
				// draw the tile
				this.tiles[x][y] = {
					element: this.draw.rect(this.tileSize, this.tileSize),
					x: x,
					y: y
				};
				
				this.tiles[x][y].element
					.move(x * this.tileSize, y * this.tileSize)
					.attr("fill", settings.colors.field
						[this.board.tiles[x][y].type])
					.data("position", {x: x, y: y});
			}
		}
		
		// draw borders
		for (i = 0; i < settings.borders.length; i++) {
			border = settings.borders[i];
			this.borders[i] = this.draw.rect(border.width * this.tileSize, 
					border.height * this.tileSize)
				.move(border.x * this.tileSize, border.y * this.tileSize)
				.fill({
					opacity: 0
				})
				.stroke({
					color: "black",
					width: settings.borderWidth
				})
				.style("pointer-events", "none");
		}
		
		// create the legend--that is, the elements that contain the characters 
		// that represent the coordinate system for the board
		this.createLegend();
	},

	// create the HTML elements that will contain the coordinates for the board
	createLegend: function () {
		var boardHeight = this.$board.height(),
			boardPos = this.$board.position(),
			self = this,
			x,
			y;
		
		function $createMarker() {
			return $("<div>").css({
				position: "absolute",
				textAlign: "center",
				fontSize: "28px",
				paddingRight: "10px",
				fontFamily: "\"Lucido Console\", monospace",
				userSelect: "none"
			}).appendTo(self.$boardContainer);
		}
		
		// create horizontal legend
		for (x = 0; x < this.board.width; x++) {
			this.legend.horizontal.push($createMarker().css({
				top: (boardPos.top + boardHeight + settings.legendPadding),
				left: (x * this.tileSize + boardPos.left),
				width: this.tileSize
			}).text(settings.coordinates.horizontal[x]));
		}
		
		// create vertical legend
		for (y = 0; y < this.board.height; y++) {
			this.legend.vertical.push($createMarker().css({
				top: (y * this.tileSize + boardPos.top),
				left: 0,
				height: this.tileSize,
				lineHeight: this.tileSize + "px"
			}).text(settings.coordinates.vertical[y]));
		}
	},

	// draw the puck
	createPuck: function () {
		this.puck = {
			group: this.draw.nested()
				.move(this.board.puck.x * this.tileSize, 
					  this.board.puck.y * this.tileSize)
		};
		
		this.puck.element = this.puck.group.circle(this.puckDiameter)
			.fill(settings.colors.puck)
			.move(this.puckOffset, this.puckOffset);
	},

	// deselect an actor if it is selected
	deselectActor: function () {		
		this.clearValidMoves();
		this.unhighlightTile();
	},

	// move an actor from one tile to another, with animation
	moveActor: function (index) {
		this.actors[index].draw
			.animate(settings.animationSpeed)
			.move(this.board.actors[index].x * this.tileSize,
				  this.board.actors[index].y * this.tileSize);
	},
	
	hideKickStrengthInput: function () {
		this.$knob.parent().hide(settings.animationSpeed);
	},

	// highlight a tile either valid or invalid
	highlightTile: function (tile, valid) {
		this.highlight = this.draw.rect(this.tileSize, this.tileSize)
			.move(this.tileSize * tile.x, this.tileSize * tile.y)
			.fill({
				color: valid ? settings.colors.field.valid : "red",
				opacity: 0
			})
			.style("pointer-events", "none");
			
		this.highlightedTile = this.tiles[tile.x][tile.y];
		this.highlightedTile.element.style("cursor", "pointer");
		
		this.highlight
			.animate(100)
			.fill({
				opacity: 0.3
			});
	},
	
	// prerender symbols at a certain tileSize
	renderSymbols: function () {
		var i,
			paths,
			symbolName;
		
		// prerender symbols based on tileSize
		for (symbolName in settings.symbols) {
			paths = settings.symbols[symbolName].paths;
			
			// store a reference to this symbol
			this.symbols[symbolName] = this.draw.symbol();
			
			// actually add the lines to this symbol
			for (i = 0; i < paths.length; i++) {
				this.symbols[symbolName]
					.polyline(paths[i].map(this.resizeSymbol.bind(this)))
					.fill("none")
					.stroke(settings.symbols[symbolName].stroke);
			}
		}
	},

	// resize board
	resizeBoard: function () {
		var border,
			i,
			x,
			y;
		
		// update tile and board size
		this.sizeBoard();
		
		// re-render symbols
		this.renderSymbols();
		
		// resize tiles
		for(x = 0; x < this.board.width; x++) {
			for (y = 0; y < this.board.height; y++) {
				this.updateTile(x, y);
			}
		}
		
		// resize borders
		for (i = 0; i < this.borders.length; i++) {
			border = settings.borders[i];
			this.borders[i].size(border.width * this.tileSize, 
								 border.height * this.tileSize)
				.move(border.x * this.tileSize, border.y * this.tileSize);
		}
		
		// resize actors	
		for (i = 0; i < this.actors.length; i++) {
			this.updateActor(i);
		}
		
		// resize puck
		this.puck.group.move(this.board.puck.x * this.tileSize, 
			this.board.puck.y * this.tileSize);
		this.puck.element
			.size(this.puckDiameter)
			.move(this.puckOffset, this.puckOffset);
		
		// move and resize the legend appropriately
		this.updateLegend();
		
		// resize moves container appropriately
		this.$moveBox.height(this.$board.height() - 
			this.$moveBox.position().top - 30 + 
			Math.floor(settings.borderWidth / 2));
	},
	
	// size a symbol appropriately
	resizeSymbol: function (point) {
		return [point[0] * this.tileSize * 0.1, 
				point[1] * this.tileSize * 0.1];
	},

	// select a specific actor
	selectActor: function (actor) {
		// cause the valid moves to be displayed on the board
		this.showValidMoves(actor);
	},
	
	showKick: function() {
		
	},
	
	showKickDirections: function (tiles) {
		var self = this;
		
		tiles.forEach(function (tile) {
			var $arrow,
				dx = tile.x - self.board.puck.x,
				dy = tile.y - self.board.puck.y;
			
			self.tiles[tile.x][tile.y].validKickDirection = true;
			self.validKickIndicators.push(self.tiles[tile.x][tile.y]);
				
			// show an arrow for each tile
			$arrow = $("<i>")
				.addClass("fa fa-arrow-right")
				.css({
					position: "absolute",
					left: self.board.puck.x * self.tileSize,
					top: self.board.puck.y * self.tileSize,
					transform: "rotate(" + Math.atan2(dy, dx) + "rad)",
					fontSize: "2.5em",
					opacity: 0,
					pointerEvents: "none",
					color: settings.colors.field.valid
				})
				.appendTo(self.$board);
				
			$arrow.animate({
				left: (self.tileSize * tile.x) + 
					(self.tileSize - $arrow.width()) / 2,
				top: (self.tileSize * tile.y) + 
					(self.tileSize - $arrow.height()) / 2,
				opacity: 0.3
			}, settings.animationSpeed, "easeOutBack");
		
			self.$kickDirections.push($arrow);
		});
	},
	
	// display the UI that allows the player to select how hard to kick the puck
	showKickStrengthInput: function () {
		var boardPos = this.$board.offset();
		
		this.$knob
			.parent()
			.css({
				left: (this.board.puck.x * this.tileSize + boardPos.left) -
					this.tileSize / 2,
				top: (this.board.puck.y * this.tileSize + boardPos.top) -
					this.tileSize / 2
			})
			.show();
	},
	
	showPuckTrajectory: function (projection) {
		var self = this;
		
		projection = projection.map(function (tile) {
			return [(tile.x * self.tileSize) + self.tileSize / 2,
				(tile.y * self.tileSize) + self.tileSize / 2];
		});
		
		this.kickProjectionLine = this.kickProjectionLine ||
			this.draw.polyline([projection[0]])
			.fill("none")
			.stroke({
				width: 8,
				color: settings.colors.field.valid,
				opacity: 0.3
			})
			.attr("stroke-linecap", "round")
			.attr("stroke-linejoin", "round");
		
		this.kickProjectionLine.animate(settings.animationSpeed)
			.plot(projection);
	},

	// display the moves that a particular player can make
	showValidMoves: function (actor) {
		var self = this;
		
		// determine valid moves for this actor by getting the tiles around the 
		// tile it is sitting on, and then checking if the are valid places to 
		// move to
		this.validMoves = actor.tile
			.neighborhood()
			.filter(actor.evaluateMove.bind(actor));
		
		this.validMoves.forEach(function (move, i) {
			var diameter = self.tileSize * settings.validMoveIndicatorSize,
				offset = Math.round((self.tileSize - diameter) / 2),
				indicator = self.draw.circle(diameter)
					.move((self.tileSize * move.x) + offset, 
						(self.tileSize * move.y) + offset)
					.fill({
						color: settings.colors.field.valid,
						opacity: 0
					})
					.style("pointer-events", "none");
			
			setTimeout(function () {
				indicator.animate(settings.animationSpeed).fill({
					opacity: 0.3
				});
			}, i * 10);
			
			self.tiles[move.x][move.y].validMove = true;
			self.validMoveIndicators.push(indicator);
		});
	},

	// size the board based on the container size, and update the various size
	// variables so that they can be used for rendering later
	sizeBoard: function () {
		// determine the current this.tileSize based on the sizes of the DOM 
		// elements that the board will be drawn in
		this.tileSize = Math.floor(Math.min(this.$boardContainer.height() / 
			(this.board.height + 1), this.$boardContainer.width() /
			(this.board.width + 1)) + 0.5);
		
		// make sure this.tileSize doesn't get too small
		this.tileSize = Math.max(this.tileSize, settings.minimumTileSize);
		
		// size actors
		this.actorDiameter = Math.round(this.tileSize * settings.actorSize);
		this.actorOffset = Math.round((this.tileSize - this.actorDiameter) / 2);
		
		// size puck
		this.puckDiameter = Math.round(settings.puckSize * this.tileSize);
		this.puckOffset = Math.round((this.tileSize - this.puckDiameter) / 2);
		
		// resize the DOM element the SVG elements representing board reside in
		this.$board
			.height(this.tileSize * this.board.height)
			.width(this.tileSize * this.board.width);
		
		$(".container").css("min-width", settings.minimumTileSize * 22 + "px");
	},

	// unhighlight a previously highlighted tile
	unhighlightTile: function () {
		if (!this.highlight) {
			return;
		}
		
		this.highlight.remove();
		this.highlight = null;
		
		this.highlightedTile.element.style("cursor", "default");
		this.highlightedTile = null;
	},

	// update the size and position of a single actor
	updateActor: function (index) {
		var actor = this.board.actors[index];
		this.actors[index].draw.move(actor.x * this.tileSize, 
			actor.y * this.tileSize);
		this.actors[index].element.size(this.actorDiameter)
			.move(this.actorOffset, this.actorOffset);
		
		if (this.actors[index].symbol) {
			this.actors[index].symbol.remove();
			this.actors[index].symbol = this.actors[index].draw
				.use(this.symbols.player1Actor);
		}
	},

	// reposition the elements in the legend
	updateLegend: function () {
		var boardHeight = this.$board.height(),
			boardPos = this.$board.position(),
			self = this;
			
		// create horizontal legend
		this.legend.horizontal.forEach(function ($elem, x) {
			$elem.css({
				top: (boardPos.top + boardHeight + settings.legendPadding),
				left: (x * self.tileSize + boardPos.left),
				width: self.tileSize
			});
		});
		
		this.legend.vertical.forEach(function ($elem, y) {
			$elem.css({
				top: (y * self.tileSize + boardPos.top) + "px",
				left: 0,
				height: self.tileSize + "px",
				lineHeight: self.tileSize + "px"
			});
		});
	},

	// update the size of a single tile (and its possible element)
	updateTile: function (x, y) {
		this.tiles[x][y].element
			.size(this.tileSize, this.tileSize)
			.move(x * this.tileSize, y * this.tileSize);
	}
};

/// exports
module.exports = Display;