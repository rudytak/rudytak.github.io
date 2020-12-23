var canv;

function setup() {
    canv = createCanvas(innerWidth - 17, 2 * innerHeight);
}

function draw() {
    background(0);
}

function windowResized() {
    resizeCanvas(windowWidth, 2 * innerHeight);
}