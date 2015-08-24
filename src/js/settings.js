module.exports = (function (settings) {
	// process settings here, recursively iterating through all properties to 
	// load settings that are dependent on other settings
	var load = function (prop) {
		var setting,
			value;
		
		if (typeof prop === "object") {
			for (setting in prop) {
				prop[setting] = load(prop[setting]);
			}
		} else if (typeof prop === "string" && 
			prop[0] === "%" && 
			prop[prop.length - 1] === "%") {
			
			setting = prop.replace(/%/g, "").split(".");
			value = settings;
			
			while (setting.length) {
				value = value[setting.shift()];
			}
			
			return value;
		}
		
		return prop;
	};
	
	return Object.freeze(load(settings));
}({
	// the border on actors belonging to the second player
	actorBorderWidth: 6,
	
	// what percent of the size of a tile the actors should be
	actorSize: 0.7,
	
	// how long it should take an actor to animate from one tile to another, in
	// milliseconds
	animationSpeed: 150,
	
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
			player2: "#b67676",
			border: "#7f7f7f"
		},
		field: {
			dark: "#ececec",
			light: "white",
			valid: "green",
			wall: "white"
		},
		puck: "#7f7fff"
	},
	
	coordinates: {
		horizontal: ["[", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
			"l", "]"],
		vertical: ["8", "7", "6", "5", "4", "3", "2", "1"]
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
	
	// tiles representing specific zones on the board
	zones: {
		player1: {
			goal: [
				{
					x: 0,
					y: 3
				},
				{
					x: 0,
					y: 4
				}
			],
			
			endZone: [
				{
					x: 1,
					y: 2
				},
				{
					x: 2,
					y: 5
				}
			]
		},
		player2: {
			goal: [
				{
					x: 13,
					y: 3
				},
				{
					x: 13,
					y: 4
				}
			],
			
			endZone: [
				{
					x: 11,
					y: 2
				},
				{
					x: 12,
					y: 5
				}
			]
		}
	},
	
	// padding between the legend and the board, in pixels
	legendPadding: 10,
	
	// maximum amount of actors belonging to any player in that player's endzone
	maximumPlayersInEndZone: 2,
	
	// minimum tile size
	minimumTileSize: 50,
	
	// the size of the puck, relative to the normalized size of a tile
	puckSize: 0.7,
	
	// the amount of time to wait before redrawing the board after the window is
	// resized in milliseconds
	resizeDelay: 100,
	
	// settings to use when rendering a symbol on a tile; topmost array contains
	// each line in the symbol; each line in turn consists of an array of points
	// which make up that line; units are in tenths of a tile
	symbols: {
		player1Actor: {
			paths: [
				[[2.5, 2.5], [7.5, 7.5]],
				[[7.5, 2.5], [2.5, 7.5]]
			],
			stroke: {
				opacity: 1,
				width: "%actorBorderWidth%",
				color: "%colors.actors.border%"
			}
		}
	},
	
	// size of the green circle indicating that a move is valid
	validMoveIndicatorSize: 0.3
}));