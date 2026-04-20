# creative_coding_dmstk

Creative Coding Course by DOMESTIKA

[Link to the course](https://www.domestika.org/es/courses/2729-codificacion-creativa-crea-piezas-visuales-con-javascript/course)

## Dependencies

### canvas-sketch

[canvas-sketch](https://github.com/mattdesl/canvas-sketch) is a framework for making generative artwork and creative coding sketches in JavaScript with an HTML5 Canvas. It provides a simple API for rendering, exporting frames, and working with animation loops.

The sketches in this project are built using `canvas-sketch` (^0.7.7), located in the `sketches/` folder.

## Installation

To install the dependencies for the sketches, navigate to the `sketches/` folder and run:

```bash
cd sketches
npm install
```

This will install `canvas-sketch` and any other dependencies listed in `sketches/package.json`.

## Running a Sketch

Once dependencies are installed, start the canvas-sketch development server with:

```bash
npx canvas-sketch sketch-01.js --open
```

This will open the sketch in your browser with hot-reloading enabled.
