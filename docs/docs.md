# G-Code Command Functions Guide
This guide provides an overview of the G-Code command functions available in the p5.fab.js file, which is used for controlling a 3D printer within a p5.js sketch.

## p5.fab original
### Basic Commands
- autoHome(): Homes the printer by moving the print head to the origin of the printer.
- setTemps(tNozzle, tBed): Sets the temperatures for the nozzle and the bed.
- setNozzleTemp(t): Sets the temperature of the nozzle.
- setBedTemp(t): Sets the temperature of the bed.
- setAbsolutePosition(): Sets the printer to use absolute positioning for movements.
- setRelativePosition(): Sets the printer to use relative positioning for movements.
- setERelative(): Sets the extruder to use relative mode, independent of other axes.
- fanOn(): Turns on the cooling fan.
- fanOff(): Turns off the cooling fan.
- pausePrint(t = null): Pauses the print for a specified time.
restartPrinter(): Restarts the printer.

### Movement Commands
- move(x, y, z, v): Moves the printer head to the specified coordinates at the given speed.
- moveX(x, v = 25): Moves the printer head along the X-axis.
- moveY(y, v = 25): Moves the printer head along the Y-axis.
- moveZ(z, v = 25): Moves the printer head along the Z-axis.
- up(z, v = 50): Moves the printer head up along the Z-axis.
- moveExtrude(x, y, z, v = 25, e = null, multiplier = false): Moves the printer head while extruding filament.
- moveRetract(x, y, z, v = 25, e = 8): Moves the printer head while retracting the filament.

### Acceleration Commands
- setMaxAcceleration(x, y, z): Sets the maximum acceleration for the X, Y, and Z axes.
- setStartAcceleration(a): Sets the starting acceleration.

## FIDELIS Extension
### GCode Commands
- printGCode(): Logs all G-code commands to the console with their corresponding index numbers.
- exportGCode(): Opens a new tab or window displaying the G-code for easy copying or saving.
- saveGCode(): Saves the G-code commands to a file named 'fab.gcode'.
- loadGCode(gcodeContent): Loads G-code content into the instance, splitting it into individual commands.
- parseCommand(command): Parses a G-code command, extracting and swapping Y and Z coordinates, and inverting Z.

### Other
- randomPoint(x, y, z): Generates a random point within the specified bounds, or the maximum bounds if none are provided.