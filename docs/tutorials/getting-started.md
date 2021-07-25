# Getting Started!
This page has info on how to start using the p5.dicer library in p5.js with high level info on how the library works.

**Note 1:** This library relies on WebSerial support, and therefore is only supported on Chrome at this time. More options are in progress, but for now, *use Chrome!* 

**Note 2:** If you're running p5 locally, you'll need to launch [local server](https://github.com/processing/p5.js/wiki/Local-server) as well. Since we have to use Chrome already,
[Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) is a good option to do this easily. If this sounds unfamiliar to you, see my step-by-step guide [here](./local-server.md).

***

## Physical Setup
p5.dicer talks to your printer over serial communication. Turn your printer on and connect your Ender to your computer using a microUSB cable next to the input next to the SD card. Since we are streaming the print from the computer, the print will stop if your computer loses power or goes to sleep. I recommend turning your computer's sleep timer off, and keeping your computer powered if running a long print.

The following steps also assume that your bed is leveled, and you already have an idea of what temperature settings work well for the filament you're using.

## p5 Setup
First, set up a Dicer object. It can optionally take several parameters to accomodate different 3D printers, but the default settings are for an Ender 3 Pro or V2. The WebSerial library requires user input to connect to a serial port, so we also set up buttons to connect to the printer and to start the print.

```javascript
let dicer;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    dicer = createDicer();

    let connectButton = createButton('connect!');
    connectButton.position(20, 20);
    connectButton.mousePressed(function() {
      dicer.serial.requestPort(); // choose the serial port to connect to
    });

    let printButton = createButton('print!');
    printButton.position(20, 60);
    printButton.mousePressed(function() {
      dicer.print(); // start streaming the commands to printer
    });
}
```

Save the sketch and try clicking the connect button. You should receive a prompt which includes a serial port to open. By default, Dicer will remember the port you have access to and try to connect to it automatically across refreshes. If you always want to start your print immediately, you can omit the print button and instead enable `printOnOpen()`, which will send the print as soon as Dicer has connected to a serial port. 

In addition to `setup()` and `draw()`, p5.dicer introudes `dicerDraw()` which runs immediately after `setup` completes. This is where you can author your artifacts! The first thing to do in `dicerDraw` is set up some print settings. A standard way to start is to set the coordinate modes of the printer. In absolute mode, all coordinates will be interpreted as positions in the printer's coordinate space; in relative mode, coordinates are interpreted as relative to the last position. To avoid damaging your printer, it's a good idea to explicitly set your mode:

```javascript
function dicerDraw() {
  dicer.setAbsolutePosition(); // set all axes (x.y/z/extruder) to absolute
  dicer.setERelative(); // put extruder in relative mode, independent of other axes
}
```

Here, we first put the printer in absolute mode. However, it's easier to work with you extruder in relative mode- this is how most slicers work, too. `setERelative()` does this for us.

Now we've set absolute mode, but we don't have a good origin yet. The first movement for your printer should be to home the printhead to establish the coordinate system.

```javascript
dicer.autoHome();
```

Next, we can make our first extrusion! It's standard to print an intro line to clean the nozle before moving on to printing your object. We can do this by bringing our nozzle and bed up to temp, and then using the `introLine()` method.

```javascript
dicer.setNozzleTemp(200); // °C - you should use a temperature best suited for your filament!
dicer.setBedTemp(55); // °C - best temperature for good adhesion/no curling will vary based on filament used!
dicer.introLine(); // draw to lines on the left side of the print bed
```

If you run this sketch and press the *print* button, you should see your printer home, pause as the nozzle and bed come up to temperature, and then print your intro line! Next, let's try to print a hollow cube. We can start by setting up some printing variables. Much like drawing lines to the p5 canvas, we can set up variables to print a cube with 20mm long sides with the bottom-left corner at the position (100,100) of the printer bed:

```javascript
let sideLength = 20; //mm
let x = 100; 
let y = 100;
let speed = 1000; // mm/min
let layerHeight = 0.2; // mm
```

Where `speed` defines how fast the toolhead will move from position to position and `layerHeight` is the thickness of a printed layer. A slow speed and small layer height allows for more detail, but takes much longer to print. Next, we can actually print our
cube using different `move` commands:

```javascript
dicer.moveRetract(startX, startY, layerHeight); // move to the start (x,y,z) position without extruding

for (let z = layerHeight; z <= sideLength; z += layerHeight) { 
  dicer.moveExtrude(x + sideLength, y, z, speed); // move along the bottom side while extruding filament
  dicer.moveExtrude(x + sideLength, y + sideLength, z, speed); // right side
  dicer.moveExtrude(x, y + sideLength, z, speed); // top side
  dicer.moveExtrude(x, y, z, speed); //left side
}


```
The `moveExtrude()` command will move while extruding filament, calculating the correct amount of filament as it goes. `moveRetract()`, on the other hand, will move without extruding and pull the filament back a little to prevent oozing (though the proper retraction amount will depand on your printer filament & temperature). This loop will print a 20mm hollow box, but once it finishes it will be hard to take the cube of the print bed with the nozzle still in the way! We can add the following line to send the hotend to the back left of the printer:

```javascript
dicer.presentPart();
```

In other scenarios, you might want to manually move the printhead out of the way to avoid collisions. 

Now if we run the sketch and press print, your printer should home, print a cleaning line, then print your box! 





