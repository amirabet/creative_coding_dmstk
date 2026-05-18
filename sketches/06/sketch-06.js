const canvasSketch = require("canvas-sketch");

const constellationsData = require("./constellations_v3.json");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const getStarFillColor = (brightness) => {
  const minColor = { red: 0, green: 0, blue: 205 };
  const maxColor = { red: 224, green: 255, blue: 255 };
  const intensity = Math.max(0, Math.min(brightness, 10)) / 10;

  const red = Math.round(
    minColor.red + (maxColor.red - minColor.red) * intensity,
  );
  const green = Math.round(
    minColor.green + (maxColor.green - minColor.green) * intensity,
  );
  const blue = Math.round(
    minColor.blue + (maxColor.blue - minColor.blue) * intensity,
  );

  return `rgb(${red}, ${green}, ${blue})`;
};

const getStarBlinkAmount = (time, x, y, brightness) => {
  const phaseOffset = x * 17 + y * 31 + brightness * 0.2;
  const pulse = (Math.sin(time * 4 + phaseOffset) + 1) / 2;

  return 0.45 + pulse * 0.55;
};

const raDecToXY = (ra, dec) => {
  // RA: 0–24 horas
  // DEC: -90 a +90 grados

  const rotationOffset = Math.PI / 2; // prueba 90°
  const angle = (1 - ra / 24) * 2 * Math.PI + rotationOffset;

  // radius is normalized to the canvas half-size so DEC=0 lands on the rim
  const radius = ((90 - dec) / 90) * 0.5;

  const xPos = 0.5 + radius * Math.cos(angle);
  const yPos = 0.5 - radius * Math.sin(angle); // ← importante invertir Y

  return { xPos, yPos };
};

const drawTextOnArc = (
  context,
  text,
  arcCenterX,
  arcCenterY,
  radius,
  centerAngle,
) => {
  const spacing = 4;
  const characters = [...text].reverse();
  const characterAngles = characters.map(
    (character) => (context.measureText(character).width + spacing) / radius,
  );
  const totalAngle = characterAngles.reduce(
    (sum, characterAngle) => sum + characterAngle,
    0,
  );

  let currentAngle = centerAngle - totalAngle / 2;

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    const characterAngle = characterAngles[i];

    currentAngle += characterAngle / 2;

    const x = arcCenterX + Math.cos(currentAngle) * radius;
    const y = arcCenterY + Math.sin(currentAngle) * radius;
    const tangentAngle = currentAngle - Math.PI / 2;

    context.save();
    context.translate(x, y);
    context.rotate(tangentAngle);
    context.strokeText(character, 0, 0);
    context.fillText(character, 0, 0);
    context.restore();

    currentAngle += characterAngle / 2;
  }
};

// Create a new secondary canvas to render the character / type
// const planetariumCanvas = document.createElement("canvas");
// const context = planetariumCanvas.getContext("2d");
const constellations = constellationsData.constellations.flatMap((entry) =>
  Array.isArray(entry.constellations) ? entry.constellations : [entry],
);
let constellationsList = "";
for (const constellation of constellations) {
  constellationsList += "" + constellation.name + ", ";
}
console.log(constellationsList);
const sketch = () => {
  return ({ context, width, height, time }) => {
    // Set secondary plantarium size
    // planetariumCanvas.width = width;
    // planetariumCanvas.height = height;

    // Radius for planetary Canvas
    // const radGradient = context.createRadialGradient(
    //   width / 2,
    //   height / 2,
    //   width / 2,
    //   width / 2,
    //   height / 2,
    //   width / 5,
    // );
    // radGradient.addColorStop(0, "MidnightBlue");
    // radGradient.addColorStop(0.9, "DarkBlue");
    // radGradient.addColorStop(1, "DarkBlue");
    // context.fillStyle = radGradient;

    context.fillStyle = "MidnightBlue";
    context.fillRect(0, 0, width, height);

    // Create circles and lines for sky map
    const centerX = width / 2;
    const centerY = height / 2;
    const firstCircleRadius = width / 12.2;
    const lastCircleRadius = (width / 12.2) * 6;

    for (let i = 0; i < 6; i++) {
      context.beginPath();
      context.arc(centerX, centerY, (width / 12.2) * (i + 1), 0, Math.PI * 2);
      context.strokeStyle = "RoyalBlue";
      context.lineWidth = 1;
      context.stroke();
    }

    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const startX = centerX + Math.cos(angle) * firstCircleRadius;
      const startY = centerY + Math.sin(angle) * firstCircleRadius;
      const endX = centerX + Math.cos(angle) * lastCircleRadius;
      const endY = centerY + Math.sin(angle) * lastCircleRadius;

      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.strokeStyle = "RoyalBlue";
      context.lineWidth = 1;
      context.stroke();
    }

    // loop all constellations
    for (const constellation of constellations) {
      const starsByName = Object.fromEntries(
        constellation.stars.map((star) => [
          star.name,
          { ...star, ...raDecToXY(star.ra, star.dec) },
        ]),
      );
      const bounds = Object.values(starsByName).reduce(
        (accumulator, star) => ({
          minX: Math.min(accumulator.minX, star.xPos),
          minY: Math.min(accumulator.minY, star.yPos),
          maxX: Math.max(accumulator.maxX, star.xPos),
          maxY: Math.max(accumulator.maxY, star.yPos),
        }),
        {
          minX: Number.POSITIVE_INFINITY,
          minY: Number.POSITIVE_INFINITY,
          maxX: Number.NEGATIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
        },
      );

      // Paint Lines
      context.strokeStyle = "LightCyan";
      context.lineWidth = 2;

      for (const path of constellation.paths) {
        for (let i = 0; i < path.length - 1; i++) {
          const startStar = starsByName[path[i]];
          const endStar = starsByName[path[i + 1]];

          if (!startStar || !endStar) continue;

          context.beginPath();
          context.moveTo(startStar.xPos * width, startStar.yPos * height);
          context.lineTo(endStar.xPos * width, endStar.yPos * height);
          context.lineWidth = 1;
          context.strokeStyle = "PaleGoldenRod";
          context.stroke();
        }
      }

      // Paint stars
      for (const star of Object.values(starsByName)) {
        const { ra, dec, xPos, yPos, size, brightness } = star;
        const blinkAmount = getStarBlinkAmount(time, xPos, yPos, brightness);
        context.save();
        context.globalAlpha = blinkAmount;
        context.fillStyle = getStarFillColor(brightness);
        context.beginPath();
        context.arc(
          xPos * width,
          yPos * height,
          size * (0.45 + blinkAmount * 0.25),
          0,
          Math.PI * 2,
        );
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = "PaleGoldenRod";
        context.stroke();
        context.restore();
      }

      // Paint constellations' name
      const centerX = ((bounds.minX + bounds.maxX) * width) / 2;
      const centerY = ((bounds.minY + bounds.maxY) * height) / 2;
      const textAngle = Math.atan2(centerY - height / 2, centerX - width / 2);
      const textRadius = Math.hypot(centerX - width / 2, centerY - height / 2);

      const boundsSpan = Math.hypot(
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
      );
      const fontSize = Math.round(10 + Math.min(boundsSpan / 0.5, 1) * 6);

      context.fillStyle = "LightSkyBlue";
      context.font = `${fontSize}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.strokeStyle = "MidnightBlue";
      context.lineWidth = 4;
      drawTextOnArc(
        context,
        constellation.name.toUpperCase(),
        width / 2,
        height / 2,
        textRadius,
        textAngle,
      );
    }
    // Paint the planetary canvas in the main canvas
    // context.drawImage(
    //   planetariumCanvas,
    //   (width - width * 1.8) / 2,
    //   -height * 0.88,
    //   width * 1.8,
    //   height * 1.8,
    // );
    //context.drawImage(planetariumCanvas, 0, 0, width, height);
  };
};

canvasSketch(sketch, settings);

/* TODOs  
- Imporve draco unions
- Improve other constellations shapes
- Change size and brightness of stars based on their magnitude and size (units are different)
- Think how can Aquarius and Capricorn be visible
- Recover second canvas to simplify scaling and rotation
- Visible star's names on hover
- Implement tweakpanel with options

*/
