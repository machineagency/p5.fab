# p5.fab

![artifacts created with p5.fab](./images/prints.png)

p5.fab.js is a p5.js library for 3D printing. It helps you author generative physical artifacts! To get started, head over to the [getting-started](https://github.com/machineagency/p5.fab/blob/main/docs/tutorials/getting-started.md), or try out the [online editor](https://rayxsong.github.io/p5.fab-FIDELIS/editor/index.html)!

To 3D print an object, a canonical workflow starts with designing a CAD model then using a slicer software to generate machine readable G-code. This process abstracts
away many tedious details, but also requires owning & learning CAD. The p5.fab library is for users who might appreciate the control offered by direct gcode manipulation. It seeks
to support repeatable & controlled experimentation (testing/tuning/calibrating the machine, learning how the printer works, examining material properties) as well as open-ended exploration (generative form-finding, quick design iterations).
