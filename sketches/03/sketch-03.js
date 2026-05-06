const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

// Dummy function for animating without canvas sketch
const animate = () => {
  requestAnimationFrame(); // Will be called on every available frame in the browser (60fps)
  // In skecth, internally does this calling "return ({ context, width, height }) => {" each time
};

const sketch = ({ context, width, height }) => {
  // Creating an Array of randomized Agents
  const agents = [];
  // Filling with 40 values
  for (let i = 0; i < 40; i++) {
    const x = random.range(0, width);
    const y = random.range(0, height);
    agents.push(new Agent(x, y));
  }

  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    /* Examples of using Class and objects */
    // // Object example
    // const point = { x: 800, y: 400, radius: 10 };
    // // Use the object to paint an path
    // context.beginPath();
    // context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    // context.fillStyle = "white";
    // context.fill();

    // // Object from class example
    // const pointA = new PointClass(500, 100 /* Radius removed, 20*/);
    // // Use the object to paint an path
    // context.beginPath();
    // context.arc(pointA.x, pointA.y, /*pointA.radius*/ 10, 0, Math.PI * 2);
    // context.fillStyle = "white";
    // context.fill();

    // const pointB = new PointClass(100, 600);
    // // Use the object to paint an path
    // context.beginPath();
    // context.arc(pointB.x, pointB.y, 15, 0, Math.PI * 2);
    // context.fillStyle = "white";
    // context.fill();

    /* Creating Agents */
    //const agentA = new Agent(800, 400);
    //const agentB = new Agent(300, 700);
    // Drawing Agents using class' method
    //agentA.draw(context);
    //agentB.draw(context);

    // Create a loop to paint the lines joining agents
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      for (let j = i + 1; j < agents.length; j++) {
        // let j = i + 1; avoids unnecessary line repetitions
        const other = agents[j];
        // Calculate the distance between current agent and other agent
        const distance = agent.position.getDistance(other.position);
        // And paint only if is smaller than 300
        const minDistance = 300;
        if (distance > 300) continue;
        // Also set the thickness based on disntace
        context.lineWidth = math.mapRange(distance, 0, minDistance, 12, 1);
        // Paint the line between current agent and the others
        context.strokeStyle = "white";
        context.beginPath();
        context.moveTo(agent.position.x, agent.position.y);
        context.lineTo(other.position.x, other.position.y);
        context.stroke();
      }
    }
    // Paint and update the agents
    agents.forEach((agent) => {
      agent.update(); //Animation
      agent.draw(context);
      //agent.bounce(width, height);
      agent.wrap(width, height);
    });
  };
};

canvasSketch(sketch, settings);

// Create a Class for the Point Creation
//class PointClass ==> renamed to Vector
class VectorClass {
  //Constructor
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  // Method to calculate distance from another Vector
  getDistance(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// New Class for an Agent
class Agent {
  constructor(x, y) {
    this.position = new VectorClass(x, y);
    this.velocity = new VectorClass(random.range(-1, 1), random.range(-1, 1));
    this.radius = random.range(4, 12);
  }
  // Method for drawing the agent
  draw(context) {
    context.save();
    context.fillStyle = "black";
    context.lineWidth = 4;
    context.strokeStyle = "white";
    // We'll draw translating the canvas
    context.translate(this.position.x, this.position.y);
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }
  // Method for animating the Agent
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  // Method to avoid points going out of the screen by bouncing on the edge
  bounce(width, height) {
    if (this.position.x <= 0 || this.position.x >= width) this.velocity.x *= -1;
    if (this.position.y <= 0 || this.position.y >= height)
      this.velocity.y *= -1;
  }
  // Exercise 4.1
  // When a point reahes de canvas limit, it appears on the other side
  wrap(width, height) {
    if (this.position.x < 0) this.position.x = width;
    if (this.position.x > width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = height;
    if (this.position.y > height) this.position.y = 0;
  }

  /* Export this sketch to video: 
  https://github.com/mattdesl/canvas-sketch/blob/master/docs/exporting-artwork.md#exporting-other-file-types */
}
