var notation_str = `
[Game "1"]
[Date "2019-03-19 18:51:50+02"]
[White "Player 1"]
[Black "["TOP2"]"]
[Result "6-0"]


1pf5 2g6g7f7 1pf5j1]4+ 2pg4 1f6g5h5 2g6g5 2pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4++ 6-0

[Game "2"]
[Date "2019-03-22 18:51:50+02"]
[White "Player 1"]
[Black "["TOP2"]"]
[Result "6-0"]


1pf5 2g6g7f7 1pf5j1]4+ 2pg4 1f6g5h5 2g6g5 2pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4+ 2pg4 1pg4j1]4++ 6-0



`;

var NotationParser = require('./notationParser');
var parsed = new NotationParser(notation_str);

console.log('--------------------');
console.log(require('util').inspect(parsed.games[0].moves[1].board));