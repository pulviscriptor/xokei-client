module.exports = {
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
	borderWidth: 4,
	
	// what tile types the characters passed into the board layout indicate
	characterTypes: {
		"|": "wall",
		".": "fieldLight",
		"#": "fieldDark"
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
	
	// settings to use when rendering a symbol on a tile; topmost array contains
	// each line in the symbol; each line in turn consists of an array of points
	// which make up that line; units are in tenths of a tile
	symbols: {
		goal: {
			paths: [
				[[4, 4], [6, 6]],
				[[6, 4], [4, 6]]
			],
			stroke: {
				width: 2,
				dasharray: [6]
			}
		}
	},
	
	// how large a symbol should be in relation to the tile it is on
	symbolSize: 1,
	
	// the colors of the tiles on the field
	tileColors: {
		fieldDark: "#DDD",
		fieldLight: "white",
		wall: "#FFF"
	}
};