# creative_coding_dmstk

Creative Coding Course by DOMESTIKA

[Link to the course](https://www.domestika.org/es/courses/2729-codificacion-creativa-crea-piezas-visuales-con-javascript/course)

## Project Structure

```
creative_coding_dmstk/
├── package.json          # Single shared dependencies for all sketches
├── node_modules/
├── sketches/
│   ├── 01/
│   │   └── sketch-01.js
│   └── 02/
│       └── sketch-02.js
└── 01_hello.html
```

## Dependencies

All dependencies are managed from the root `package.json`.

### canvas-sketch

[canvas-sketch](https://github.com/mattdesl/canvas-sketch) (`^0.7.7`) — framework for making generative artwork and creative coding sketches in JavaScript with an HTML5 Canvas.

### canvas-sketch-util

[canvas-sketch-util](https://github.com/mattdesl/canvas-sketch-util) (`^1.10.0`) — utility functions for creative coding, including math helpers, color tools, and random number generation.

## Installation

From the project root, run:

```bash
npm install
```

## Running a Sketch

Always run `canvas-sketch` from the **project root**. It uses webpack to bundle sketches, and webpack resolves modules from the directory where the command is executed. Running from a sketch subfolder will cause errors like `Cannot find module 'canvas-sketch-util/math'` because `node_modules/` lives at the root.

```bash
# From the project root:
npx canvas-sketch sketches/01/sketch-01.js --open
npx canvas-sketch sketches/02/sketch-02.js --open
```

> ⚠️ Do **not** run `canvas-sketch` from inside a `sketches/01/` or `sketches/02/` subfolder.

This will open the sketch in your browser with hot-reloading enabled.
