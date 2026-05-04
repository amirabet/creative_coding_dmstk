const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [1080, 1080],
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
    agents.forEach((agent) => {
      agent.draw(context);
    });
  };
};

canvasSketch(sketch, settings);

// Create a Class for the Point Creation
class PointClass {
  //Constructor
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// New Class for an Agent
class Agent {
  constructor(x, y) {
    this.position = new PointClass(x, y);
    this.radius = 10;
  }
  // Method for drawing the agent
  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();
  }
}
