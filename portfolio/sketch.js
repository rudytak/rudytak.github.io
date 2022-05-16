var canv;
let backgroundPoints = [];
const drag = 0.9999;
forceMult = 1;

function setup() {
    canv = createCanvas(innerWidth, innerHeight);
    appropriateCanvResize();

    frameRate(30);

    addDots();
}

function draw() {
    background(0, 35);

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