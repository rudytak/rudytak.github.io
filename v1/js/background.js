var canv;
let backgroundPoints = [];
const drag = 0.9999;
forceMult = 1;

function setup() {
    canv = createCanvas(innerWidth, innerHeight);
    appropriateCanvResize();

    frameRate(30);

    addDots();

    main();
}

function draw() {
    background(settings.settings.palette[0] + "23");

    var distTotal = 0;
    for (let bp of backgroundPoints) {
        distTotal += bp.update();
        bp.draw();
    }

    if (forceMult == Infinity || forceMult < 0.005) {
        addDots();
    }

    forceMult = pow(distTotal / (backgroundPoints.length * width), 2);
}

function windowResized() {
    appropriateCanvResize(); //Resize  of the canvas
    addDots();
}

function appropriateCanvResize() {
    if (canv.height > innerHeight) { // Add space for scroll bar
        document.body.style.overflowY = "scroll";
        resizeCanvas(innerWidth - 17, canv.height);
    } else {
        document.body.style.overflowY = "hidden"; // Get rid of scroll bar
        resizeCanvas(innerWidth, innerHeight);
    }
}

function addDots() {
    background(settings.settings.palette[0]);
    backgroundPoints = [];

    var a = random(-7, 7);
    var b = random(-7, 7);

    for (let i = 0; i < width * height / 2000; i++) { //Add the background dots
        var ang = random(0, 2 * PI);

        backgroundPoints.push(
            new Dot(
                createVector(
                    width / 2 + width / 4 * cos(ang) * random(0.85, 1),
                    height / 2 + width / 4 * sin(ang) * random(0.85, 1)
                ),
                createVector(
                    sin(ang) * a,
                    cos(ang) * b
                )
            )
        );
    }
}

class Dot {
    constructor(p, v) {
        this.pos = p; // Position vector
        this.vel = v; // Velocity vector
    }

    update() {
        // Move the dot
        this.pos.add(this.vel);

        this.vel.x -= (1 - drag) * pow(this.vel.x, 2) * Math.sign(this.vel.x);
        this.vel.y -= (1 - drag) * pow(this.vel.y, 2) * Math.sign(this.vel.y);

        /*
                this.pos.x = (this.pos.x + width) % width;
                this.pos.y = (this.pos.y + height) % height;*/

        // Calculate the distance of the point to the mouse
        var distance = dist(this.pos.x, this.pos.y, width * 2 / 4, height / 2);
        if (distance > 50) {
            // Calculate the gravitational force
            var force = (1 + forceMult) * 5000 / ((distance + 25) ** 2);
            // Add the force vector to the velocity vector of the point
            this.vel.add(force * (width * 2 / 4 - this.pos.x) / distance, force * (height / 2 - this.pos.y) / distance);
        }

        return (dist(this.pos.x, this.pos.y, width / 2, height / 2));
    }

    draw() {
        push();
        stroke(settings.settings.palette[2]+"60"); // Color
        strokeWeight(5); // Size
        point(this.pos.x, this.pos.y); // Draw the point
        pop();
    }
}