module.exports = {
	// what percent of the size of a tile the actors should be
	actorSize: 0.7,
	
	// the layout of the field
	boardLayout: [
		"|.#.#.#.#.#.#|",
		"|#.#.#.#.#.#.|",
		"|.#.#.#.#.#.#|",
		".#.#.#.#.#.#.#",
		"#.#.#.#.#.#.#.",
		"|#.#.#.#.#.#.|",
		"|.#.#.#.#.#.#|",
		"|#.#.#.#.#.#.|"
	],
	
	// borders are composed of rectangles aligned next to each other--this array
	// describes positions and dimensions for each, in units of tileSize that
	// are relative to the upper left of the board including walls
	borders: [
		// the left goal
		{
			x: 0,
			y: 3,
			width: 1,
			height: 2
		},
		// the left goal area
		{
			x: 1,
			y: 2,
			width: 2,
			height: 4
		},
		// the left field
		{
			x: 1,
			y: 0,
			width: 6,
			height: 8
		},
		// the right field
		{
			x: 7,
			y: 0,
			width: 6,
			height: 8
		},
		// the right goal area
		{
			x: 11,
			y: 2,
			width: 2,
			height: 4
		},
		// the right goal
		{
			x: 13,
			y: 3,
			width: 1,
			height: 2
		}
	],
	
	// the width of borders on and surrounding the field
	borderWidth: 3,
	
	// what tile types the characters passed into the board layout indicate
	characterTypes: {
		"|": "wall",
		".": "light",
		"#": "dark"
	},
	
	// the colors used to render the game
	colors: {
		actors: {
			player1: "#f6f676",
			player2: "#b67676"
		},
		field: {
			dark: "#ececec",
			light: "white",
			wall: "white"
		},
		puck: "#7f7fff"
	},
	
	// a function that should determine and return the owner of a tile at the 
	// specified coordinates
	determineTileOwner: function (x) {
		if (x < 7) {
			return "player1";
		} else {
			return "player2";
		}
	},
	
	// tiles representing goals
	goals: {
		player1: [{
			x: 0,
			y: 3
		}, {
			x: 0,
			y: 4
		}],
		player2: [{
			x: 13,
			y: 3
		}, {
			x: 13,
			y: 4
		}]
	},
	
	puckSize: 0.7,
	
	// the amount of time to wait before redrawing the board after the window is
	// resized in milliseconds
	resizeDelay: 100,
	
	// settings to use when rendering a symbol on a tile; topmost array contains
	// each line in the symbol; each line in turn consists of an array of points
	// which make up that line; units are in tenths of a tile
	symbols: {
		actor: {
			paths: [
				[[3.9, 3.9], [6.1, 6.1]],
				[[6.1, 3.9], [3.9, 6.1]]
			],
			stroke: {
				opacity: 0.6,
				width: 1.5
			}
		},
		goal: {
			paths: [
				[[3.9, 3.9], [6.1, 6.1]],
				[[6.1, 3.9], [3.9, 6.1]]
			],
			stroke: {
				dasharray: [4],
				width: 1.5
			}
		}
	}
};