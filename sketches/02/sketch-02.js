const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
};

const degToRad = (angle) => (angle * Math.PI) / 180;
console.log(degToRad(180));

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    // The square to distort
    context.fillStyle = "black";
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
    const slices = 12;
    const slice = degToRad(360 / slices);
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
      // Paint the square
      context.beginPath();
      // Paint the square accounting the translate
      // and put the center of the square in the middle of the rotation
      context.rect(-w * 0.5, -h * 0.5, w, h);
      context.fill();
      // Recover the prevoius canvas state (before translate)
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
