# Xokei Client
Xokei is a multiplayer turn-based game similar to hockey. This repository holds the code for the client, which can be hosted anywhere and is designed to connect to a server. It is written in JavaScript and uses [io.js](https://iojs.org/en/) and [Grunt](http://gruntjs.com/) for compilation. CSS is written in SASS, and compiled with [`grunt-sass`](https://github.com/sindresorhus/grunt-sass).

# Running
The client needs to be hosted from a server to run properly. The simplest way to get started and try it out without having to compile the source code yourself is to download the repository and fire up a local server with Python.

- If you don’t have Python installed, [install it](https://www.python.org/).
- [Download this repository as a zip](https://github.com/elliotbonneville/xokei-client/archive/master.zip).
- Extract it to a folder of your choice.
- Open `Command Prompt` or `Terminal` and navigate to the `build/` folder you just extracted.
- Run `python -m SimpleHTTPServer 8000`.
- Navigate to [http://localhost:8000](http://localhost:8000) in your browser.

# Building
Building the source code yourself is more involved. Follow the steps below in order to get set up locally. Apologies in advance if you've already done some or most of the stuff below. If you have, you're Cool (tm). If you haven't, that's okay too -- you'll still be able to get this working.

- If you don’t have Python installed, [install it](https://www.python.org/).
- If you’re on a \*Nix system, install [nvm](https://github.com/creationix/nvm). If you’re on Windows, get [nvmw](https://github.com/hakobera/nvmw).
- Run `nvm install iojs` for \*Nix or `nvmw install iojs` for Windows.
- Install [npm](https://github.com/npm/npm).
- Install [git](https://git-scm.com/).
- Clone this repository into a folder of your choice with `git clone https://github.com/elliotbonneville/xokei-client`. Git will download this repository into a folder called `xokei-client`.
- `cd` into the root directory of the cloned repository and run `nvm use iojs`. It's kind of crucial that you get this working before moving on to the next step.
- Run `sudo npm install` in the same directory to install all of the modules listed in `package.json`. A bunch of stuff will happen in the terminal while npm installs all of the modules that are used in this project. Now would be a good time to make a cup of coffee.
- Run `sudo npm install -g grunt-cli` to install Grunt. The `-g` flag ensures it will be installed globally, making it available in any folder on your system.
- Run `sudo npm install -g bower` to install Bower.
- Run `bower install` to grab the Bower components that this project relies on.
- Once all of that is done, run a simple `grunt`. If everything has gone well, it should do a bunch of stuff and not break, and you should see `Started connect web server on http://localhost:8000` close to the bottom of the terminal.
- At this point you can navigate to [http://localhost:8000](http://localhost:8000) and see the Xokei client in action!

To close the running process you can either close the terminal directly or use `Ctrl-C` to quit the process but keep the window open.

The current Grunt setup rebuilds the project and serves it up whenever a file change is made, so you won't have to do anything else to start modifying it. Simply edit a file (any file), save your changes, and refresh Xokei in your browser (the server restarts automatically). If you have [LiveReload](http://livereload.com/), even better -- it'll refresh itself automagically whenever you make a file change.

After you've got all this installed and running smoothly, this is all you need to do whenever you want to fire up your dev environment again:

- Navigate to the repository root
- `nvm use iojs` (or `nvmw use iojs`)
- `grunt`
