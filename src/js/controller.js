/* Handles interaction between view and model
 */
 
/// requires
var settings = require("./settings");

/// private variables

/// private functions

/// object
function Controller(board, view) {
	/// public variables
	this.board = board;
	this.view = view;
	
	this.kickDirection = null;
	this.listeners = {};
	this.messageShowing = false;
	this.puckTrajectory = null;
	this.selectedActor = null;
	
	this.states = {
		// events that all states should be subscribed to regardless of UI state
		"global": {
			"close message": function () {
				this.messageShowing = false;
			},
			
			"message": function (data) {
				this.view.message(data);
				this.messageShowing = true;
			},
			
			"window resize": function () {
				this.clearUIState();
				this.view.display.resizeBoard();
				
				if (this.messageShowing) {
					this.view.resizeMessage();
				}
			}
		},
		
		// when the player is placing the puck...
		"placing puck": {
			"click tile": function (data) {
				var pos = data.element.data("position"),
					self = this,
					tile = this.board.tile(pos);
				
				if (this.validPuckPositions.indexOf(tile) >= 0) {
					this.board.placePuck(pos);
					this.view.display.createPuck(settings.animationSpeed);
					
					setTimeout(function () {
						self.view.display.clearPuckGhost();
					}, settings.animationSpeed);
					
					this.view.events.listenToPuckEvents();
					this.emit("placed puck");
					this.setUIState("playing round");
				}
			},
			
			"destroy state": function () {
				this.view.display.enableActorMouseEvents();
			},
			
			"init state": function () {
				this.validPuckPositions = this.board.getValidPuckPositions();
				this.view.display.disableActorMouseEvents();
				
				this.emit("message", {
					life: "placed puck",
					message: "Place the puck."
				});
			},
			
			"mouse enter tile": function (data) {
				var pos = data.element.data("position"),
					tile = this.board.tile(pos),
					validPos = this.validPuckPositions.indexOf(tile) >= 0;
				
				if (tile.type !== "wall" && !validPos) {
					this.view.display.highlightTile(tile, false);
				}
				
				if (validPos) {
					this.view.display.showPuckGhost(pos);
				}
			},
			
			"mouse exit tile": function () {
				this.view.display.clearPuckGhost();
				this.view.display.unhighlightTile();
			}
		},
		
		// after the player has placed the puck and is actually playing a round
		"playing round": {
			"click actor": function (data) {
				var actor = this.board.actors[data.element.data("actor")];
				
				// if the actor that has been clicked on is the currently 
				// selected actor, don't do anything
				if (actor === this.selectedActor) {
					return false;
				}
				
				this.clearUIState();
				
				// if this actor belongs to the owner of the board
				if (actor.owner !== this.board.settings.owner) {
					return false;
				}

				// display the clicked actor as selected
				this.selectActor(actor);
			},
			
			"click puck": function () {
				this.selectPuck();
			},
			
			"click tile": function (data) {
				var actor,
					index,
					pos = data.element.data("position"),
					tile = this.view.display.tiles[pos.x][pos.y];
				
				// if the tile is clicked and it is a valid move, have the 
				// selected actor move to that tile
				if (tile.validMove) {
					actor = this.selectedActor;
					index = this.selectedActorIndex;
					
					// clear the UI
					this.clearUIState();
					
					// move the actor in the model
					actor.move(this.board.tiles[pos.x][pos.y]);
					
					// and move the actor in the view
					this.view.display.moveActor(index);
				} else if (tile.validKickDirection) {
					this.clearUIState();
					
					this.kickDirection = tile;
					this.projectKickTrajectory();
				} else if (tile.validKick) {
					this.kickPuck(this.board.tiles[pos.x][pos.y]);
					this.clearUIState();
				} else {
					this.clearUIState();
				}
			},
			
			"mouse enter tile": function (data) {
				var pos = data.element.data("position"),
					tile = this.view.display.tiles[pos.x][pos.y];
					
				if (tile.validMove || 
					tile.validKickDirection || 
					tile.validKick) {
					
					this.view.display.highlightTile(tile, true);
				}
			},
			
			"mouse exit tile": function () {
				this.view.display.unhighlightTile();
			}
		}
	};
}

/// public functions
Controller.prototype = {
	addListener: function (eventName, callback) {
		var listener;
		
		callback = callback.bind(this);
		
		// if there is no callback we may be being passed an object full of
		// listeners; if so, iterate through them and add each one individually
		if (!callback) {
			for (listener in eventName) {
				this.addListener(listener, eventName[listener]);
			}
			
			return;
		}
	
		// add a single event listener to the list without overriding any other
		// event listeners
		if (this.listeners[eventName]) {
			this.listeners[eventName].push(callback);
		} else {
			this.listeners[eventName] = [callback];
		}
		
		return callback;
	},
	
	setUIState: function (stateName) {
		var eventName;
		
		// destroy the old state so we can build the new one
		this.emit("destroy state");
		this.clearListeners();
		this.clearUIState();
		
		// apply all global listeners, the ones that should apply to all states
		for (eventName in this.states.global) {
			this.addListener(eventName, this.states.global[eventName]);
		}
		
		// and add the listeners that are specific to this state
		for (eventName in this.states[stateName]) {
			this.addListener(eventName, this.states[stateName][eventName]);
		}
		
		this.emit("init state");
	},
	
	clearListeners: function () {
		this.listeners = {};
	},
	
	clearUIState: function () {
		this.view.display.deselectActor(this.selectedActorIndex);
		this.view.display.clearKickDirections();
		this.view.display.clearKickTrajectory();
		this.view.display.unhighlightTile();
		
		this.puckSelected = false;
		this.selectedActor = null;
		this.kickDirection = null;
		this.puckTrajectory = null;
	},
	
	emit: function (eventName, data) {
		var i;
		
		if (!this.listeners[eventName]) {
			return;
		}
		
		for (i = 0; i < this.listeners[eventName].length; i++) {
			this.listeners[eventName][i](data);
		}
	},
	
	kickPuck: function (target) {
		var trajectory = this.puckTrajectory
			.splice(0, this.puckTrajectory.indexOf(target) + 1);
			
		this.board.puck.kick(trajectory[trajectory.length - 1]);
		this.view.display.showKick(trajectory);
	},
	
	projectKickTrajectory: function () {
		this.puckTrajectory = this.board.puck.calculateTrajectory(
			this.kickDirection);
		
		this.view.display.showKickTrajectory(this.puckTrajectory);
	},
	
	removeListener: function (eventName, callback) {
		var index,
			listeners = this.listeners[eventName];
		
		if (listeners) {
			index = listeners.indexOf(callback);
			
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	},
	
	// select an actor and cause the available positions to move to be shown
	selectActor: function (actor) {
		this.selectedActor = actor;
		this.selectedActorIndex = this.board.actors.indexOf(actor);
		
		this.view.display.selectActor(this.selectedActor);
	},
	
	selectPuck: function () {
		if (this.puckSelected) {
			return;
		}
		
		this.clearUIState();
		
		this.puckSelected = true;
		this.view.display.showKickDirections(this.board.puck
			.kickDirections(this.board.settings.owner));
	}
};

/// exports
module.exports = Controller;