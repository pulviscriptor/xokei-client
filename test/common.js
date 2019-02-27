var doc,
	fs = require("fs"),
	jsdom = require("jsdom").JSDOM,
	sinonChai = require("sinon-chai");

global.chai = require("chai");
global.expect = require("chai").expect;
global.sinon = require("sinon");

chai.use(sinonChai);

doc = new jsdom(fs.readFileSync("src/index.html", "utf8"));
//global.window = doc.defaultView,
global.window = doc.window,
global.document = window.document;