var utils = require('./utils.js');
var settings = require("./settings");

function NotationReplay($el, controller) {
	this.$el = $el;
	this.controller = controller;
	this.view = controller.view;
	this.display = this.view.display;
	this.draw = this.display.draw;
	this.text = $el.text();

	this.destroyed = false;
	this.finished = false; // animation finished

	this.type = null; 	// move / place
	this.player = null; // 1 or 2
	this.actor = null;  // actor type - puck/player
	this.start = null;	// cords {x:x, y:y}
	this.path = [];     // array of cords {x:x, y:y}

	this.$actor = null;
	this.$group = null;

	this.$el.one('mouseout', this.destroy.bind(this));

	this.parseNotation();
}

NotationReplay.prototype = {
	destroy: function () {
		if(this.destroyed) return;
		this.destroyed = true;
		if(!this.$group) return;

		var replay = this;
		if(!this.finished) { // if animation playing
			this.$group.stop();
			replay.$actor.remove();
			replay.$group.remove();
		}else{
			this.$group.animate(settings.animationSpeed).style( 'opacity', 0)
				.after(function () {
					replay.$actor.remove();
					replay.$group.remove();
			});
		}

	},
	
	parseNotation: function () {
		// final score, nothing to show
		if(this.text.match(/^\d-\d$/i)) {
			return this.destroy();
		}

		// player
		if(this.text[0] == '1') {
			this.player = 1;
		}else if(this.text[0] == '2') {
			this.player = 2;
		}else{
			throw new Error('Unknown player side in notation: ' + this.text);
		}

		// type
		if(this.text[1] == 'r') {
			// resigned, nothing to show
			return this.destroy();
		}else if(this.text[1] == 'p'&& this.text.length == 4) {
			// puck placed
			this.type = 'place';
		}else{
			// move
			this.type = 'move';
		}

		// actor
		if(this.text[1] == 'p') {
			this.actor = 'puck';
			this.parseCords(this.text.substr(2));
		}else{
			this.actor = 'player';
			this.parseCords(this.text.substr(1));
		}

		this.createActor();
	},
	
	parseCords: function (str) {
		var moves = str.match(/.{2}/g);
		this.start = utils.notationToCoordinates(moves[0]);

		for(var i=1;i<moves.length;i++) {
			var move = moves[i];
			if(move == '++') continue;
			this.path.push(utils.notationToCoordinates(move));
		}
	},

	createActor: function () {
		this.$group = this.display.draw.nested()
			.move(this.start.x * this.display.tileSize,
				this.start.y * this.display.tileSize)
			.style( 'opacity', 0);


		if(this.actor == 'puck') {
			this.$actor = this.$group.circle(this.display.puckDiameter).addClass('puck-actor-notation-replay')
				.fill({
					color: settings.colors.puck,
					opacity: 1
				})
				.move(this.display.puckOffset, this.display.puckOffset);
		}else if(this.actor == 'player') {
			this.$group.addClass('actor-player').addClass('actor-player' + this.player);

			this.$actor = this.$group
				.circle(this.display.actorDiameter)
				.fill({
					color: settings.colors.actors['player' + this.player],
					opacity: 1
				})
				.move(this.display.actorOffset, this.display.actorOffset);

			if (this.player == 1) {
				//.data("actor", i);
				this.$group.use(this.display.symbols.x);
			} else if (this.player == 2) {
				var clip = this.$group
					.circle(this.display.actorDiameter)
					.move(this.display.actorOffset, this.display.actorOffset);
				this.$actor
					.stroke({
						width: settings.actorBorderWidth * 2,
						color: settings.colors.actors.border
					})
					.clipWith(clip);
			}
		}

		/*this.$group.animate(settings.animationSpeed).fill({
			opacity: 1
		});*/
		this.$group.animate(settings.animationSpeed).style( 'opacity', 1).after(this.animatePath.bind(this, this.start));

		//this.$group.style( 'opacity', 1);
	},

	animatePath: function (from_cord) {
		if(!this.path.length) {
			this.finished = true;
			return;
		}
		if(this.destroyed) return;

		var cord = this.path.shift();
		//var distance = this._dist(from_cord.x, from_cord.y, cord.x, cord.y);
		var distance = Math.max( Math.abs(Math.abs(from_cord.x)-Math.abs(cord.x)), Math.abs(Math.abs(from_cord.y)-Math.abs(cord.y)));

		this.$group.animate(Math.round(settings.animationSpeed*distance))
			.move(cord.x * this.display.tileSize,
				cord.y * this.display.tileSize)
			.after(this.animatePath.bind(this, cord));
	}

	/*
	// https://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas
	_diff: function (num1, num2) {
		if (num1 > num2) {
			return (num1 - num2);
		} else {
			return (num2 - num1);
		}
	},

	_dist: function (x1, y1, x2, y2) {
		var deltaX = this._diff(x1, x2);
		var deltaY = this._diff(y1, y2);
		var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
		return (dist);
	}*/
};

module.exports = NotationReplay;