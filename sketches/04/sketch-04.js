const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const tweakPane = require("tweakpane");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const tweakPaneParams = {
  cols: 40,
  rows: 40,
  scaleMin: 1,
  scaleMax: 30,
  frequency: 0.001,
  amplitude: 0.5,
  animate: true,
  frame: 0,
  lineCap: "butt",
  backgroundColor: { r: 255, g: 255, b: 255 },
  linesColor: { r: 0, g: 0, b: 0 },
  fps: 60,
};

const sketch = () => {
  return ({ context, width, height, frame }) => {
    console.log(tweakPaneParams.backgroundColor);
    context.fillStyle = `rgb(
		${tweakPaneParams.backgroundColor.r}, 
		${tweakPaneParams.backgroundColor.g}, 
		${tweakPaneParams.backgroundColor.b}
	)`;
    context.fillRect(0, 0, width, height);

    // Grid vars
    // const cols =10;
    // const rows = 10;
    // With TweakPane params
    const cols = tweakPaneParams.cols;
    const rows = tweakPaneParams.rows;
    const numCells = cols * rows;

    const gridWidth = width * 0.8;
    const gridHeight = height * 0.8;
    const cellWidth = gridWidth / cols;
    const cellHeight = gridHeight / rows;
    const marginX = (width - gridWidth) * 0.5;
    const marginY = (height - gridHeight) * 0.5;

    // Let's iterate through all celd rows
    for (let i = 0; i < numCells; i++) {
      // To avoid a double loop, we use the remainder operator
      // to work on each col => the value resets from 0 to 3
      const col = i % cols;
      // In rows, the math floor sums 1 each 4 iterations
      const row = Math.floor(i / cols);
      // Find the position of each cell
      const x = col * cellWidth;
      const y = row * cellHeight;
      // Calculate cell's width and height with a 20% margin
      const w = cellWidth * 0.8;
      const h = cellHeight * 0.8;
      //
      // Frame control
      const frameControl = tweakPaneParams.animate
        ? frame
        : tweakPaneParams.frame;
      //
      // Using noise
      // x and y position, small frequency, amplitude
      // adding also frame to animate the lines (multiplied by 10 to accent the effect)
      //   const noise = random.noise2D(
      //     x + frame * 10,
      //     y,
      //     tweakPaneParams.frequency,
      //   );
      // Insetad use a 3d noise with frame as parameter for a more interesting result
      const noise = random.noise3D(
        x,
        y,
        frameControl * (tweakPaneParams.fps / 6),
        tweakPaneParams.frequency,
      );
      const angle = noise * Math.PI * tweakPaneParams.amplitude;
      //
      // The scale sets the thickness of the lines
      // We're using on of this methods to assure always a positive number between 1 and 30
      //const scale = (noise + 1) / 2 * 30;
      //const scale = (noise * 0.5 + 0.5) * 30;
      //const scale = math.mapRange(noise, -1, 1, 1, 30);
      // With Tweak Pane Params
      const scale = math.mapRange(
        noise,
        -1,
        1,
        tweakPaneParams.scaleMin,
        tweakPaneParams.scaleMax,
      );
      //
      // Let's draw!
      context.save();
      // Translate to the center of the cell
      context.translate(x, y);
      context.translate(marginX, marginY);
      context.translate(cellWidth * 0.5, cellHeight * 0.5);
      // Rotate the context to ad the noise
      context.rotate(angle);
      // Line style
      context.lineWidth = scale;
      context.lineCap = tweakPaneParams.lineCap;
      context.strokeStyle = `rgb(
		${tweakPaneParams.linesColor.r}, 
		${tweakPaneParams.linesColor.g}, 
		${tweakPaneParams.linesColor.b}
	)`;
      // Paint half before to half above
      context.beginPath();
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();
      // Restore
      context.restore();
    }
  };
};

const createPane = () => {
  const pane = new tweakPane.Pane();
  let folder;

  folder = pane.addFolder({ title: "Grid" });
  folder.addInput(tweakPaneParams, "lineCap", {
    options: {
      butt: "butt",
      round: "round",
      square: "square",
    },
  });
  folder.addInput(tweakPaneParams, "cols", { min: 2, max: 50, step: 1 });
  folder.addInput(tweakPaneParams, "rows", { min: 2, max: 50, step: 1 });
  folder.addInput(tweakPaneParams, "scaleMin", { min: 1, max: 100 });
  folder.addInput(tweakPaneParams, "scaleMax", { min: 1, max: 100 });

  folder = pane.addFolder({ title: "Noise" });
  folder.addInput(tweakPaneParams, "frequency", { min: -0.01, max: 0.01 });
  folder.addInput(tweakPaneParams, "amplitude", { min: 0, max: 1 });
  folder.addInput(tweakPaneParams, "fps", { min: 1, max: 300 });
  folder.addInput(tweakPaneParams, "animate");
  folder.addInput(tweakPaneParams, "frame", { min: 0, max: 999 });

  folder = pane.addFolder({ title: "Color" });
  folder.addInput(tweakPaneParams, "backgroundColor");
  folder.addInput(tweakPaneParams, "linesColor");
};

createPane();

canvasSketch(sketch, settings);
