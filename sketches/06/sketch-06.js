const canvasSketch = require("canvas-sketch");

const constellationsData = require("./constellations.json");

const settings = {
  dimensions: [1080, 1080],
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "MidnightBlue";
    context.fillRect(0, 0, width, height);

    // loop all constellations
    for (const [constellationName, constellation] of Object.entries(
      constellationsData.constellations,
    )) {
      // Paint stars
      for (const star of constellation.stars) {
        const { name, coordinates, brightness, size } = star;
        const x = coordinates.x * width;
        const y = coordinates.y * height;

        context.fillStyle = "LightCyan";
        context.beginPath();
        context.arc(x, y, size * 0.5, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Paint Lines
  };
};

canvasSketch(sketch, settings);
