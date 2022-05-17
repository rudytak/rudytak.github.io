function mousePos() {
    var x = (mouseX - cameraPosition.x) / zoomVal;
    var y = (mouseY - cameraPosition.y) / zoomVal;

    var xMax = (width - cameraPosition.x) / zoomVal;
    var xMin = -cameraPosition.x / zoomVal;
    var yMax = (height - cameraPosition.y) / zoomVal;
    var yMin = -cameraPosition.y / zoomVal;

    return {
        x: constrain(x, xMin, xMax),
        y: constrain(y, yMin, yMax)
    }
}

function isInFrame(x, y) {
    var xMax = (width - cameraPosition.x) / zoomVal;
    var xMin = -cameraPosition.x / zoomVal;
    var yMax = (height - cameraPosition.y) / zoomVal;
    var yMin = -cameraPosition.y / zoomVal;

    return (x > xMin && x < xMax && y > yMin && y < yMax)
}

function zoom(type = "in", value = .1, focusX = width / 2, focusY = height / 2) {
    var dx;
    var dy;

    if (type != "in") {
        dx = (2 * focusX / width) * (width * (zoomVal - value) - width * zoomVal) * 1 / 2;
        dy = (2 * focusY / height) * (height * (zoomVal - value) - height * zoomVal) * 1 / 2;

        if (zoomVal - value > .1) {
            zoomVal -= value;

            cameraPosition.x -= dx;
            cameraPosition.y -= dy;
        }
    } else {
        dx = (2 * focusX / width) * (width * (zoomVal + value) - width * zoomVal) * 1 / 2;
        dy = (2 * focusY / height) * (height * (zoomVal + value) - height * zoomVal) * 1 / 2;

        if (zoomVal + value < 10) {
            zoomVal += value;

            cameraPosition.x -= dx;
            cameraPosition.y -= dy;
        }
    }
}

function pDistance(x, y, x1, y1, x2, y2) {

    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;

    return {
        point: {
            x: xx,
            y: yy
        },
        distance: Math.sqrt(dx * dx + dy * dy)
    }
}

function removeEmptyInputsFromBody() {
    var inputs = document.body.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == "text" && inputs[i].style.length == 0) {
            inputs[i].remove();
            i--;
        }
    }
}

function offPoints(center, off) {
    push();
    strokeWeight(10);
    point(
        center.x + off.x,
        center.y + off.y
    )
    point(
        center.x - off.x,
        center.y - off.y
    )


    stroke(0, 0, 255)
    point(
        center.x + off.x,
        center.y - off.y
    )
    point(
        center.x - off.x,
        center.y + off.y
    )
    pop();
}