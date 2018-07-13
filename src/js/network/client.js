var Logger = require('./logger');
var processors = require('./processors');
var utils = require('./../utils');
Client.prototype.VERSION = '1.0.0';

//todo timeout if we did not received Welcome
//todo create windows with "Create private game" and "Join any game"
//todo remove hash from URL when disconnected

function Client(controller, settings, opt) {
	this.log = new Logger('Client');

	this.debug = 3; // debug level 0-3
	this.controller = controller;
	this.board = controller.board;
	this.settings = settings;
	this.opt = opt;
	this.connected = false;	// in case of close event we should know if we were connected
	this.dead = false; // is this client dead and messages should be sent?
	this.timers = {
		connect: null
	};
	this.queue = []; // packet queue
	this.busy = false; // processing packet
	this.onPacketProcess = null; // even for tests

	this.side = null;

	this.ws = new WebSocket(this.settings.server);

	if(this.debug >= 1)
		this.log.info('Connecting to ' + this.settings.server);

	this.attachEvents();
	this.initTimers();
}

Client.prototype.attachEvents = function () {
	if(this.debug >= 3)
		this.log.info('attachEvents()');

	this.ws.onopen = this.onOpen.bind(this);
	this.ws.onclose = this.onClose.bind(this);
	this.ws.onmessage = this.onMessage.bind(this);
	this.ws.onerror = this.onError.bind(this);
};

Client.prototype.initTimers = function () {
	var client = this;

	if(this.debug >= 3)
		this.log.info('initTimers()');

	this.timers.connect = setTimeout(function () {
		client.kill('Connection timeout');
	}, this.settings.connectTimeout);
};

Client.prototype.onOpen = function () {
	if(this.debug >= 1)
		this.log.info('Connected');

	if(this.dead) {
		this.ws.close();
		if(this.debug >= 1)
			this.log.info('Client is dead, closing connection');
	}else{
		this.connected = true;
	}
};

Client.prototype.onClose = function (event) {
	if(this.debug >= 1)
		this.log.info('Disconnected | code: ' + event.code + ' | reason: ' + event.reason);

	if(this.dead) {
		this.connected = false;
		if(this.debug >= 1)
			this.log.info('Disconnected while client already dead. Ignoring this call');
	}else{
		if(this.connected) {
			this.connected = false;
			this.kill('Connection lost (' + event.code + ')');
		}else{
			this.kill('Failed to connect (' + event.code + ')');
		}
	}
};

Client.prototype.onMessage = function (event) {
	if(this.debug >= 3)
		this.log.info('RECV: ' + event.data);

	if(this.dead) {
		if(this.debug >= 1)
			this.log.warn('Client is dead, ignoring packet');
		return;
	}

	this.queue.push(event.data);

	if(!this.busy) this.processNextPacket();
};

Client.prototype.onError = function (e) {
	if(this.debug >= 1)
		this.log.error('Websocket error: ' + e);
};

Client.prototype.kill = function (reason, silent) {
	if(this.dead) {
		if(this.debug >= 1)
			this.log.error('Attempted to kill Client with reason "' + reason + '" but it is already dead with reason "' + this.dead + '"');
		return;
	}

	if(this.debug >= 1)
		this.log.info('Kill reason: ' + reason + ' | Connected: ' + this.connected);

	this.dead = reason;
	this.controller.client = null;
	this.controller.setUIState('game inactive');
	if(!silent) this.controller.view.network.killed(reason);
	this.clearTimers();

	if(this.connected) {
		this.ws.close();
	}

	utils.hash.set('');
};

Client.prototype.clearTimers = function () {
	if(this.debug >= 3)
		this.log.info('clearTimers()');

	if(this.timers.connect) clearTimeout(this.timers.connect);
};

Client.prototype.send = function () {
	var args = Array.prototype.slice.call(arguments);
	var json = JSON.stringify(args);

	if(this.ws.readyState != this.ws.OPEN) {
		if(this.debug >= 1)
			this.log.warn('Attempted to send: ' + json + ' | But readyState=' + this.ws.readyState + ' | Ignoring this call');
	}else{
		if(this.debug >= 3)
			this.log.info('SEND: ' + json);

		this.ws.send(json);
	}
};

Client.prototype.processNextPacket = function () {
	if(this.busy) return;
	var data = this.queue.shift();
	if(!data) return;

	var client = this;

	if(this.debug >= 3)
		this.log.info('processNextPacket: ' + data);


	try {
		var obj = JSON.parse(data);
	}catch (e){
		this.log.error(e);
		if(this.onPacketProcess) this.onPacketProcess(data);
		this.processNextPacket();
		return;
	}

	var cmd = obj[0];
	var processor = processors[cmd];
	if(!processor) {
		this.log.error('Processor not found for packet: ' + event.data);
		if(this.onPacketProcess) this.onPacketProcess(data);
		this.processNextPacket();
	}else{
		try {
			var timeout = setTimeout(function () {
				client.busy = false;
				if(client.onPacketProcess) client.onPacketProcess(data);
				client.processNextPacket();
				throw new Error('Processor did not called done() in time while processing: ' + data);
			}, 10000);
			var processed = false;
			this.busy = true;

			var params = obj.slice(1);
			params.unshift(function () {
				if(processed) return;
				processed = true;
				client.busy = false;
				clearTimeout(timeout);
				if(client.onPacketProcess) client.onPacketProcess(data);
				client.processNextPacket();
			});

			processor.apply(this, params);
		}catch (e){
			this.log.error(e);
			this.busy = false;
			clearTimeout(timeout);
			if(this.onPacketProcess) this.onPacketProcess(data);
			this.processNextPacket();
		}
	}
};

Client.prototype.connectionEstablished = function () {
	if(this.debug >= 3)
		this.log.info('Connection established');

	// if player loaded URL with room ID in hash we need to check if room available before asking nickname
	if(this.opt.check_room) {
		this.send('check_room', this.opt.check_room);
	}else{
		this.send('create_room', this.opt);
	}
};


//connectionEstablished
module.exports = Client;