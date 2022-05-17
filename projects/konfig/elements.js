/**
 * @param {PointManager} pointManager The pointManager parent
 * @param {Number} x The x coordinate (0 by default)
 * @param {Number} y The y coordinate (0 by default)
 * @param {Number} id The id of the point (-1 by default)
 */
class Point {
    constructor(pointManager, x = 0, y = 0, id = -1) {
        // POINT MANAGER REFERENCE
        this.parent = pointManager;

        // POSITION AND SIZE
        this.x = x;
        this.y = y;
        this.size = 7;

        //ANGLE
        this.angle = null;

        // MOUSE INTERATIONS
        this.mouseOver = function(include = true) {
            var ret = false;
            ret = ret || collidePointPoint(mousePos().x, mousePos().y, this.x, this.y, this.size / 2);

            for (var d of this.descriptors) {
                ret = ret || d.mouseOver();
            }

            if (this.angle != null && include) {
                ret = ret || this.angle.mouseOver(false);
            }
            return ret;
        };

        // ELEMENT DESCRIPTORS
        this.descriptors = []

        // DRAGGING DATA
        this.locked = false;
        this.xoffset = 0;
        this.yoffset = 0;

        // OTHER
        this.c = "grey";
        this.id = id;
        this.type = "Point";

        this.saved = false;
    }

    draw(truePosition = true, forceHover = false) {
        push();

        // Set the default color
        stroke(this.c);
        fill(this.c);

        if ((this.parent.allowHover && this.mouseOver() && this.parent.hoveringObject == this) || forceHover) { // Mouse is over the point and this point is the points managers hoveringObject
            // Make the size bigger
            this.size = 15;

            if (mouseIsPressed) { // Mouse is held down at the same time
                // Set different color scheme -> red stroke, white fill
                stroke(200, 79, 100);
                fill("white");

                // Set stroke weight
                strokeWeight(2 * zoomVal);
            } else { // Mouse isn't held down at the same time
                // Turn off stroke    
                noStroke();
            }

        } else { //Mouse isn't over the point
            // Make the size smaller
            this.size = 7;

            // Turn off stroke
            noStroke();
        }

        //Draw the ellipse
        if (truePosition) {
            ellipse(this.x, this.y, this.size, this.size);
        } else {
            ellipse(0, 0, this.size, this.size);
        }
        pop();
    }

    drawDescriptors() {
        // Draw all the descriptors
        for (var d of this.descriptors) {
            d.draw();
        }
    }

    setAngle(angle) {
        this.angle = angle;
        if (this.angle.point != this) {
            this.angle.setPoint(this)
        }
    }

    lock(val) {
        this.locked = val;
        if (!this.parent.snapToG) {
            this.xoffset = mousePos().x - this.x;
            this.yoffset = mousePos().y - this.y;
        } else {
            this.xoffset = 0;
            this.yoffset = 0;
        }

        if (this.angle != null) {
            this.angle.locked = val;
        }
    }
}



/**
 * @param {PointManager} pointManager The pointManager parent
 * @param {Number} x The x coordinate (0 by default)
 * @param {Number} y The y coordinate (0 by default)
 * @param {Number} start The absolute starting angle (0 by default)
 * @param {Number} stop The absolute ending angle (0 by default)
 * @param {Number} id The id of the angle (-1 by default)
 */
class Angle {
    constructor(pointManager, x = 0, y = 0, start = 0, stop = 0, id = -1) {
        // POINT MANAGER REFERENCE
        this.parent = pointManager;

        // POSITION AND SIZE
        this.x = x;
        this.y = y;
        this.radius = 30;

        // ANGLE
        this.start = start;
        this.stop = stop;
        this.relative = this.stop - this.start;
        if (this.relative < 0) this.relative = this.relative + PI * 2;

        // POINT
        this.point = null;

        // MOUSE INTERATIONS
        this.mouseOver = function(include = true) {
            var ret = false;
            ret = ret || collidePointArc(mousePos().x, mousePos().y, this.x, this.y, this.radius / 2, this.start + this.relative / 2, this.relative);

            for (var d of this.descriptors) {
                ret = ret || d.mouseOver();
            }

            if (this.point != null && include) {
                ret = ret || this.point.mouseOver(false);
            }
            return ret;
        };

        // ELEMENT DESCRIPTORS
        this.descriptors = [
            new ElementDescriptor(
                this.x - this.radius * cos(this.start + this.relative / 2),
                this.y - this.radius * sin(this.start + this.relative / 2),
                0, round(this.relative * 180 / PI, 2) + "°")
        ]

        // OTHER
        this.c = "grey";
        this.id = id;
        this.type = "Angle";

        this.saved = false;
    }

    draw(truePosition = true, forceHover = false) {
        push();
        // Set the default color
        stroke(this.c);
        noFill();

        var hover = false;
        if (this.point != null) {
            hover = this.parent.hoveringObject == this.point && this.point.mouseOver();
        }
        if ((this.parent.allowHover && hover) || forceHover) { // Mouse is over the angle
            // Set to larger thickness
            strokeWeight(4 * zoomVal);
        } else { // Mouse isn't over the point
            // Set to smaller thickness
            strokeWeight(2 * zoomVal);
        }

        if (truePosition) {
            arc(this.x, this.y, this.radius, this.radius, this.start, this.stop);
        } else {
            arc(0, 0, this.radius, this.radius, 0, this.relative);
        }
        pop();
    }

    drawDescriptors() {
        // Draw all the descriptors
        for (var d of this.descriptors) {
            d.draw();
        }
    }

    setPoint(point) {
        this.point = point;
        if (this.point.angle != this) {
            this.point.setPoint(this)
        }
    }

    lock(val) {
        this.locked = val;
        this.xoffset = mousePos().x - this.x;
        this.yoffset = mousePos().y - this.y;

        if (this.point != null) {
            this.point.locked = val;
        }
    }
}



/**
 * @param {PointManager} pointManager The pointManager parent (no default value)
 * @param {Point} point1 The first point (new Point() by default)
 * @param {Point} point2 The second point (new Point() by default)
 * @param {Number} id The id of the line (-1 by default)
 */
class Line {
    constructor(pointManager, point1 = new Point(), point2 = new Point(), id = -1) {
        // POINT MANAGER REFERENCE
        this.parent = pointManager;

        // POSITION AND SIZE
        this.points = [point1, point2];
        this.length = dist(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y);
        this.thickness = 2;
        this.x = (this.points[0].x + this.points[1].x) / 2;
        this.y = (this.points[0].y + this.points[1].y) / 2;

        // ANGLE
        this.dx = (this.points[1].x - this.points[0].x);
        this.dy = (this.points[1].y - this.points[0].y);
        this.angle = Math.atan2(this.dy, this.dx)

        // MOUSE INTERATIONS
        this.mouseOver = function() {
            var ret = false;
            ret = ret || collidePointLine(mousePos().x, mousePos().y, this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.thickness / 8);
            for (var d of this.descriptors) {
                ret = ret || d.mouseOver();
            }
            return ret;
        };

        // ELEMENT DESCRIPTORS
        var text;
        if (this.parent.convertToUnit) {
            text = round(this.length * this.parent.grid.conversionToUnit, 2) + " " + this.parent.grid.unit
        } else text = round(this.length, 2);

        this.descriptors = [
            new ElementDescriptor(this.x, this.y, this.angle, text, { x: 0, y: -7 }) // Length descriptor
        ]

        // OTHER
        this.c = "grey";
        this.id = id;
        this.type = "Line";

        this.saved = false;
        this.isOuter = null;
        this.between = false;
        this.nextTo = false;
    }

    toSimple() {
        return {
            x1: this.points[0].x,
            y1: this.points[0].y,
            x2: this.points[1].x,
            y2: this.points[1].y
        }
    }

    reCalc() {
        // POSITION AND SIZE
        this.length = dist(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y);
        this.thickness = 2;
        this.x = (this.points[0].x + this.points[1].x) / 2;
        this.y = (this.points[0].y + this.points[1].y) / 2;

        // ANGLE
        this.dx = (this.points[1].x - this.points[0].x);
        this.dy = (this.points[1].y - this.points[0].y);
        this.angle = Math.atan2(this.dy, this.dx)

        var text;
        if (this.parent.convertToUnit) {
            text = round(this.length * this.parent.grid.conversionToUnit, 2) + " " + this.parent.grid.unit
        } else text = round(this.length, 2);

        this.descriptors = [
            new ElementDescriptor(this.x, this.y, this.angle, text, { x: 0, y: -7 }) // Length descriptor
        ]
    }

    draw(truePosition = true, forceHover = false) {
        push();

        // Set the default color
        stroke(this.c);
        fill(this.c);
        strokeWeight(this.thickness * zoomVal);

        if ((this.parent.allowHover && this.mouseOver() && this.parent.hoveringObject == this) || forceHover) { // Mouse is over the point
            // Set to larger thickness
            this.thickness = 4;
        } else { // Mouse isn't over the point
            // Set to smaller thickness
            this.thickness = 2;
        }

        if (truePosition) {
            line(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y);
        } else {
            line(0, 0, 0, this.length);
        }
        pop();
    }

    drawDescriptors() {
        // Draw all the descriptors
        for (var d of this.descriptors) {
            d.draw();
        }
    }

    getAngleDeg() { return this.angle * 180 / PI }

    lock(val) {
        // Lock both points
        this.points[0].lock(val);
        this.points[1].lock(val);
    }

    update() {
        this.reCalc();
    }
}



/**
 * @param {Number} x The x coordinate
 * @param {Number} y The y coordinate
 * @param {Number} r The rotation
 * @param {string} text The text
 * @param {Object} offset The offset ({ x: 0, y: 0 } by default)
 */
class ElementDescriptor {
    constructor(x, y, r, text, offset = { x: 0, y: 0 }) {
        // POSITION, ROTATTION
        this.x = x;
        this.y = y;
        this.r = r;
        this.offset = offset;
        this.textSize = 10;

        // TEXT
        this.text = text.toString();
        this.c = "gray";

        // SIZE
        this.h = 10;
        this.w = (this.text.length * this.h * 7 / 10); // Approximate width

        // MOUSE INTERATIONS
        this.mouseOver = function() {
            return collidePointCircle(mousePos().x, mousePos().y, // Mouse
                this.x + this.offset.x * sin(this.r), // Collider x
                this.y + this.offset.y * cos(this.r), // Collider y
                7 / 10 * this.w); // Collider size
        };

        // OTHER
        this.type = "ElementDescriptor";
    }

    draw() {
        push();

        // This is the approximate collider
        // ellipse(this.x + this.offset.x * sin(this.r), this.y + this.offset.y * cos(this.r), 7 / 10 * this.w)

        // Prepare for drawing
        noStroke();
        fill(this.c);
        translate(this.x, this.y);
        rotate(this.r);

        // Prepare text
        textFont(nickainley);
        textSize(this.textSize);
        textAlign(CENTER, CENTER)

        // Draw text
        text(this.text, this.offset.x, this.offset.y - this.h / 2);

        pop();
    }
}

class Grid {
    /**
     * The constructor of the Grid object.
     * @param {PointManager} pointManager Reference to the PointManage object
     * @param {Number} cellSize The size of the grid cell.
     */
    constructor(pointManager, cellSize) {
        this.parent = pointManager;
        this.cellSize = cellSize;

        this.unit = "m";
        this.conversionToUnit = 1 / 50;
    }

    /**
     * Function for drawing the grid.
     */
    draw() {
        // Draw the grid
        push();

        stroke(128, 64);
        strokeWeight(1);

        var xMax = (width - cameraPosition.x) / zoomVal;
        var xMin = -cameraPosition.x / zoomVal;
        var yMax = (height - cameraPosition.y) / zoomVal;
        var yMin = -cameraPosition.y / zoomVal;

        //Draw the vertical line
        for (let x = this.cellSize * ceil(xMin / this.cellSize); x <= xMax; x += this.cellSize) {
            line(x, yMin, x, yMax);
        }

        //Draw the horizontal lines
        for (let y = this.cellSize * ceil(yMin / this.cellSize); y <= yMax; y += this.cellSize) {
            line(xMin, y, xMax, y);
        }
        pop();
    }

    /**
     * Function that returns the position of the closest snap point.
     * @param {Number} x X position of the original point that is being snapped
     * @param {Number} y Y position of the original point that is being snapped
     * @param {Array} otherPoints Array of other points that could be snapped to ([] by default)
     * @param {Array} otherLines Array of other lines that could be snapped to ([] by default)
     */
    getClosestSnap(x, y, otherPoints = [], otherLines = []) {
        // The position as a measure of cells
        var cellX = x / this.cellSize;
        var cellY = y / this.cellSize;

        // Save the current closest position
        var closestPosition = {
            x: this.cellSize * Math.round(cellX),
            y: this.cellSize * Math.round(cellY)
        }

        // Loop through all the otherPoints
        for (var p of otherPoints) {
            if (dist(p.x, p.y, x, y) < dist(closestPosition.x, closestPosition.y, x, y)) {
                closestPosition = {
                    x: p.x,
                    y: p.y
                }
            }
        }

        // Loop through all the otherPoints
        for (var p of otherLines) {
            if (pDistance(x, y, p.points[0].x, p.points[0].y, p.points[1].x, p.points[1].y).distance + 3 < dist(closestPosition.x, closestPosition.y, x, y)) {
                closestPosition = pDistance(x, y, p.points[0].x, p.points[0].y, p.points[1].x, p.points[1].y).point;
            }
        }

        // Return the snapped point by rounding the values
        if (dist(x, y, closestPosition.x, closestPosition.y) < this.cellSize / (3)) {
            return (closestPosition)
        } else {
            return {
                x: x,
                y: y
            }
        }
    }

    toPixels(x) {
        return (x / this.conversionToUnit)
    }

    toUnit(x) {
        return (this.conversionToUnit * x)
    }
}