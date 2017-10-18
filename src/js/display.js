/* Render the board to the DOM using SVG -- this is the view component of the
 * client
 */
"use strict"; 

/// requires
var Player = require("./players"),
	SVG = require("svg.js"),
	utils = require("./utils"),
	settings = require("./settings");

/// object
function Display(board) {
	/// public variables
	// get references to the DOM elements that contain the board
	this.$board = $("#board");
	this.$boardContainer = $("#board-container");
	this.$kickDirections = [];
	this.$moveBox = $(".move-container");
	
	this.actors = [];
	this.board = board;
	this.borders = [];
	this.highlight = null;
	this.highlightedTile = null;
	this.legend = {
		horizontal: [],
		vertical: []
	};
	this.puck = null;
	this.puckGhost = null;
	this.symbols = {};
	this.tiles = [];
	this.validKickDirectionIndicators = [];
	this.validKickIndicators = [];
	this.validMoveIndicators = [];
	this.validKicks = [];
	this.validMoves = [];
	
	// generate an SVG element to render the game to
	this.draw = SVG("board");
	
	// render the board
	this.createBoard();
	
	// properly size the move box based on the JavaScript determined height of
	// the game board
	this.$moveBox.height(this.$board.height() - this.$moveBox.position().top - 
		30 + Math.floor(settings.borderWidth / 2));
}

/// public functions
// remove styling from any tiles which have been marked as valid moves
Display.prototype = {
	// remove all actors from the board
	clear: function () {
		if (this.actors.length) {
			this.actors.forEach(function (actor) {
				actor.draw.remove();
			});
		}
		
		if (this.puck) {
			this.puck.group.remove();
		}
	},
	
	clearKickDirections: function () {
		this.$kickDirections.forEach(function ($kickIndicator) {
			$kickIndicator.animate({
				opacity: 0
			}, settings.animationSpeed / 2, function () {
				$(this).remove();
			});
		});
		
		this.$kickDirections.length = 0;
		
		this.validKickDirectionIndicators.forEach(function (kickIndicator) {
			kickIndicator.validKickDirection = false;
		});
		
		this.validKickDirectionIndicators.length = 0;
	},
	
	clearKickTrajectory: function () {
		var self = this;
		
		this.validKickIndicators.forEach(function (indicator) {
			indicator
				.animate(settings.animationSpeed)
				.fill({
					opacity: 0
				});
			
			setTimeout(function () {
				indicator.remove();
			}, settings.animationSpeed + 10);
		});
		
		this.validKicks.forEach(function (kick) {
			self.tiles[kick.x][kick.y].validKick = false;
		});
		
		this.validKickIndicators.length = 0;
		this.validKicks.length = 0;
	},
	
	clearPuckGhost: function () {
		if (!this.puckGhost) {
			return;
		}
		
		this.puckGhost.group.remove();
		this.puckGhost = null;
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
				draw: this.draw.nested().addClass('actor-player').addClass('actor-player' + (actor.owner === Player.One?'1':'2'))
					.style( 'opacity', (this.board.settings.owner == actor.owner ? '1' : settings.game.inactivePlayerOpacity) )
					.move(actor.x * this.tileSize, actor.y * this.tileSize)
			};
			
			this.actors[i].element = this.actors[i].draw
				.circle(this.actorDiameter)
				.fill(settings.colors.actors[actor.owner])
				.move(this.actorOffset, this.actorOffset)
				.data("actor", i);
			
			this.actors[i].element.style("cursor", "pointer");
			
			if (actor.owner === Player.One) {
				this.actors[i].symbol = this.actors[i].draw
					.use(this.symbols.x)
					.style("pointer-events", "none");
			} else if (actor.owner === Player.Two) {
				this.actors[i].clip = this.actors[i].draw
					.circle(this.actorDiameter)
					.move(this.actorOffset, this.actorOffset);
				
				this.actors[i].element
					.stroke({
						width: settings.actorBorderWidth * 2,
						color: settings.colors.actors.border
					})
					.clipWith(this.actors[i].clip);
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

		// create scores dots on sides of board
		this.createScorePoints();
		this.resizeScorePoints();
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
				fontFamily: "\"Lucida Console\", monospace",
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

	// create score points on sides of board
	createScorePoints: function () {
		//var boardHeight = this.$board.height();
		//var boardPos = this.$board.position();
		var $body = $('body');
		var $el;
		var i;

		for (i in settings.scorePoints.player1) {
			$el = $('<span class="score-point score-point-player1 hidden tlp" data-score="' + i +
				'" id="score-point-player1-' + i +
				'" style="background-color:' + settings.scorePoints.color +
				'" data-tooltip="Score point">&nbsp;</span>');
			$body.prepend($el);
		}

		for (i in settings.scorePoints.player2) {
			$el = $('<span class="score-point score-point-player2 hidden tlp" data-score="' + i +
				'" id="score-point-player2-' + i +
				'" style="background-color:' + settings.scorePoints.color +
				'" data-tooltip="Score point">&nbsp;</span>');
			$body.prepend($el);
		}
	},

	// resize and move score points on sizes of board
	resizeScorePoints: function () {
		var $el;
		var i;
		var settingsPos;
		var boardOffset = this.$board.offset();
		var boardHeight = this.$board.outerHeight();
		var boardWidth = this.$board.outerWidth();
		var scorePointSize = this.tileSize * (settings.scorePoints.size/100);

		for (i in settings.scorePoints.player1) {
			settingsPos = settings.scorePoints.player1[i];
			$el = $('#score-point-player1-' + i);
			$el.css({
				left: boardOffset.left + (boardWidth * (settingsPos.x/100) ) - ( scorePointSize/2 ) + 'px',
				top:  boardOffset.top + (boardHeight * (settingsPos.y/100) ) - ( scorePointSize/2 ) + 'px'
			});
		}

		for (i in settings.scorePoints.player2) {
			settingsPos = settings.scorePoints.player2[i];
			$el = $('#score-point-player2-' + i);
			$el.css({
				left: boardOffset.left + (boardWidth * (settingsPos.x/100) ) - ( scorePointSize/2 ) + 'px',
				top:  boardOffset.top + (boardHeight * (settingsPos.y/100) ) - ( scorePointSize/2 ) + 'px'
			});
		}

		$('.score-point').css({
			width:  scorePointSize + 'px',
			height: scorePointSize + 'px'
		});
	},

	// draw the puck
	createPuck: function (animationSpeed) {
		this.puck = {
			group: this.draw.nested()
				.move(this.board.puck.x * this.tileSize, 
					  this.board.puck.y * this.tileSize)
		};
		
		this.puck.element = this.puck.group.circle(this.puckDiameter).addClass('puck-actor')
			.fill({
				color: settings.colors.puck,
				opacity: 0
			})
			.move(this.puckOffset, this.puckOffset);
			
		this.puck.element.animate(animationSpeed || 0).fill({
			opacity: 1
		});
	},

	// deselect an actor if it is selected
	deselectActor: function (actorIndex) {
		var actor = this.board.actors[actorIndex],
			tile;
		
		this.clearValidMoves();
		
		if (!actor) {
			return;
		}
		
		tile = this.board.tiles[actor.x][actor.y];
		
		this.tiles[tile.x][tile.y].element
			.fill({
				color: settings.colors.field[tile.type],
				opacity: 1
			});
		
		this.actors[actorIndex].element
			.animate(settings.animationSpeed)
			.fill({
				color: settings.colors.actors[actor.owner]
			});
	},
	
	// prevent the mouse from interacting with actors
	disableActorMouseEvents: function () {
		this.actors.forEach(function (actor) {
			actor.element.style("pointer-events", "none");
		});
	},
	
	// allow the mouse to interact with actors
	enableActorMouseEvents: function () {
		this.actors.forEach(function (actor) {
			actor.element.style("pointer-events", null);
		});	
	},
	
	// highlight a tile either valid or invalid
	highlightTile: function (tile, valid) {
		this.highlight = this.draw.rect(this.tileSize, this.tileSize)
			.move(this.tileSize * tile.x, this.tileSize * tile.y)
			.fill({
				color: valid ?
					settings.colors.field.valid :
					settings.colors.field.invalid,
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

	// move an actor from one tile to another, with animation
	moveActor: function (index, callback) {
		this.actors[index].draw
			.animate(settings.animationSpeed)
			.move(this.board.actors[index].x * this.tileSize,
				  this.board.actors[index].y * this.tileSize)
			.after(callback);
	},
	
	// render the puck, wherever it currently is on the board
	renderPuck: function () {
		if (this.puck) {
			this.puck.group.move(this.board.puck.x * this.tileSize, 
								 this.board.puck.y * this.tileSize);
		}
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
		
		if (this.board.puck) {
			// resize puck
			this.puck.group.move(this.board.puck.x * this.tileSize, 
				this.board.puck.y * this.tileSize);
			this.puck.element
				.size(this.puckDiameter)
				.move(this.puckOffset, this.puckOffset);
		}
		
		// move and resize the legend appropriately
		this.updateLegend();
		
		// resize moves container appropriately
		this.$moveBox.height(this.$board.height() - 
			this.$moveBox.position().top - 30 + 
			Math.floor(settings.borderWidth / 2));

		// move and resize score points
		this.resizeScorePoints();
	},
	
	// size a symbol appropriately
	resizeSymbol: function (point) {
		return [Math.round(point[0] * this.tileSize * 0.1), 
				Math.round(point[1] * this.tileSize * 0.1)];
	},

	// select a specific actor
	selectActor: function (actor) {
		// cause the valid moves to be displayed on the board
		this.showValidMoves(actor);
		
		// highlight the tile this actor is sitting on
		this.tiles[actor.x][actor.y].element
			.fill({
				color: settings.colors.field.valid,
				opacity: 0.3
			});
	},
	
	showKick: function(trajectory, callback) {
		var self = this,
			step = function (next) {
				if (!next) {
					if (callback) {
						callback();
					}
					
					return;
				}
				
				self.puck.group
					.animate(settings.kickSpeed, "-")
					.move(next.x, next.y)
					.after(step.bind(this, trajectory.shift()));
			};
		
		trajectory = trajectory.map(function (tile) {
			return {
				x: tile.x * self.tileSize,
				y: tile.y * self.tileSize
			};
		});
		
		step(trajectory.shift());
	},
	
	showKickDirections: function (tiles) {
		var self = this;
		
		tiles.forEach(function (tile, i) {
			var $arrow,
				dx = tile.x - self.board.puck.x,
				dy = tile.y - self.board.puck.y;
			
			self.tiles[tile.x][tile.y].validKickDirection = true;
			self.validKickDirectionIndicators.push(self.tiles[tile.x][tile.y]);
				
			// show an arrow for each tile
			$arrow = $("<i>")
				.addClass("fa fa-arrow-right")
				.addClass("kick-direction-arrow")
				.addClass("kick-direction-arrow-" + i)
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
		
	showKickTrajectory: function (projection) {
		var self = this,
			diameter = this.tileSize * settings.validMoveIndicatorSize,
			offset = Math.round((this.tileSize - diameter) / 2);
		
		projection.forEach(function (tile, i) {
			var displayTile = self.tiles[tile.x][tile.y],
				indicator;
			
			// don't display two kick indicators on a single tile, and also
			// don't display a kick indicator on top of the puck
			if (self.validKicks.indexOf(displayTile) > -1 ||
				(tile.x === self.board.puck.x &&
				 tile.y === self.board.puck.y)) {
				
				return;
			}
			
			indicator = self.draw.circle(diameter)
					.addClass('valid-puck-move-circle')
					.move((self.tileSize * tile.x) + offset, 
						(self.tileSize * tile.y) + offset)
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
			
			displayTile.validKick = true;
			
			self.validKickIndicators.push(indicator);
			self.validKicks.push(displayTile);
		});
	},
	
	showPuckGhost: function (position) {
		this.puckGhost = {
			group: this.draw.nested()
				.move(position.x * this.tileSize, 
					  position.y * this.tileSize)
		};
		
		this.puckGhost.element = this.puckGhost.group.circle(this.puckDiameter)
			.fill({
				color: settings.colors.puck,
				opacity: 0
			})
			.move(this.puckOffset, this.puckOffset)
			.style("pointer-events", "none")
			.animate(settings.animationSpeed)
			.fill({
				opacity: 0.3
			});
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
					.style("pointer-events", "none")
					.addClass('valid-move-circle')
					.addClass('valid-move-circle-' + i);
			
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
		
		// clear reference to the SVG object -- just because it has been removed
		// from the DOM doesn't mean we aren't still maintaining a reference to
		// it, so manually set that reference to null
		this.highlight = null;
		
		this.highlightedTile.element.style("cursor", "default");
		
		// again, explicitly destroy reference to SVG object
		this.highlightedTile = null;
	},

	// update the size and position of a single actor
	updateActor: function (index) {
		var actor = this.board.actors[index];
		
		this.actors[index].draw
			.move(actor.x * this.tileSize, actor.y * this.tileSize);
			
		this.actors[index].element
			.size(this.actorDiameter)
			.move(this.actorOffset, this.actorOffset);
		
		if (actor.owner === Player.Two) {
			this.actors[index].clip
				.size(this.actorDiameter)
				.move(this.actorOffset, this.actorOffset);
		}
		
		if (this.actors[index].symbol) {
			this.actors[index].symbol.remove();
			this.actors[index].symbol = this.actors[index].draw
				.use(this.symbols.x)
				.style("pointer-events", "none");
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
	},
	
	// expand or collapse notations
	notationsExpandCollapse: function ($el) {
		var type = $el.data('type');
		var gameID = $el.data('gameid');
		var $table = $el.closest('table');

		if($table.hasClass('notation-expanded')) {
			var html = utils.notation["collapsedHTML" + type](this.board.gamesHistory[gameID]["notation_" + type]);
			// if there is not enough text to collapse
			if(!html) return;

			$table.removeClass('notation-expanded');
			$table.addClass('notation-collapsed');
			$el.addClass('fa-chevron-right');
			$el.removeClass('fa-chevron-down');

			$('.notation-area-' + type + '-' + gameID).html(html);
		}else{
			$table.addClass('notation-expanded');
			$table.removeClass('notation-collapsed');
			$el.removeClass('fa-chevron-right');
			$el.addClass('fa-chevron-down');

			$('.notation-area-' + type + '-' + gameID).html(utils.notation["expandedHTML" + type](this.board.gamesHistory[gameID]["notation_" + type]));
		}
	},

	notationRecalculateExpandAllIcon: function () {
		if($('.notation-collapsed:visible').length === 0) {
			// all notations expanded
			$('.move-expand-all')
				.removeClass('fa-rotate-45')
				.removeClass('fa-chevron-right')
				.addClass('fa-chevron-down')
				.data('state', '1');
		}else if($('.notation-expanded:visible').length === 0) {
			// all notations collapsed
			$('.move-expand-all')
				.removeClass('fa-rotate-45')
				.removeClass('fa-chevron-down')
				.addClass('fa-chevron-right')
				.data('state', '3');
		}else{
			// part of notations collapsed/expanded
			$('.move-expand-all')
				.addClass('fa-rotate-45')
				.removeClass('fa-chevron-down')
				.addClass('fa-chevron-right')
				.data('state', '2');
		}
	},
	
	notationExpandAll: function () {
		var $expandAllIcon = $('.move-expand-all');
		var state = $expandAllIcon.data('state');
		if(state == '1') {
			$('.notation-expanded:visible .notation-expand-collapse-icon').click();
			this.notationRecalculateExpandAllIcon();
		}else{
			$('.notation-collapsed:visible .notation-expand-collapse-icon').click();
			this.notationRecalculateExpandAllIcon();
		}
	}
};

/// exports
module.exports = Display;
