// This code was made long time ago and probably needs to be rewrited
Logger.last = (+new Date);

function Logger(id) {
	this.id = id;
}

Logger.prototype.info = function(text) {
	var msg = this.formatToLog(1, text);

	console.log(msg);
};

Logger.prototype.warn = function(text) {
	var msg =  this.formatToLog(3, text);

	console.error(msg);
};

Logger.prototype.error = function(e) {
	var logger = this;
	var msg;

	if(!(e instanceof Error)) {
		e = new Error(logger.formatToLog(2, e));
	}

	console.error(e);
	/*e.stack.split('\n').slice(1).map(function (line) {
		msg = logger.formatToLog(2, line);
		console.log(msg);
	});*/
};

Logger.prototype.formatToLog = function(type, text) {
	var out = '';

	out += this.getDate();
	out += ' ';

	out += '(' + this.id + ')';
	out += ' ';

	if(type == 2)
		out += 'ERROR' + ' ';

	if(type == 3)
		out += 'WARNING' + ' ';

	out += text;
	out += ' ' + Logger.delta();

	return out;
};

Logger.prototype.getDate = function() {
	var d = new Date();
	return (
		("00" + (d.getDate())).slice(-2) + "." +
		("00" + (d.getMonth() + 1)).slice(-2) + "." +
		d.getFullYear() + " " +
		("00" + d.getHours()).slice(-2) + ":" +
		("00" + d.getMinutes()).slice(-2) + ":" +
		("00" + d.getSeconds()).slice(-2)
	);
};

Logger.delta = function() {
	var current = (+new Date);
	var diff = current - Logger.last;
	var ret = '+' + diff + 'ms';
	Logger.last = current;

	return ret;
};

module.exports = Logger;
