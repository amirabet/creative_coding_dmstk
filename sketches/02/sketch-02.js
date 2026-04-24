const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const settings = {
  dimensions: [1080, 1080],
};
//
// Colors
const color_background = "black";
const color_elements = "white";
const color_highlight = "red";
//
// Utility functions
// Not used since we are using now canvas-skecth-util
// const degToRad = (angle) => (angle * Math.PI) / 180;
// const randomRange = (min, max) => Math.random() * (max - min) + min;
//
const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = color_background;
    context.fillRect(0, 0, width, height);
    // The square to distort
    context.fillStyle = color_elements;
    const cx = width * 0.5;
    const cy = height * 0.5;
    // const w = width * 0.3;
    // const h = height * 0.3;
    //
    // Change the square into a rectangle that will be hour indicators
    const w = width * 0.01;
    const h = height * 0.1;
    //
    // Make now the hours indicators
    const slices = 36;
    const slice = math.degToRad(360 / slices);
    //
    // Using trigonometry of place each hour indicator around the external circle
    const radius = width * 0.3;
    let x, y;
    // With a loop
    for (let i = 0; i < slices; i++) {
      const angle = slice * i;
      x = cx + radius * Math.sin(angle);
      y = cy + radius * Math.cos(angle);
      // Before translate we save the state of the context
      context.save();
      // Let's translate the context
      // This will make the edge of the square
      // to be the center of the rotation
      context.translate(x, y);
      // Now rotate
      //context.rotate(0.3);
      // Change rotation from radiants to angles
      // To transform we use desired angle divided by 180 multiplied by PI
      //context.rotate((45 / 180) * Math.PI);
      //Using helper function
      //context.rotate(degToRad(45));
      // Rotating with negative angle to position hour marker
      context.rotate(-angle);
      //
      // We're gonna scale the canvas to add randomness
      // It will only affect the current hour markes
      // since we're restoring the context below
      //context.scale(Math.max(0.4, Math.random()) * 3, 1);
      // Using helper function
      context.scale(random.range(0.1, 2), random.range(0.2, 0.8));
      //
      // Paint the square
      context.beginPath();
      // Paint the square accounting the translate
      // and put the center of the square in the middle of the rotation
      context.rect(-w * 0.5, random.range(0, -h * 0.5), w, h);
      context.fill();
      // Recover the prevoius canvas state (before translate)
      context.restore();
      //
      // Decorational arcs
      // Recover canvas position
      context.save();
      context.translate(cx, cy);
      context.rotate(-angle);
      // Paint the arcs
      context.lineWidth = random.range(5, 20);
      context.strokeStyle = color_elements;
      context.beginPath();
      context.arc(
        0,
        0,
        radius * random.range(0.7, 1.3),
        slice * random.range(1, -8),
        slice * random.range(1, 5),
      );
      context.stroke();

      context.restore();
    }
    //
    // Circle removed
    // // Now we move the canvas
    //context.translate(100, 400);
    // // And paint a circle
    // context.beginPath();
    // context.arc(0, 0, 50, 0, Math.PI * 2);
    // context.fill();
  };
};

canvasSketch(sketch, settings);
