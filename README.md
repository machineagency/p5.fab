# p5.gcoder
A p5js library for 3D printing!

## Installation
### Option 1: Local
Download the [p5.gcoder.js library file](https://raw.githubusercontent.com/bsubbaraman/p5.gcoder/main/lib/p5.gcoder.js) and add the path to the `<head>` tag of your `index.html` file: 

`<script src="p5.gcoder.js"></script>`

Note that you will need to run a [local server](https://github.com/processing/p5.js/wiki/Local-server) as well.

### Option 2: p5.js Web Editor
Add a new file to the web editor by opening the _Sketch Files_ Menu on the left-hand side, and then selecting _Create File_; we suggest naming the file p5.gcoder.js. Copy-paste the contents of the [p5.gcoder.js library file](https://raw.githubusercontent.com/bsubbaraman/p5.gcoder/main/lib/p5.gcoder.js). Navigate to `index.html` and add the path to your new file to the `<head>` tag:

`<script src="p5.gcoder.js"></script>`

### Dependencies
This library relies on serial communication for your printer and p5 to talk. The easiest option is to use [p5.WebSerial](https://github.com/yoonbuck/p5.WebSerial), which will only work in the Chrome Browser. Regardless of your installation choice, add the following line to your `index.html` file to use p5.WebSerial:

`<script src="https://unpkg.com/p5-webserial@0.1.1/build/p5.webserial.js"></script>`

For more installation options, see [here](https://github.com/yoonbuck/p5.WebSerial/wiki/Guide). 

