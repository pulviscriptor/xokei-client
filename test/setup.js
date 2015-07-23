/* Loading this module will provide a global window and document for SVG to 
 * use if it needs to--simulating a browser environment for testing purposes
 */
var fs = require("fs"),
	jsdom = require("jsdom").jsdom;

var doc = jsdom(fs.readFileSync("src/index.html", "utf8"));

global.window = doc.defaultView,
global.document = window.document;