# p5.fab
p5.fab.js is a p5.js library for 3D printing. It helps you author generative physical artifacts!

To 3D print an object, a canonical workflow starts with designing a CAD model then using a slicer software to generate machine readable G-code. This process abstracts
away many tedious details, but also requires owning & learning CAD. The p5.dicer library is for users who might appreciate the control offered by direct gcode manipulation. It seeks
to support repeatable & controlled experimentation (testing/tuning/calibrating the machine, learning how the printer works, examining material properties) as well as open-ended exploration (generative form-finding, quick design iterations).

To get started, check out the [getting started page](./docs/tutorials/getting-started.md), take a look at the [examples](./examples), or explore the documentation (in progress).

## Installation
This library relies on WebSerial support, and therefore is only supported on Chrome at this time (see *Dependencies* below). More options are in progress, but for now, use Chrome!

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
