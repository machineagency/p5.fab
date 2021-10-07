# Reference

## Initialization 

### dicer = createDicer()

```javascript
p5.prototype.createDicer = function() {
  _dicer = new Dicer();
  return _dicer;
};
```
Creates a Dicer object, defaulting to the values with the Ender 3 Pro, which allows control of the 3D printer.

### [createCanvas(windowWidth, windowHeight, render)](https://p5js.org/reference/#/p5/createCanvas)

A p5 function that creates a canvas object with the set dimensions in pixels.

### createButton(description)
```javascript
let buttonConnect = createButton('connect to printer');
let buttonHeat = createButton('heat nozzle');
let buttonPrint = createButton('Print');
```
Creates HTML web buttons that allow users to interact
with the 3D printer without needing to code.


## Controlling the Printer

### dicer.heatNozzle()

Homes and then heats the nozzle to 200 degrees Celsius.

### dicer.coolPrinter()

Sets the nozzle temperature to 0C and returns the printer to the default home position.

### dicer.autoHome()

Moves the 3D printer to the home position by first calling the auto home G-Code value (G-Code: [G28](https://marlinfw.org/docs/gcode/G028.html)) followed
by zeroing and stopping of filament extrusion (G-Code: [G92](https://marlinfw.org/docs/gcode/G092.html) E0).

### dicer.move(x, y, z, v)

Allows the movement of the 3D printer nozzle to a specified position with a specified velocity

X: the X position of the nozzle

Y: the Y position of the nozzle

Z: the Z position of the nozzle

V: the velocity (mm/s) at which the nozzle travels to the specified location

### dicer.setNozzleTemp(temp)

Takes a temperature in Celsius and sets the nozzle temperature to it (G-Code: [M109](https://marlinfw.org/docs/gcode/M109.html)).

### dicer.setBedTemp(temp)

Takes a temperature in Celsius and sets the bed temperature to it (G-Code: [M109](https://marlinfw.org/docs/gcode/M109.html)).

### dicer.print()

Prints.

### dicer.moveExtrude(x, y, z, v, e)

Moves the nozzle to a specified position while extruding filament.

X: the X position of the nozzle

Y: the Y position of the nozzle

Z: the Z position of the nozzle

V: the velocity (mm/s) at which the nozzle travels to the specified location, defaults to 1500 mm/s

E: the amount of filament that has been extruded so far, defaults to `makeE(x, y)`.

### dicer.makeE(x, y)

Takes the coordinate position of the nozzle and returns a calculated amount of filament extruded.

### dicer.presentPart()

Moves the nozzle to the side and extends the bed out so that a user may retrieve the print.

### dicer.setAbsolutePosition()

Sets all axes to absolute positioning. All coordinates are interpreted as positions in the logical coordinate space (G-Code: [G90](https://marlinfw.org/docs/gcode/G090.html)).

### dicer.setRelativePosition()

Sets all axes to relative positioning. All coordinates are interpreted as relative to the last position (G-Code: [G91](https://marlinfw.org/docs/gcode/G091.html)).

### dicer.ERelative()

Overrides `dicer.setAboslutePosition()` and puts the E axis into relative positioning, independent of other axes (G-Code: [M83](https://marlinfw.org/docs/gcode/M083.html))

### dicer.fanOn()

Sets the print cooling fan to full speed (G-Code: [M106](https://marlinfw.org/docs/gcode/M106.html)).

### dicer.fanOff()

Turns the print cooling fan off (G-Code: [M107](https://marlinfw.org/docs/gcode/M107.html)).

### dicer.pausePrint()

Pauses the printer after the last movement and waits for user input to continue (G-Code: [M0](https://marlinfw.org/docs/gcode/M000-M001.html)).

### dicer.stopPrint()

Stops the printer by clearing all the commands queued.

### dicer.introLine()

Prints a single line along the left side of the printer bed in order to clear the nozzle before the actual print begins.

### dicer.waitCommand()

Pauses G-Code processing until all moves in the printer queue are completed (G-Code: [M400](https://marlinfw.org/docs/gcode/M400.html)).

### dicer.getPos()

Retrieves the current position of the active tool (G-Code: [M114](https://marlinfw.org/docs/gcode/M114.html)).

### dicer.autoReportPos(t)

Sets an interval and sends current position of active tool automatically (G-Code: [M154](https://marlinfw.org/docs/gcode/M154.html)).
