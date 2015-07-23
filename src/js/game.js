/* This file should direct the entire game, making sure the board and pieces are
 * being rendered properly 
 */

// create the game board
function generateBoard() {
	for (var x = 0; x < 14; x++) {
		board[x] = [];
		
		for (var y = 0; y < 8; y++) {
			board[x][y] = new Tile(settings.boardLayout[x][y], 
				x, y, tileWidth, tileHeight);
		}
	}
}