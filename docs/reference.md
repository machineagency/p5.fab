# Reference

## Initialization 

### fab = createFab()

```javascript
p5.prototype.createfab = function() {
  _fab = new fab();
  return _fab;
};
```
Creates a fab object, defaulting to the values with the Ender 3 Pro, which allows control of the 3D printer.

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

### fab.heatNozzle()

Homes and then heats the nozzle to 200 degrees Celsius.

### fab.coolPrinter()

Sets the nozzle temperature to 0C and returns the printer to the default home position.

### fab.autoHome()

Moves the 3D printer to the home position by first calling the auto home G-Code value (G-Code: [G28](https://marlinfw.org/docs/gcode/G028.html)) followed
by zeroing and stopping of filament extrusion (G-Code: [G92](https://marlinfw.org/docs/gcode/G092.html) E0).

### fab.move(x, y, z, v)

Allows the movement of the 3D printer nozzle to a specified position with a specified velocity

X: the X position of the nozzle

Y: the Y position of the nozzle

Z: the Z position of the nozzle

V: the velocity (mm/s) at which the nozzle travels to the specified location

### fab.setNozzleTemp(temp)

Takes a temperature in Celsius and sets the nozzle temperature to it (G-Code: [M109](https://marlinfw.org/docs/gcode/M109.html)).

### fab.setBedTemp(temp)

Takes a temperature in Celsius and sets the bed temperature to it (G-Code: [M109](https://marlinfw.org/docs/gcode/M109.html)).

### fab.print()

Prints.

### fab.moveExtrude(x, y, z, v, e)

Moves the nozzle to a specified position while extruding filament.

X: the X position of the nozzle

Y: the Y position of the nozzle

Z: the Z position of the nozzle

V: the velocity (mm/s) at which the nozzle travels to the specified location, defaults to 1500 mm/s

E: the amount of filament that has been extruded so far, defaults to `makeE(x, y)`.

### fab.makeE(x, y)

Takes the coordinate position of the nozzle and returns a calculated amount of filament extruded.

### fab.presentPart()

Moves the nozzle to the side and extends the bed out so that a user may retrieve the print.

### fab.setAbsolutePosition()

Sets all axes to absolute positioning. All coordinates are interpreted as positions in the logical coordinate space (G-Code: [G90](https://marlinfw.org/docs/gcode/G090.html)).

### fab.setRelativePosition()

Sets all axes to relative positioning. All coordinates are interpreted as relative to the last position (G-Code: [G91](https://marlinfw.org/docs/gcode/G091.html)).

### fab.ERelative()

Overrides `fab.setAboslutePosition()` and puts the E axis into relative positioning, independent of other axes (G-Code: [M83](https://marlinfw.org/docs/gcode/M083.html))

### fab.fanOn()

Sets the print cooling fan to full speed (G-Code: [M106](https://marlinfw.org/docs/gcode/M106.html)).

### fab.fanOff()

Turns the print cooling fan off (G-Code: [M107](https://marlinfw.org/docs/gcode/M107.html)).

### fab.pausePrint()

Pauses the printer after the last movement and waits for user input to continue (G-Code: [M0](https://marlinfw.org/docs/gcode/M000-M001.html)).

### fab.stopPrint()

Stops the printer by clearing all the commands queued.

### fab.introLine()

Prints a single line along the left side of the printer bed in order to clear the nozzle before the actual print begins.

### fab.waitCommand()

Pauses G-Code processing until all moves in the printer queue are completed (G-Code: [M400](https://marlinfw.org/docs/gcode/M400.html)).

### fab.getPos()

Retrieves the current position of the active tool (G-Code: [M114](https://marlinfw.org/docs/gcode/M114.html)).

### fab.autoReportPos(t)

Sets an interval and sends current position of active tool automatically (G-Code: [M154](https://marlinfw.org/docs/gcode/M154.html)).
