const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 1,
  playbackRate: "throttle",
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
// Randomized vars
let random_vars = [];
canvasSketch(() => {
  return ({ context, width, height, playhead }) => {
    const date = new Date();
    const secs = date.getSeconds();
    const mins = date.getMinutes();
    const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const redraw = secs === 0;
    //console.log("frame " + secs);
    // Canvas background
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
    // Make now the slices
    const slices = 36;
    const slice = math.degToRad(360 / slices);
    //
    // Using trigonometry of place each slice around the external circle
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
      if (!random_vars[i] || redraw) {
        if (!random_vars[i]) {
          random_vars[i] = {};
        }
        random_vars[i].scale_x = random.range(0.1, 2);
        random_vars[i].scale_y = random.range(0.2, 0.8);
      }
      context.scale(random_vars[i].scale_x, random_vars[i].scale_y);
      //
      // Paint the square
      context.beginPath();
      // Paint the square accounting the translate
      // and put the center of the square in the middle of the rotation
      if (!random_vars[i].rect_y || redraw) {
        random_vars[i].rect_y = random.range(0, -h * 0.5);
      }
      context.rect(-w * 0.5, random_vars[i].rect_y, w, h);
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
      if (!random_vars[i].arc_lineWidth || redraw) {
        random_vars[i].arc_lineWidth = random.range(5, 20);
      }
      context.lineWidth = random_vars[i].arc_lineWidth;
      context.strokeStyle = color_elements;
      context.beginPath();
      if (!random_vars[i].arc_radio || redraw) {
        random_vars[i].arc_radio = radius * random.range(0.7, 1.3);
        random_vars[i].arc_start = slice * random.range(1, -8);
        random_vars[i].arc_end = slice * random.range(1, 5);
      }
      context.arc(
        0,
        0,
        random_vars[i].arc_radio,
        random_vars[i].arc_start,
        random_vars[i].arc_end,
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
    //
    // Paint the secs
    context.save();
    context.translate(cx, cy);
    context.rotate(math.degToRad(-90));
    context.lineWidth = 14;
    context.strokeStyle = color_highlight;
    context.beginPath();
    context.arc(0, 0, width * 0.14, 0, math.degToRad(secs * 6));
    context.stroke();
    // Mins
    context.beginPath();
    context.arc(0, 0, width * 0.16, 0, math.degToRad(mins * 6));
    context.stroke();
    // Hours
    context.beginPath();
    context.arc(0, 0, width * 018, 0, math.degToRad(hours * 30));
    context.stroke();
    //
    context.restore();
    //
    // Paint line dividers for hours
    for (let i = 0; i < 12; i++) {
      const angle = math.degToRad(360 / 12) * i;
      //   x = cx + radius * Math.sin(angle);
      //   y = cy + radius * Math.cos(angle);
      context.save();
      context.fillStyle = color_background;
      context.translate(cx, cy);
      context.rotate(-angle);
      context.beginPath();
      context.rect(-w * 0.1, 2, w * 1, h * 2.1);
      context.fill();
      context.restore();
    }
  };
}, settings);
