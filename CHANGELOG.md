# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-05-04

### Added

- `sketches/03/sketch-03.js` — third canvas-sketch exercise introducing `PointClass` and `Agent` classes, then rendering 40 randomly positioned white circular agents on a black 1080 x 1080 canvas
- `sketches/03/package.json` — per-sketch npm manifest with `sketch-03.js` as the entry point and `canvas-sketch` as a local dependency
- `sketches/03/package-lock.json` — lockfile for sketch 03 dependency installation

## [3.0.0] - 2026-04-24

### Changed

- `sketches/02/sketch-02.js` — enabled canvas-sketch's built-in animation loop (`animate: true`, `fps: 1`, `playbackRate: "throttle"`) replacing the `setInterval` hack
- Refactored per-slice random values from individual global variables into a `random_vars` array of objects, so each of the 36 slices retains its own independent randomised state across frames
- Moved date/time computation (`secs`, `mins`, `hours`, `redraw`) inside the render callback so values are re-evaluated every frame

### Added

- sketch 02 is now a working clock
  - Clock arc now starts at 12 o'clock (`rotate(degToRad(-90))`) and uses correct degree mapping: seconds ×6°, minutes ×6°, hours ×30°
  - Separate concentric arcs for minutes (`width * 0.18`) and hours (`width * 0.2`) in addition to the seconds arc (`width * 0.16`); all arcs use `lineWidth = 14`
  - 12 black divider rectangles drawn over the radial slices to visually separate clock hour positions.

### Added

- `sketches/02/sketch-02.js` — canvas transformations: `translate`, `rotate`, `save`/`restore`; draws 12 clock hour indicators arranged in a circle using trigonometry (`Math.sin`/`Math.cos`) and a `degToRad` helper utility

## [2.0.0] - 2026-04-20

### Added

- Installed `canvas-sketch` (^0.7.7) as a dependency in `sketches/`
- `sketches/sketch-01.js` — first canvas-sketch sketch

## [1.0.0] - 2026-04-17

### Added

- Initial project setup for Creative Coding course (Domestika)
- `01_hello.html` — Hello World HTML page
- Prettier formatting on save via `.vscode/settings.json`
