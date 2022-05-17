/*

Global variables to make our life easier

*/

var ctracker;
var videoInput;
var positions = [];
var canvas;

var camx = 0;
var camy = 0;
var canvx = 0;
var canvy = 0;

/*

Load & align the canvas to match the underlying html5 video element

*/

function loadCanvas(w, h, x, y) {
    canvx = x;
    canvy = y;
    canvas = createCanvas(w, h);
    canvas.position(innerWidth / 100 * canvx, innerHeight / 100 * canvy);
}

function updateCanvas() {
    canvas.position(innerWidth / 100 * canvx, innerHeight / 100 * canvy);
}

/*

Load the capture device, align under the canvas & mute it to avoid audiofeedback

*/

function loadCamera(w, h, x, y) {
    camx = x;
    camy = y;
    videoInput = createCapture(VIDEO);
    videoInput.size(w, h);
    videoInput.position(innerWidth / 100 * camx, innerHeight / 100 * camy);
    videoInput.id("v");
    var mv = document.getElementById("v");
    mv.muted = true;
}

function updateCamera() {
    videoInput.position(innerWidth / 100 * camx, innerHeight / 100 * camy);
}
/*

Load ClmTracker, apply to the video element

*/

function loadTracker() {
    // setup tracker
    ctracker = new clm.tracker();
    ctracker.init(pModel);
    ctracker.start(videoInput.elt);
}

/*

Get current face feature point positions. Should go into the draw() function

*/

function getPositions() {
    // get array of face marker positions [x, y] format
    positions = ctracker.getCurrentPosition();
}


/* 

Get current emotion predictions. Should go into the draw() function

*/

function getEmotions() {
    var cp = ctracker.getCurrentParameters();
    predictedEmotions = emotions.meanPredict(cp);
}

/*

Emotion-specific global variables

*/

delete emotionModel['disgusted'];
delete emotionModel['fear'];
var emotions = new emotionClassifier();
var predictedEmotions;
emotions.init(emotionModel);
var emotionData = emotions.getBlank();