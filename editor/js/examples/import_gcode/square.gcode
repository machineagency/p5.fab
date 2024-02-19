M83 ; Set extruder to relative mode
M107 ; Turn off fan
G28 ; Home all axes
G92 E0 ; Zero the extruder

; Heat up the nozzle and bed
M104 S205 ; Set extruder temperature to 205°C
M140 S55 ; Set bed temperature to 55°C
M109 S205 ; Wait for extruder temperature
M190 S55 ; Wait for bed temperature

; Print the intro line to prime the nozzle
G0 X0.10 Y20.00 Z0.30 F5100.00 ; Move to start position
G1 X0.10 Y200.00 Z0.30 F1500.00 E9.40 ; Intro line
G0 X0.40 Y200.00 Z0.30 F5100.00 ; Move to next start position
G1 X0.40 Y20.00 Z0.30 F1500.00 E9.40 ; Intro line

G92 E0 ; Reset extruder position
G0 Z2.0 F3000 ; Raise to clearance height
G0 X5 Y20 Z0.3 F5000.0 ; Move to starting corner of the cube

; Start printing the cube
G92 E0 ; Zero the extruder
G1 X5 Y5 Z0.3 F1500.00 E1.05 ; Move to the first corner of the cube
G1 X25 Y5 Z0.3 F1500.00 E2.00 ; Draw first line of the cube
G1 X25 Y25 Z0.3 F1500.00 E2.00 ; Draw second line of the cube
G1 X5 Y25 Z0.3 F1500.00 E2.00 ; Draw third line of the cube
G1 X5 Y5 Z0.3 F1500.00 E2.00 ; Complete the first layer square

; The following lines would need to repeat for each layer of the cube
; increasing Z by the layer height each time (e.g., 0.3mm)

; End of G-code for the cube
M104 S0 ; Turn off the extruder heater
M140 S0 ; Turn off the bed heater
G91 ; Set to relative positioning
G1 E-1 F300 ; Retract the filament
G90 ; Set to absolute positioning
G0 X0 Y0 ; Move to the corner of the bed
M84 ; Disable steppers
