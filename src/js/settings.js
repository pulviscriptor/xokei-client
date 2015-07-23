module.exports = {
	// the layout of the field
	boardLayout: [
		"---.#---".split(""),
		".#.#.#.#".split(""),
		"#.#.#.#.".split(""),
		".#.#.#.#".split(""),
		"#.#.#.#.".split(""),
		".#.#.#.#".split(""),
		"#.#.#.#.".split(""),
		".#.#.#.#".split(""),
		"#.#.#.#.".split(""),
		".#.#.#.#".split(""),
		"#.#.#.#.".split(""),
		".#.#.#.#".split(""),
		"#.#.#.#.".split(""),
		"---#.---".split("")
	],
	// borders are composed of six rectangles aligned next to each other--this
	// array describes positions and dimensions for each, in units of tileSize
	// that are relative to the upper left of the board including walls
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
	// the colors of the tiles on the field
	tileColors: {
		fieldDark: "#CCC",
		fieldLight: "white",
		wall: "#FFF"
	}
};