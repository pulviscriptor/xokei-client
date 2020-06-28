var notation_str = '\r\n' +
'[Game "1"]\r\n' +
'[Date "2019-03-19 18:51:50+02"]\r\n' +
'[White "Player 1"]\r\n' +
'[Black "["TOP2"]"]\r\n' +
'[Result "6-0"]\r\n' +
'\r\n' +
'\r\n' +
'1pf5 2g6g7f7 1pf5j1]4+ 2pg4 1f6g5h5 2g6g5 2pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4++ 6-0\r\n';

var NotationDisplay = require('./notationDisplay');
var NotationParser = require('./notationParser');
var parsed = new NotationParser(notation_str);


module.exports = function () {
    var display = new NotationDisplay();
    display.loadBoard(parsed.games[0].moves[1].board);
}