# Local Server Quick Start

Some p5 functionality - like the serial communication that this library relies on - requires running a [local server](https://github.com/processing/p5.js/wiki/Local-server). Because WebSerial is only supported on Chrome, [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) is a good option to do this easily. The steps below walk through the set up process! If you don't want to deal with this, feel free to use the [p5.js web editor](https://editor.p5js.org/) (be sure to use Chrome still!). If you know how to do this already or have a different preferred method for launching a local server- great! Feel free to move on to the [getting started page](./getting-started.md) or look at the [examples](../../examples).

- Add the [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) extension
- Got to `chrome://apps` and then click the Web Server for Chrome icon
- Choose the folder to launch the server from. If you're taking a look at the examples in this repo, choose the `p5.fab` folder.
- Toggle the start switch to 'on', and navigate to `http://127.0.0.1:8887/editor`. You should be ready to go!

_The info on this page largely comes from the [p5.js doc](https://github.com/processing/p5.js/wiki/Local-server) - look over there for more info!_
