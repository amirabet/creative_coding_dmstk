const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [600, 600],
  // we can use a string like 'A4' to set the size
  // see: https://github.com/mattdesl/canvas-sketch/blob/master/docs/physical-units.md#paper-size-presets
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    // Previous loop from erxercise 1
    const w = 60; // Could use percentages, for emxample width * 0.1;
    const h = 60;
    const gap = 20;
    let x, y;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        x = 110 + (w + gap) * i;
        y = 110 + (h + gap) * j;
        context.beginPath();
        context.rect(x, y, w, h);
        context.stroke();
        if (Math.random() > 0.5) {
          context.beginPath();
          context.rect(x + 8, y + 8, w - 16, h - 16);
          context.stroke();
        }
      }
    }
  };
};

canvasSketch(sketch, settings);
