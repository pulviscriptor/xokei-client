# Xokei Client #
Xokei is a multiplayer turn-based game similar to hockey. This repository holds the code for the client, which can be hosted anywhere and is designed to connect to a server. It is written in JavaScript and uses [io.js](https://iojs.org/en/) and [Grunt](http://gruntjs.com/) for compilation. CSS is written in SASS, and compiled with [`grunt-sass`](https://github.com/sindresorhus/grunt-sass). Tests are written in Mocha and use Chai for assertions.

# Running #
The client needs to be hosted from a server to run properly. The simplest way to get started and try it out without having to compile the source code yourself is to download the repository and fire up a local server with Python.

- If you don’t have Python installed, [install it](https://www.python.org/).
- [Download this repository as a zip](https://github.com/elliotbonneville/xokei-client/archive/master.zip).
- Extract it to a folder of your choice.
- Open `Command Prompt` or `Terminal` and navigate to the `build/` folder you just extracted.
- Run `python -m SimpleHTTPServer 8000`.
- Navigate to [http://localhost:8000](http://localhost:8000) in your browser.

# Building #
Building the source code yourself is more involved. Follow the steps below in order to get set up locally. Apologies in advance if you've already done some or most of the stuff below. If you have, you're Cool (tm). If you haven't, that's okay too -- you'll still be able to get this working.

Note: If you're on a Windows system, run Command Prompt as an administrator instead of running commands with `sudo`.

- If you don’t have Python installed, [install it](https://www.python.org/).
- Install [git](https://git-scm.com/).
- If you’re on a \*Nix system, install [nvm](https://github.com/creationix/nvm). If you’re on Windows, get [nvmw](https://github.com/hakobera/nvmw).
- Run `nvm install iojs` for \*Nix or `nvmw install iojs` for Windows.
- Clone this repository into a folder of your choice with `git clone https://github.com/elliotbonneville/xokei-client`. Git will download this repository into a folder called `xokei-client`.
- `cd` into the root directory of the cloned repository and run `nvm use iojs`. It's kind of crucial that you get this working before moving on to the next step.
- Run `npm install` in the same directory to install all of the modules listed in `package.json`. A bunch of stuff will happen in the terminal while npm installs all of the modules that are used in this project. Now would be a good time to make a cup of coffee. If this command doesn't work, run `sudo npm install` instead.
- Run `npm install -g grunt-cli` to install Grunt. The `-g` flag ensures it will be installed globally, making it available in any folder on your system. You may need to run this command with `sudo` as well, depending on your setup.
- Run `npm install -g bower` to install Bower. Again, `sudo` may be necessary.
- Run `bower install` to grab the Bower components that this project relies on.
- Once all of that is done, run a simple `grunt`. If everything has gone well, it should do a bunch of stuff and not break, and you should see `Started connect web server on http://localhost:8000` close to the bottom of the terminal.
- At this point you can navigate to [http://localhost:8000](http://localhost:8000) and see the Xokei client in action!

To close the running process you can either close the terminal directly or use `Ctrl-C` to quit the process but keep the window open.

The current Grunt setup rebuilds the project and serves it up whenever a file change is made, so you won't have to do anything else to start modifying it. Simply edit a file (any file), save your changes, and refresh Xokei in your browser. If you have [LiveReload](http://livereload.com/), even better -- the page will refresh itself automagically whenever you make a file change.

After you've got all this installed and running smoothly, this is all you need to do whenever you want to fire up your dev environment again:

- Navigate to the repository root
- `nvm use iojs` (or `nvmw use iojs`)
- `grunt`

# Debug #
You can set client debug level from 0 to 3 by setting `localStorage.debug=X`

# Testing #
You can run tests to check that everything works correctly.
Navigate to `xokei-client` folder and run `grunt` and it should show all available client tests.
- Run `grunt test` to test client logic/functions/events
- Run `grunt test_phantom` to play 2P offline game and check that everything works
- Run `grunt test_server`** to play 1P online game with emulated client trying to cheat and send malicious packets
- Run `grunt test_phantom_multiplayer`** to play 1P online game and check that everything works
- **folder `xokei-server` must be located in same folder where `xokei-client` is
- **you can see debug output by setting env variable `DEBUG_TEST` to `true` like: 
linux: 
`DEBUG_TEST=true grunt test_server` 
windows: 
`set DEBUG_TEST=true 
grunt test_server` 
Same for `grunt test_phantom_multiplayer`

## Running tests manually ##
If something fails or you want to debug it or just to see how it works, you can run tests in your web-browser.
Run `grunt serve_phantom` and navigate to http://127.0.0.1:8800/phantom/build/ there you will see list of test html files. You can click them to see tests.
Do not minimize web browser while tests are running because web-browser will disable animations and tests will fail.

To run multiplayer tests in web-browser you need to run `grunt serve_phantom` and navigate to http://127.0.0.1:8800/phantom_multiplayer/build/ 
Then inside `xokei-server` folder run `npm run test-phantom` after that you will have about [b]4 seconds[/b] to click first test in web-browser.
If first test `should wait for PhantomJS player join` fails then you were too slow. Re-start `npm run test-phantom` and refresh web-browser window.
You can set env `DEBUG_TEST=true` for `npm run test-phantom` to see debug output.

Check `xokei-server` README.md file for more info about server.