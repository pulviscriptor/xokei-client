function Board(game, clone) {
	this.game = game;
	this.owner = null; // whos turn is now
	this.state = null; // state of game

	this.tiles = [];

	if(clone) {
		this.build(clone);
	}else{
		this.build();
		this.fill();
	}
}

Board.prototype = {
	ACTORS: {
		PLAYER1: '1',
		PLAYER2: '2',
		PUCK: 'P',
		NULL: false
	},

	build: function (clone) {
		for (var x = 0; x <= 13; x++) {
			this.tiles[x] = [];
			for (var y = 0; y <= 7; y++) {
				this.tiles[x][y] = clone ? clone.tiles[x][y] : this.ACTORS.NULL;
			}
		}
	},

	fill: function () {
		this.tiles[0][4] = this.ACTORS.PLAYER1;
		this.tiles[6][0] = this.ACTORS.PLAYER1;
		this.tiles[6][2] = this.ACTORS.PLAYER1;
		this.tiles[6][5] = this.ACTORS.PLAYER1;
		this.tiles[6][7] = this.ACTORS.PLAYER1;

		this.tiles[13][3] = this.ACTORS.PLAYER2;
		this.tiles[7][0]  = this.ACTORS.PLAYER2;
		this.tiles[7][2]  = this.ACTORS.PLAYER2;
		this.tiles[7][5]  = this.ACTORS.PLAYER2;
		this.tiles[7][7]  = this.ACTORS.PLAYER2;
	},

	findActors: function (actor) {
		var ret = [];
		for(var x=0;x<this.tiles.length;x++) {
			for(var y=0;y<this.tiles[x].length;y++) {
				if(this.tiles[x][y] == actor)  {
					ret.push({x: x, y: y});
				}
			}
		}
		return ret;
	},

	placePuck: function (cord) {
		var placed_puck = this.findActors(this.ACTORS.PUCK);
		if(placed_puck.length) throw new Error('Puck already placed at ' + (placed_puck[0].x) + ',' + (placed_puck[0].y));
		var tile = this.tiles[cord.x][cord.y];
		if(tile != this.ACTORS.NULL) throw new Error('Actor(' + tile + ') already placed at ' + (placed_puck[0].x) + ',' + (placed_puck[0].y));
		this.tiles[cord.x][cord.y] = this.ACTORS.PUCK;
	},

	moveActor: function (from, to) {
		if(!from) throw new Error('cord.from is missing');
		if(!to) throw new Error('cord.to is missing');

		var tile_from = this.tiles[from.x][from.y];
		if(tile_from == this.ACTORS.NULL) throw new Error('tile_from (' + tile_from + ') is not ACTORS.NULL');

		var tile_to = this.tiles[to.x][to.y];
		if(tile_to != this.ACTORS.NULL) throw new Error('tile_to (' + tile_from + ') is already occupied (' + tile_to + ')');

		this.tiles[to.x][to.y] = this.tiles[from.x][from.y];
		this.tiles[from.x][from.y] = this.ACTORS.NULL;
	}
};

module.exports = Board;