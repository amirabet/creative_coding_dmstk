# creative_coding_dmstk

Creative Coding Course by DOMESTIKA

[Link to the course](https://www.domestika.org/es/courses/2729-codificacion-creativa-crea-piezas-visuales-con-javascript/course)

This README reflects the next major iteration of the project layout: six sketches, per-sketch npm manifests, and sketch-specific runtime dependencies where needed.

## Project Structure

```text
creative_coding_dmstk/
├── package.json
├── CHANGELOG.md
├── README.md
├── 01_hello.html
├── sketches/
│   ├── 01/
│   │   ├── package.json
│   │   └── sketch-01.js
│   ├── 02/
│   │   ├── package.json
│   │   ├── sketch-02.html
│   │   └── sketch-02.js
│   ├── 03/
│   │   ├── package.json
│   │   └── sketch-03.js
│   ├── 04/
│   │   ├── package.json
│   │   └── sketch-04.js
│   ├── 05/
│   │   ├── package.json
│   │   └── sketch-05.js
│   └── 06/
│       ├── package.json
│       ├── sketch-06.js
│       ├── build.js
│       ├── constellations.json
│       ├── configs/
│       └── docs/
```

Each sketch folder is now self-contained enough to install and run independently.

## Dependencies

The root [package.json](package.json) still holds shared course dependencies, but each sketch folder also has its own local `package.json` so the sketches can be installed and run locally.

### canvas-sketch

[canvas-sketch](https://github.com/mattdesl/canvas-sketch) (`^0.7.7`) — framework for making generative artwork and creative coding sketches in JavaScript with an HTML5 Canvas.

### canvas-sketch-util

[canvas-sketch-util](https://github.com/mattdesl/canvas-sketch-util) (`^1.10.0`) — utility functions for creative coding, including math helpers, color tools, and random number generation.

### tweakpane

[tweakpane](https://github.com/cocopon/tweakpane) (`^3.1.10` in Sketches 04 and 06) — UI controls for interactive parameters in [sketches/04/sketch-04.js](sketches/04/sketch-04.js) and [sketches/06/sketch-06.js](sketches/06/sketch-06.js).

### tweakpane-plugin-search-list

[tweakpane-plugin-search-list](https://github.com/nicktindall/tweakpane-plugin-search-list) (`^0.0.10` in Sketch 06 only) — searchable dropdown plugin for Tweakpane, used for the constellation and star search controls in [sketches/06/sketch-06.js](sketches/06/sketch-06.js).

## Installation

Install the root dependencies once:

```bash
npm install
```

Then install dependencies inside any sketch you want to run:

```bash
cd sketches/05
npm install
```

## Running a Sketch

Run `canvas-sketch` from the sketch folder you want to work on so it resolves that sketch's local dependencies.

```bash
# From a sketch folder:
cd sketches/01
npx canvas-sketch sketch-01.js --open

cd ../04
npx canvas-sketch sketch-04.js --open

cd ../05
npx canvas-sketch sketch-05.js --open

cd ../06
npx canvas-sketch sketch-06.js --open
```

Sketch 06 also supports a build step that produces self-contained HTML files:

```bash
cd sketches/06
npm run build        # default build → docs/sketch-06.html
npm run build:all    # one HTML file per config in configs/
```

If you are switching between sketches regularly, treat each `sketches/0N/` directory as its own small workspace for install and run commands.

This will open the sketch in your browser with hot-reloading enabled.

## Current Sketches

- Sketch 01: introductory canvas-sketch exercise
- Sketch 02: animated clock composition using arcs, transforms, and time-based redraws
- Sketch 03: animated agents with vector motion and proximity-based line connections
- Sketch 04: animated noise-driven line grid with Tweakpane controls
- Sketch 05: typography-based experiment using an offscreen canvas and keyboard input
- Sketch 06: animated planetarium star map with constellation lines, annual sky rotation, Tweakpane controls, and a multi-config build system

## Troubleshooting

### Sketch 04 and Tweakpane

`sketches/04/sketch-04.js` uses `canvas-sketch` with the CommonJS/browserify pipeline. `tweakpane@4` is ESM-only, so if Sketch 04 installs that version the bundler fails with:

```text
ParseError: 'import' and 'export' may appear only with 'sourceType: module'
```

For this reason, `sketches/04/package.json` is pinned to `tweakpane@^3.1.10`, which is compatible with the current sketch setup. If Sketch 04 is later migrated to a full ESM workflow or browser-native imports, the Tweakpane dependency can be upgraded again.
