var x = "B";
var camNotFound = false;
var isMobile = false;

const arrAVG = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

var lastMO = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var lastEH = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var lastHa = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function setup() {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }

    navigator.getMedia = (navigator.getUserMedia || // use the proper vendor prefix
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    navigator.getMedia({ video: true }, function() {}, function() {
        camNotFound = true;
        check.checked = false;
    });

    loadCamera(250, 187, 3, 65);
    loadCanvas(250, 187, 3, 65);
    loadTracker();
}

function draw() {
    if (isMobile) {
        textAlign(CENTER);
        textSize(20);
        fill(255);
        text("Please open the page\non a desktop device!", width / 2, height / 2 - 30);
    } else if (camNotFound) {
        textAlign(CENTER);
        textSize(20);
        fill(255);
        text("Camera not found!\nCheck your camera and\ntry reloading the page.", width / 2, height / 2 - 30);
    } else {
        getPositions();

        clear();

        drawPoints();
    }
}

function drawPoints() {
    for (var i = 0; i < positions.length - 1; i++) {
        // draw line
        stroke(200);
        line(positions[i][0], positions[i][1], positions[i + 1][0], positions[i + 1][1]);

        // set the color of the ellipse based on position on screen
        fill(255);

        // draw ellipse
        noStroke();
        ellipse(positions[i][0], positions[i][1], 4, 4);
    }
}

function calcMouthOpen(outputRange) { //Calculte how open the mouth is
    try {
        var jawHeight = abs(positions[0][1] - positions[7][1]);

        lastMO.shift();
        lastMO.push(map(80 * (positions[60][1] - positions[57][1]) / jawHeight, -3, -11, outputRange[0], outputRange[1], true));

        return (arrAVG(lastMO));
    } catch (error) {
        return (null)
    }
} // -3, -11

function calcEyebrowHeight(outputRange) { //Calculte how high the eyebrows are
    try {
        retVal = 0;

        var jawHeight = abs(positions[0][1] - positions[7][1]);

        retVal += (positions[20][1] - positions[63][1]) / jawHeight
        retVal += (positions[21][1] - positions[63][1]) / jawHeight
        retVal += (positions[17][1] - positions[68][1]) / jawHeight
        retVal += (positions[16][1] - positions[67][1]) / jawHeight

        lastEH.shift();
        lastEH.push(map((retVal) * 50, -24, -33, outputRange[0], outputRange[1], true));

        return (arrAVG(lastEH));
    } catch (error) {
        return (null)
    }
} // -24, -33

function calcHappy(outputRange) { //Calculte happiness
    try {
        getEmotions();

        if (emotions) {
            lastHa.shift();
            lastHa.push(map(-predictedEmotions[3].value * 20, -1, -14, outputRange[0], outputRange[1], true));

            return arrAVG(lastHa);
        }
    } catch (error) {
        return null;
    }
} // -1, -15

function windowResized() {
    updateCamera();
    updateCanvas();
}