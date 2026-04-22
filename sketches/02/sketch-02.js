const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    // The square to distort
    context.fillStyle = "black";
    const x = width * 0.5;
    const y = height * 0.5;
    const w = width * 0.3;
    const h = height * 0.3;
    // Before translate we save the state of the context
    context.save();
    // Let's translate the context
    // This will make the edge of the square
    // to be the center of the rotation
    context.translate(x, y);
    // Now rotate
    context.rotate(0.3);
    // Paint the square
    context.beginPath();
    // Paint the square accounting the translate
    // and put the center of the square in the middle of the rotation
    context.rect(-w * 0.5, -h * 0.5, w, h);
    context.fill();
    // Recover the prevoius canvas state (before trannslate)
    context.restore();
    // Now we move the canvas
    context.translate(100, 400);
    // And paint a square
    context.beginPath();
    context.arc(0, 0, 50, 0, Math.PI * 2);
    context.fill();
  };
};

canvasSketch(sketch, settings);
