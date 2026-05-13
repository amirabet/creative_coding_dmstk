const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
};

// Global vars
let manager;
let text = "Ç";
let fontSize = 1200;
let fontFamily = "serif";

// Create a new econdary canvas to render the character / type
const typeCanvas = document.createElement("canvas");
const typeContext = typeCanvas.getContext("2d");

const sketch = ({ context, width, height }) => {
  // Create a grid adapted to the canvas size
  const cell = 20;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;
  // And aply to the secondary canvas
  typeCanvas.width = cols;
  typeCanvas.height = rows;

  return ({ context, width, height }) => {
    // In this render function, we replaced this canvas context
    // for typeContext of the 2ary canvas' context
    // We also replace width by cols and heigh by rows
    typeContext.fillStyle = "azure";
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = cols;

    // Let's create the text!
    typeContext.fillStyle = "lightBlue";
    typeContext.font = `${fontSize}px ${fontFamily}`;
    typeContext.textBaseline = "top"; //"middle"; =< without TextMetrics
    //typeContexttextAlign = "center";

    // For a fine tunning character centering we will use measureText method
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingtypeContextD/measureText
    const metrics = typeContext.measureText(text);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    // Centering using metrics
    const typeX = (cols - mw) * 0.5 - mx;
    const typeY = (rows - mh) * 0.5 - my;

    // Paint a capital A letter in the middel of the canvas
    typeContext.save();
    //typeContexttranslate(width * 0.5, height * 0.5); // => without metrics
    typeContext.translate(typeX, typeY);

    // Demo visualize metrics
    // typeContextbeginPath();
    // typeContextrect(mx, my, mw, mh);
    // typeContextstroke();

    typeContext.fillText(text, 0, 0);
    typeContext.restore();

    // Draw the secondary canvas inside this canvas
    // First getThedata: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
    const typeData = typeContext.getImageData(0, 0, cols, rows).data;
    context.drawImage(typeCanvas, 0, 0);
    // Loop through Image Data: it contains RGBA info on each pixel
    // For each pixel we read data and paint the sqare accordingly
    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Position
      const x = col * cell;
      const y = row * cell;
      // Color
      const r = typeData[i * 4 + 0];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      context.fillStyle = `rgb(${r}, ${g}, ${b})`;

      context.save();
      context.translate(x, y);
      //context.fillRect(0, 0, cell, cell);
      //
      // We can also paint circles!
      context.translate(cell * 0.5, cell * 0.5);
      context.beginPath();
      context.arc(0, 0, cell * 0.5, 0, Math.PI * 2);
      context.fill();
      //
      context.restore();
    }
  };
};

// Listen to keboad events using Asyc
// https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#sketchmanager
const onKeyUp = (e) => {
  if (/^[a-zA-Z0-9ñÑçÇ]$/.test(e.key)) text = e.key;
  manager.render();
};

document.addEventListener("keyup", onKeyUp);

// Make a canvas-skecth call async
const start = async () => {
  manager = await canvasSketch(sketch, settings);
};
start();
//canvasSketch(sketch, settings);
