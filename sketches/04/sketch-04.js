const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    // Grid vars
    const cols = 10;
    const rows = 10;
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
      // Let's draw!
      context.save();
      // Translate to the center of the cell
      context.translate(x, y);
      context.translate(marginX, marginY);
      context.translate(cellWidth * 0.5, cellHeight * 0.5);
      // Paint half before to half above
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.lineWidth = 4;
      context.stroke();
      // Restore
      context.restore();
    }
  };
};

canvasSketch(sketch, settings);
