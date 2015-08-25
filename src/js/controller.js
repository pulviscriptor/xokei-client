/* Handles interaction between view and model
 */
 
/// requires

/// private variables

/// private functions

/// object
function Controller() {
	var self = this;
	
	/// public variables
	this.kickDirection = null;
	this.listeners = {};
	this.puckTrajectory = null;
	this.selectedActor = null;
	
	this.addListener({
		"click actor": function (data) {
			var actor = self.board.actors[data.element.data("actor")];
			
			// if the actor that has been clicked on is the currently selected
			// actor, don't do anything
			if (actor === self.selectedActor) {
				return false;
			}
			
			self.clearUIState();
			
			// if this actor belongs to the owner of the board
			if (actor.owner !== self.board.settings.owner) {
				return false;
			}

			// display the clicked actor as selected
			self.selectActor(actor);
		},
		
		"click puck": function () {
			self.selectPuck();
		},
		
		"click tile": function (data) {
			var pos = data.element.data("position"),
				tile = self.view.display.tiles[pos.x][pos.y];
			
			// if the tile is clicked and it is a valid move, have the selected
			// actor move to that tile
			if (tile.validMove) {
				// move the actor in the model
				self.selectedActor.move(self.board.tiles[pos.x][pos.y]);
				
				// move the actor in the view
				self.view.display.moveActor(self.selectedActorIndex);
				
				// and clear the UI
				self.clearUIState();
			} else if (tile.validKickDirection) {
				self.clearUIState();
				
				self.kickDirection = tile;
				self.projectKickTrajectory();
			} else {
				self.clearUIState();
			}
		},
		
		"mouse enter tile": function (data) {
			var pos = data.element.data("position"),
				tile = self.view.display.tiles[pos.x][pos.y];
				
			if (tile.validMove || 
				tile.validKickDirection || 
				tile.validKick) {
				
				self.view.display.highlightTile(tile, true);
			}
		},
		
		"mouse exit tile": function () {
			self.view.display.unhighlightTile();
		},
		
		"kick puck": function () {
			var end = self.puckTrajectory[self.puckTrajectory.length - 1];
			
			self.board.puck.kick(end);
			self.view.display.showKick(self.puckTrajectory);
		},
		
		"window resize": function () {
			self.view.display.resizeBoard();
		}
	});
}

/// public functions
Controller.prototype = {
	addListener: function (eventName, callback) {
		var listener;
		
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
	
	projectKickTrajectory: function () {
		this.puckTrajectory = this.board.puck.calculateTrajectory(
			this.kickDirection);
		
		this.view.display.showKickTrajectory(this.puckTrajectory);
	},
	
	registerBoard: function (board) {
		this.board = board;
	},

	registerView: function (view) {
		this.view = view;
	},
	
	// select an actor and cause the available positions to move to be shown
	selectActor: function (actor) {
		this.selectedActor = actor;
		this.selectedActorIndex = this.board.actors.indexOf(actor);
		
		this.view.display.selectActor(this.selectedActorIndex);
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