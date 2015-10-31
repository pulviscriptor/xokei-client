var doc,
	fs = require("fs"),
	jsdom = require("jsdom").jsdom,
	sinonChai = require("sinon-chai");

global.chai = require("chai");
global.expect = require("chai").expect;
global.sinon = require("sinon");

chai.use(sinonChai);

doc = jsdom(fs.readFileSync("src/index.html", "utf8"));
global.window = doc.defaultView,
global.document = window.document;