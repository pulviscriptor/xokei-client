var settings = require("./settings");

var settingsManager = {
	settings: [],

	addSetting: function (opt) {
		this.settings.push(opt);
	},

	getSetting: function (name) {
		for(var i in this.settings)	{
			if(this.settings[i].name == name) return this.settings[i];
		}
	},

	setCurentSetting: function (name, value) {
		var val = settings;
		var setting = this.getSetting(name);

		for(var i=0;i<setting.path.length-1;i++) {
			val = val[setting.path[i]];
		}

		val[setting.path[setting.path.length-1]] = value;
	},

	getStorageValue: function(setting) {
		var value = window.localStorage['setting_' + setting.name];
		if(value === undefined) return;
		return this._cast(value, setting.type);
	},

	getCurrentValue: function (setting) {
		var val = settings;

		for(var i in setting.path) {
			val = val[setting.path[i]];
		}

		return val;
	},

	getValue: function (setting) {
		var storage = this.getStorageValue(setting);
		if(storage === undefined) {
			return this.getCurrentValue(setting);
		}else{
			return storage;
		}
	},

	getHTMLInput: function (setting) {
		var value = this.getValue(setting);
		if(setting.type == 'boolean') {
			return '<input id="settings-window-input-' + setting.name + '" type="checkbox"' + (value ? ' checked' : '') + '>';
		}
	},

	getHTMLTableRows: function () {
		var ret = '';

		for(var i in this.settings) {
			var setting = this.settings[i];
			ret += '<tr>';
			ret += '<td><i class="fa fa-question-circle tlp" aria-hidden="true" data-tooltip="' + setting.tooltip + '"></i> ' + setting.description + '</td>';
			ret += '<td>' + this.getHTMLInput(setting) + '</td>';
			ret += '</tr>';
		}

		return ret;
	},

	getValueFromHTML: function (setting) {
		var $input = $('#settings-window-input-' + setting.name);
		if(setting.type == 'boolean') {
			return $input.is(':checked');
		}
	},

	saveFromHTML: function () {
		for(var i in this.settings) {
			var setting = this.settings[i];
			var inputValue = this.getValueFromHTML(setting);

			window.localStorage['setting_' + setting.name] = this._uncast(inputValue, setting.type);
		}
	},

	applyLocalSettings: function () {
		for(var i in this.settings) {
			var setting = this.settings[i];
			var value = this.getStorageValue(setting);
			if(value === undefined) continue;
			this.setCurentSetting(setting.name, value);
		}
	},

	_cast: function (value, type) {
		if(type == 'boolean') {
			return !!parseInt(value);
		}
	},

	_uncast: function (value, type) {
		if(type == 'boolean') {
			return value ? '1' : '0';
		}
	}
};

settingsManager.addSetting({
	name: 'looserStartsAnotherGame',
	description: 'Looser starts another game',
	tooltip: 'If this setting is false, then whites always start the new game by placing the puck on their side.<br>If it is set to true, then whichever side lost the previous game will start the new one.',
	path: ['game','looserStartsAnotherGame'],
	type: 'boolean'
});

module.exports = settingsManager;
window.settingsManager = settingsManager;
