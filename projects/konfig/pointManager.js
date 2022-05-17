class PointManager {

    // CREATION

    /**
     * The PointManager constructor.
     * @param {Array} points Array of all the points ([] by default)
     */
    constructor(points = []) {
        //POINTS AND LENGTHS
        this.points = points;
        this.lines = [];
        this.additionalLines = [];
        this.additionalPoints = [];

        // ANGLES
        this.relativeAngles = [];
        this.getRelativeAngle = function(id) { return this.relativeAngles[id] * 180 / PI };

        // CHANGING ANGLE DATA
        this.finished = false;
        this.changingData = {
            changing: false, // Changing in process
            itemID: 0, // The id in the item in it's array
            itemPos: { // the position of the item (the input gets moved to thes position)
                x: -100,
                y: -100
            },
            object: null, // The changed item
            input: document.createElement("DIV"), // The input field itself
            maxFrameDuration: 10, // the longest period the mouse can be clicked for the pop-up winwo to appear
            clickFrame: 0 // the frame at wich the item was clicked
        }
        this.changingData.input.classList.add("input-group")
        this.changingData.input.innerHTML = `
            <div class="input-group-prepend"><span class="input-group-text"></span></div>
            <input class="form-control" type="number" step="250" value="0" id="example-number-input">
        `
        document.getElementById("ProfileChangeDiv").appendChild(this.changingData.input);
        this.changingData.input.style.display = "none";

        // GRID
        this.grid = new Grid(this, 20);
        this.snapToG = false;
        this.convertToUnit = false;

        // CLOSING
        this.closed = false;
        this.closingLine = null;
        this.closingAngle = 0;

        //OTHER
        this.hoveringObject = null;
        this.allowHover = true;
        this.remove180DegCorners = false;
        this.changeLineLengthConservative = false;

        this.dragging = false;
        this.doUpdateCall = false;
        this.updateCall = function() {};

        this.update();
    }

    /**
     * Function which updates the lines according to the current point positions.
     */
    update() {
        // Add all the lines
        var newLines = [];
        for (var i = 1; i < this.points.length; i++) {
            if (this.lines[i - 1] != undefined) {
                var lastCol = this.lines[i - 1].c
                newLines.push(new Line(this, this.points[i - 1], this.points[i], i - 1));
                newLines[i - 1].isOuter = true;
                newLines[i - 1].c = lastCol;
            } else {
                newLines.push(new Line(this, this.points[i - 1], this.points[i], i - 1));
                newLines[i - 1].isOuter = true;
            }
        }

        this.lines = []
        this.lines = newLines;

        //Add the connecting line if the shape should be closed
        if (this.closed) {
            this.closingLine = new Line(this, this.points[this.points.length - 1], this.points[0], -1);
            this.closingLine.isOuter = true;
            //We might want to differenciate the closing line by changing it's color
            this.closingLine.c = "darkgrey"

            this.closingAngle = PI - this.closingLine.angle + this.lines[0].angle;
            this.closingAngle = 2 * PI - (this.closingAngle + 2 * PI) % (2 * PI)
        }

        // Recalculate all lengths of additionalLines
        for (var al of this.additionalLines) {
            al.update();
            al.isOuter = false;
        }

        // Calculate relative angles between lines
        this.calculateRelativeAngles();

        //Reset all point ids
        for (var p = 0; p < this.points.length; p++) {
            if (this.points[p].angle != null) {
                if (round(this.points[p].angle.relative, 5) == round(PI, 5) && !this.points[p].connectedToAddLine && this.remove180DegCorners) {
                    this.removePoint(this.points[p]);
                    p--;
                } else {
                    this.points[p].id = p;
                }
            } else {
                this.points[p].id = p;
            }
        }

        if (this.doUpdateCall) { this.updateCall(); }
    }

    // DRAWING

    /**
     * The main draw fucntion. This is to be called in the draw loop of p5.
     * @param {Boolean} includeDescriptors Boolen that turns on or off the drawing of descriptors.
     */
    draw(includeDescriptors = true) {
        //Draw the grid
        if (!showModel) {}
        this.grid.draw();
        // There has to be at least one point to draw
        if (this.points.length != 0) {
            // Draw the barebones structure
            this.drawRecursive(Object.create(this.points), Object.create(this.lines));

            // Set the object from this PointManager, that the mouse is over to null by default
            this.hoveringObject = null;

            // Draw the descriptors
            for (var p of this.points) {
                // Check if any of the points is hovered and no other was chosen yet, if it is, set it to be the hoveringObject
                if (p.mouseOver() && this.hoveringObject == null) {
                    this.hoveringObject = p;
                }

                if (includeDescriptors) {
                    // Draw the point descriptors (better said angles of the points and the angle descriptors)
                    if (p.angle != null) {
                        p.angle.draw();
                        p.angle.drawDescriptors();
                    }
                    //Draw descriptors of the closing line
                    if (this.closed) {
                        if (this.closingLine.mouseOver()) this.hoveringObject = this.closingLine;
                        this.closingLine.drawDescriptors();
                    }
                }
            }
            for (var l of this.lines) {
                // Check if any of the lines is hovered and no other was chosen yet, if it is, set it to be the hoveringObject
                if (l.mouseOver() && this.hoveringObject == null) {
                    this.hoveringObject = l;
                }

                if (includeDescriptors) {
                    // Draw the line descriptors
                    l.drawDescriptors();
                }
            }

            for (var a of this.additionalLines) {
                if (a.mouseOver()) { this.hoveringObject = a }
                a.draw(true);
            }
            for (var a of this.additionalPoints) {
                if (a.mouseOver()) { this.hoveringObject = a }
                a.draw(true);
            }

        } else { // If there are no points -> start drawing
            this.finished = false;
        }

        // If there is data being changed
        if (this.changingData.changing) {
            var off = document.getElementById("canvas-container").getBoundingClientRect();
            // Set the position of the input to the position of the item being changed
            this.changingData.input.style.display = "";
        } else {
            // Move the input from the canvas
            this.changingData.input.style.display = "none";
        }

        //Save the mouse position into a variable
        var mP = { x: mousePos().x, y: mousePos().y };
        //Try snaping to grid
        if (this.snapToG) {
            const _allL = this.lines.concat(this.additionalLines);
            if (this.closed) _allL.push(this.closingLine);

            mP = this.grid.getClosestSnap(mP.x, mP.y, this.points, _allL);
        }

        // If drawing
        if (!this.finished) {
            // Set up color etc
            strokeWeight(2 * zoomVal);
            stroke("gray");
            fill("gray");

            // Draw the mouse cursor
            ellipse(mP.x, mP.y, 7, 7);

            // If there are at least some points
            if (this.points.length > 0) {
                // Draw the line from the last point to the cursor
                var lastP = this.points[this.points.length - 1];

                var l = new Line(trashPM, new Point(trashPM, lastP.x, lastP.y), new Point(trashPM, mP.x, mP.y));
                if (this.lines[this.lines.length - 1]) {
                    var a = abs((PI - l.angle + this.lines[this.lines.length - 1].angle) + PI)

                    a = (PI - (a + 2 * PI) % (2 * PI))

                    if (a > PI) {
                        a = 2 * PI - a
                    }

                    var ang;
                    if (a > 0) {
                        a = abs(a)

                        ang = new Angle(trashPM, lastP.x, lastP.y, this.lines[this.lines.length - 1].angle - PI, l.angle, -1)
                    } else {
                        ang = new Angle(trashPM, lastP.x, lastP.y, l.angle, this.lines[this.lines.length - 1].angle - PI, -1)
                    }

                    ang.draw(true, false)
                    ang.descriptors[0].text = (round(abs(a) * 180 / PI, 2)).toString() + "°";
                    ang.drawDescriptors()
                }

                l.draw(true, false);
                l.drawDescriptors();
            }
        }
    }

    /**
     * The recursive function for drawing the whole barebones structure.
     * @param {Array} arrP A copy of the points array
     * @param {Array} arrL A copy of the lines array
     * @param {Boolean} isFirst A Boolean which tells us, if this is depth 0 of the recursion (true by default)
     */
    drawRecursive(arrP, arrL, isFirst = true) {
        // If the point is first
        if (isFirst) {
            push();
            //Translate
            translate(this.points[0].x, this.points[0].y)
        }

        // Draw the first point at false position
        arrP[0].draw(false);

        // If there are no more lines
        // Or if there is just 1 line left and the manager is closed and not finished
        if (arrL.length == 0) {
            pop();
            // End recursion
            if (this.closed) { // Draw the closing line if the pointManager is closed
                this.closingLine.draw(true);
            }
            return (null);
        }

        // Rotate to the rotation of the line
        rotate(arrL[0].angle - PI / 2)

        // Draw the first line at false position
        arrL[0].draw(false);

        // Translate along the length of the line
        translate(0, arrL[0].length);
        // Revert the rotation
        rotate(-arrL[0].angle + PI / 2)

        // Remove the first element of points and lines
        // This makes the first point and line in the next recursion pass the next point and line
        arrP.shift();
        arrL.shift();

        // Call the recursion again
        this.drawRecursive(arrP, arrL, false);
    }

    //INPUTS

    /**
     * This function takes care of all keyboard interactions. Should be called in the p5 keyPressed() function. 
     */
    keyPressed() {
        // Enter and not changing -> switch edit mode
        if (!this.changingData.changing && keyCode == 13) {
            this.finished = !this.finished;
            if (this.closed && !this.finished) {
                this.close()
            }
        }
    }

    setChanges() {
        // Stop changing
        this.changingData.changing = false;

        // Extract, parse and reset the value of the input
        var num = parseFloat(this.changingData.input.children[1].value);
        this.changingData.input.children[1].value = "";

        // Change the appropriate item from the right array to the value
        if (this.changingData.object.type == new Point(trashPM).type) {
            // Change the angle, if the item was an Angle
            this.changeRelativeAngleOnScale(constrain(num, 0, 180) * PI / 180,
                this.changingData.itemID);
        } else if (this.changingData.object.type == new Line(trashPM).type) {
            if (this.convertToUnit) num = this.grid.toPixels(num);

            if (this.changeLineLengthConservative) {
                this.changeLengthConservative(num / 1000, this.changingData.object, this.changingData.object.points[0])
            } else {
                // Change the length, if the item was a Line
                this.changeLength(num / 1000, this.changingData.object)
            }
        }

        var d = document.getElementById("ProfileChangeDiv");
        d.innerHTML = ""
    }

    cancelChanges() {
        // Escape and changing -> stop changing
        this.changingData.changing = false;

        var d = document.getElementById("ProfileChangeDiv");
        d.innerHTML = ""
    }

    /**
     * This function takes care of all mouse presses. Should be called in the p5 mousePressed() function. 
     */
    mousePressed(event) {
        this.startMousePos = mousePos();
        this.startObj = this.hoveringObject;

        // Not finished
        if (!this.finished) {
            //Save the mouse position into a variable
            var mP = { x: mousePos().x, y: mousePos().y };
            //Try snaping to grid
            if (this.snapToG) {
                const _allL = this.lines.concat(this.additionalLines);
                if (this.closed) _allL.push(this.closingLine);

                mP = this.grid.getClosestSnap(mP.x, mP.y, this.points, _allL);
            }

            if (event.which == 1 && isInFrame(mP.x, mP.y)) {
                // Not finished -> Left click
                // Add point
                this.addPoint(mP.x, mP.y);
            } else if (event.which == 3) {
                // Not finished -> Right click
                // Finished
                this.finished = true;
            }
        } else if (this.finished && !showModel) { // Finished and model is not showing
            // Hovering object cannot be null
            if (this.hoveringObject != null) {
                if (event.which == 1) { //LEFT CLICK
                    // Start the click
                    this.changingData.clickFrame = frameCount;
                    // Set the object as hoveringObject
                    this.changingData.object = this.hoveringObject;

                    // Get all the necessary data from the hoveringObject
                    this.changingData.itemID = this.hoveringObject.id;
                    this.changingData.itemPos = {
                        x: this.hoveringObject.x,
                        y: this.hoveringObject.y
                    };

                    // Lock the object for dragging
                    this.hoveringObject.lock(true);
                } else if (event.which == 3) { // RIGHT CLICK
                    if (this.hoveringObject.type == new Point(trashPM).type) { // The hovering object is a point
                        this.removePoint(this.hoveringObject)
                    } else if (this.hoveringObject.type == new Line(trashPM).type) { // The hovering object is a line
                        this.removeLine(this.hoveringObject)
                    }
                }
            }
        }
    }


    /**
     * This function takes care of starting the changing input and of unlocking all elements. Should be called in the p5 mouseReleased() function. 
     */
    mouseReleased() {
        if (this.dragging && isInFrame(mousePos().x, mousePos().y) && mousePos().x != this.startMousePos.x && mousePos().y != this.startMousePos.y && this.startObj != null) {
            this.dragging = false;
            this.updateCall();
        }

        // Change data, if the mouse was released before the maximum press time
        this.changingData.changing = (frameCount - this.changingData.clickFrame <= this.changingData.maxFrameDuration)
        if (this.changingData.changing) {
            var d = document.getElementById("ProfileChangeDiv");
            d.innerHTML = ""

            document.getElementById("LineChangeDiv").appendChild(this.changingData.input);
            this.changingData.input.style.display = "";
            this.changingData.input.children[0].children[0].innerText = this.changingData.object.type == "Point" ? "Winkel (°)" : "Länge (mm)";
            this.changingData.input.children[1].step = this.changingData.object.type == "Point" ? "1" : "250";

            d.innerHTML += "<button class='btn btn-success' style ='margin-right: 10px;' onclick = 'securityPlan.mainGeometry.setChanges()'> Einstellen </button>";
            d.innerHTML += "<button class='btn btn-danger' style ='margin-right: 10px;' onclick = 'securityPlan.mainGeometry.cancelChanges()'> Abbrechen </button>";

            if (this.changingData.object.type == "Point") {
                //print(round(this.changingData.object.angle.relative * 180 / PI, 3))
                this.changingData.input.children[1].value = round(this.changingData.object.angle.relative * 180 / PI, 3);
            } else {
                //print(round(this.grid.toUnit(this.changingData.object.length) * 1000, 2))
                this.changingData.input.children[1].value = round(this.grid.toUnit(this.changingData.object.length) * 1000, 2);
            }
        }

        // unlock all points and their angles
        for (var p of this.points) {
            p.lock(false);
        }
        for (var p of this.additionalPoints) {
            p.lock(false);
        }
        // unlock all points
        for (var l of this.lines) {
            l.lock(false);
        }
        for (var l of this.additionalLines) {
            l.lock(false);
        }
    }

    /**
     * This function takes care of dragging actions. Should be called in the p5 mouseDragged() function. 
     */
    mouseDragged() {
        this.dragging = true;

        // Stop changing
        this.changingData.changing = false;

        // Find all the locked points
        var lockedPoints = [];
        for (var p of this.points) {
            if (p.locked) {
                // Save the point to locekdPoints
                lockedPoints.push(p);
            }
        }
        for (var p of this.additionalPoints) {
            if (p.locked) {
                // Save the point to locekdPoints
                lockedPoints.push(p);
            }
        }

        //Save the mouse position into a variable
        var mP = { x: mousePos().x, y: mousePos().y };
        //Try snaping to grid
        if (this.snapToG) {
            mP = this.grid.getClosestSnap(mP.x, mP.y, this.points);
        }

        // Only a single point is locked 
        if (lockedPoints.length == 1) {
            //Move the point
            lockedPoints[0].x = mP.x - lockedPoints[0].xoffset;
            lockedPoints[0].y = mP.y - lockedPoints[0].yoffset;
        } else if (lockedPoints.length == 2) { // Two points are locked -> a line is locked
            // Find the line which is dragged
            var l = this.lines[this.points.indexOf(lockedPoints[0])];

            if ((this.points.indexOf(lockedPoints[0]) == -1 || this.points.indexOf(lockedPoints[1]) == -1) || lockedPoints[1].id - lockedPoints[0].id != 1) {
                for (var lin of this.additionalLines) {
                    if ((lin.points[0] == lockedPoints[0] && lin.points[1] == lockedPoints[1])) {
                        l = lin;
                        break;
                    }

                    if ((lin.points[0] == lockedPoints[1] && lin.points[1] == lockedPoints[0])) {
                        l = lin;
                        l.dx = -l.dx;
                        l.dy = -l.dy;
                        break;
                    }
                }
            }

            // Check if the line is the closingLine
            if (this.points.indexOf(lockedPoints[0]) == 0 && this.points.indexOf(lockedPoints[1]) == this.points.length - 1 && this.closed) {
                l = this.closingLine;
                // We have to switch the dx and dy components because the points are switched
                l.dx = -l.dx;
                l.dy = -l.dy;
            }

            //We have to retry snaping to grid because of the point offset from the line center
            if (this.snapToG) {
                mP = this.grid.getClosestSnap(mP.x - l.dx / 2, mP.y - l.dy / 2);
            }

            //Move the first point
            lockedPoints[0].x = mP.x - lockedPoints[0].xoffset;
            lockedPoints[0].y = mP.y - lockedPoints[0].yoffset;

            //Move the second point
            lockedPoints[1].x = lockedPoints[0].x + l.dx;
            lockedPoints[1].y = lockedPoints[0].y + l.dy;
        }


        // update
        this.update();
    }

    //CALCULATIONS

    /**
     * Calculates the relative angles between all the lines
     */
    calculateRelativeAngles() {
        // Reset relativeAngles and angles
        this.relativeAngles = [];
        this.angles = [];

        // There have to be at least some lines
        if (this.lines.length != 0) {
            // The relative angle of the first line is the same as te absolute value of its absolute angle
            this.relativeAngles.push(Math.abs(this.lines[0].angle));

            // Go through all the other lines 
            for (var i = 1; i < this.lines.length; i++) {
                // The raw relative angle
                var ang = (PI - this.lines[i - 1].angle + this.lines[i].angle);

                // Clean up the angle and map it, so that it fits between 0 - 2*PI
                ang = 2 * PI - (ang + 2 * PI) % (2 * PI)

                // Add the relative angle
                this.relativeAngles.push(ang);

                // Clean up all angles, so that they are not over 2*PI
                this.lines[i].angle %= 2 * PI;
                this.relativeAngles[i] %= 2 * PI;
            }

            // Add the reference to the Angle object to the points
            for (var i = 1; i < this.points.length - 1; i++) {
                // Switch start and point, so that the arc of the Angle is at the right side
                if (this.relativeAngles[i] > PI) {
                    // Left side
                    this.points[i].setAngle(new Angle(this, this.points[i].x, this.points[i].y,
                        this.lines[i].angle + this.relativeAngles[i], this.lines[i].angle,
                        i - 1));
                } else {
                    // Right side
                    this.points[i].setAngle(new Angle(this, this.points[i].x, this.points[i].y,
                        this.lines[i].angle, this.lines[i].angle + this.relativeAngles[i],
                        i - 1));
                }
            }
        }
    }

    /**
     * Recalculates the positions of all the points and sets their positions according to these calculations.
     */
    recalculatePointPositions() {
        // Set the staring position to the position of the first point
        var totalX = this.points[0].x;
        var totalY = this.points[0].y;

        // Go through all the lines
        for (var i = 0; i < this.lines.length; i++) {
            // Translate sing the lines angle and the lines length
            totalX += Math.cos(this.lines[i].angle) * this.lines[i].length;
            totalY += Math.sin(this.lines[i].angle) * this.lines[i].length;

            // Set the position of the points at i+1 to be at the momentary origin
            this.points[i + 1].x = totalX;
            this.points[i + 1].y = totalY;
        }
    }

    // ANGLE MANIPULATION

    /**
     * Changes the absolute angle between the X axis and the line.
     * @param {Number} newA The new absolute angle (in rad)
     * @param {Number} id The index of the line
     * @param {Boolean} shouldUpdate Tells the function to update the whole PointManager. This is used for performance reasons. (true by default)
     */
    changeAbsoluteAngle(newA, id, shouldUpdate = true) {
        // Change the angle of the line
        this.lines[id].angle = newA;

        // Recalculate relative angles, point positions and update the whole thing
        this.calculateRelativeAngles();
        this.recalculatePointPositions();
        if (shouldUpdate) this.update();
    }

    /**
     * Changes the relative angle between two lines on the 0-2PI scale.
     * @param {Number} newA The new relative angle (in rad)
     * @param {Number} id The index of the line
     */
    changeRelativeAngle(newA, id) {
        // Make sure that the index relates to a changeable angle
        if (this.checkAngleChangeIndex(id)) {
            // Get the old angle
            var oldA = this.relativeAngles[id];

            //Change the absolute angle in such a way, so that the relative angle is now newA
            // update is turned off
            this.changeAbsoluteAngle(2 * PI - (newA - oldA - this.lines[id].angle), id, false);

            // The difference between the values of the old and the new relative angle
            var dA = oldA - this.relativeAngles[id];

            // loop through all the lines after this line
            for (var i = id + 1; i < this.lines.length; i++) {
                // Add the angle difference dA to their absolute angles
                // This rotates the whole part of the drawing after the relatively changed line
                // Update is turned off
                this.changeAbsoluteAngle(this.lines[i].angle + dA, i, false);
            }

            // Update the whole thing only once -> performace boost
            this.update()
        }
    }

    /**
     * Changes the relative angle between two lines on the 0-PI scale. This is more user friendly.
     * @param {Number} newA The new relative angle on the 0-PI scale (in rad)
     * @param {Number} id The index of the line
     */
    changeRelativeAngleOnScale(newA, id) {
        // Make sure that the index relates to a changeable angle
        if (this.checkAngleChangeIndex(id)) {
            //If the relative angle is larger than PI, the new angle has to be interpreted as 2*PI-newA
            if (this.relativeAngles[id] > PI) {
                // Change the angle with interpretation
                this.changeRelativeAngle(2 * PI - newA, id)
            } else {
                // No interpretation needed
                this.changeRelativeAngle(newA, id)
            }
        }
    }

    /**
     * Returns, if the angle at this index can be changed. First and last angles cannot be changed.
     * @param {Number} id The index to be checked 
     */
    checkAngleChangeIndex(id) {
        // Cahcks if the angle isn't 0 and at the same time is smaller than the amount of lines
        return (id != 0 && id < this.lines.length)
    }

    // POINT MANIPULATION
    /**
     * Adds a point at the specified coordinates.
     * @param {Number} x The x coordinate 
     * @param {Number} y The y coordinate
     */
    addPoint(x, y, disableUpdate = false, stopClosing = false) {
        if (!stopClosing) {
            // If the position is of the new point is very close to the first point
            if (this.points.length > 0) {
                if (dist(this.points[0].x, this.points[0].y, x, y) < 3) {
                    //Don't add a point, instead close the pointManager
                    this.closed = true;
                    this.finished = true;
                    if (!disableUpdate) this.update();
                    return;
                }
            }
        }

        this.closed = false;

        var newP = new Point(this, x, y, this.points.length);
        // Add a point with the x and y coordinates. Set it's id.
        this.points.push(newP);

        // Update
        if (!disableUpdate) this.update();

        return newP;
    }

    /**
     * Removes the point at the specified index
     * @param {Point} obj Reference to the point that is to be deleted
     */
    removePoint(obj) {
        var id = this.points.indexOf(obj)

        if (id != -1) {
            for (var al = 0; al < this.additionalLines.length; al++) {
                if (this.additionalLines[al].points.includes(obj)) {
                    var ind = this.additionalLines[al].points.indexOf(obj)
                    ind = ind == 0 ? 1 : 0;

                    if (this.additionalLines[al].points[ind].angle != null) {
                        if (this.additionalLines[al].points[ind].angle.relative == PI) {
                            this.points.splice(this.points.indexOf(this.additionalLines[al].points[ind]), 1);
                        }
                    }

                    this.additionalLines.splice(al, 1);
                    al--;
                }
            }

            // By default it remove the last point
            // Remove the point at index id
            this.points.splice(id, 1);

            // Make sure that the old angles of the new first and last points are removed
            // We have to have at least one point to remove
            if (this.points.length != 0) {
                this.points[0].angle = null;
                this.points[this.points.length - 1].angle = null;
            }
        } else {
            id = this.additionalPoints.indexOf(obj)

            if (id != -1) {
                for (var al = 0; al < this.additionalLines.length; al++) {
                    if (this.additionalLines[al].points.includes(obj)) {
                        var ind = this.additionalLines[al].points.indexOf(obj)
                        ind = ind == 0 ? 1 : 0;

                        if (this.additionalLines[al].points[ind].angle != null) {
                            if (this.additionalLines[al].points[ind].angle.relative == PI) {
                                this.points.splice(this.points.indexOf(this.additionalLines[al].points[ind]), 1);
                            }
                        }

                        this.additionalLines.splice(al, 1);
                        al--;
                    }
                }
                this.additionalPoints.splice(id, 1)
            }
        }
        this.update();
    }

    // LENGTH MANIPULATION

    /**
     * Changes the length of a line at an index.
     * @param {Number} newL The new length (in pixels).
     * @param {Line} obj The line, of which the length is to be changed
     */
    changeLength(newL, obj) {
        // Forcefuly set thee length of a line
        obj.length = newL;
        // Recalculate with these changes and update
        this.recalculatePointPositions();
        this.update();
    }

    changeScale(k) {
        for (var l = 0; l < this.lines.length; l++) {
            this.changeLength(this.lines[l].length * k, this.lines[l])
        }
    }

    /**
     * Changes the length of a line but still keeps the total length of the side.
     * @param {Number} newL The new length (in pixels).
     * @param {Line} obj The line, of which the length is to be changed
     * @param {Point} statP The point that is stationary
     */
    changeLengthConservative(newL, obj, statP) {
        for (var l of this.lines.concat(this.additionalLines)) {
            if (obj.points[0].x == l.points[0].x &&
                obj.points[0].y == l.points[0].y &&
                obj.points[1].x == l.points[1].x &&
                obj.points[1].y == l.points[1].y) {
                obj = l;
                break;
            }
        }

        // Force the point a given distance away
        if (round(statP.x, 5) == round(obj.points[0].x, 5) && round(statP.y, 5) == round(obj.points[0].y, 5)) {
            obj.points[1].x = obj.points[0].x + cos(obj.angle) * newL;
            obj.points[1].y = obj.points[0].y + sin(obj.angle) * newL;
        } else if (round(statP.x, 5) == round(obj.points[1].x, 5) && round(statP.y, 5) == round(obj.points[1].y, 5)) {
            obj.points[0].x = obj.points[1].x - cos(obj.angle) * newL;
            obj.points[0].y = obj.points[1].y - sin(obj.angle) * newL;
        }

        // Recalculate with these changes and update
        this.update();
    }

    // LINE MANIPULATION

    /**
     * Function which attaches a line at the end.
     * @param {Number} angle The relative angle between he new line and the last line (in rad)
     * @param {Number} length The length of the new line
     * @param {Boolean} right Boolean which tells, if the relative line angle is from the right-hand side of the left-hand side
     */
    addLine(angle, length, right) {
        // If the angle is from the left, interpret the angle as 2*PI-angle
        if (!right) angle = 2 * PI - angle;

        // set the lastPoint variable as the last point of this.points
        var lastPoint = this.points[this.points.length - 1];

        // If lastPoint is undefined, then there are no points
        if (lastPoint == undefined) {
            // Add a point at 0,0
            if (this.points.length == 0) {
                this.addPoint(0, 0);
            }

            // Redefine lastPoint
            lastPoint = this.points[0];

            //Add a point that is length away from lastPoint (angle is now accounted for, but as absolute)
            this.addPoint(lastPoint.x + Math.cos(angle) * length, lastPoint.y + Math.sin(angle) * length);
        } else if (this.points.length == 1) {
            //Add a point that is length away from lastPoint (angle doesn't matter for now)
            this.addPoint(lastPoint.x + length, lastPoint.y);
            // Change the relative angle
            this.changeAbsoluteAngle(angle, this.points.length - 2);
        } else {
            //Add a point that is length away from lastPoint (angle doesn't matter for now)
            this.addPoint(lastPoint.x + length, lastPoint.y);
            // Change the relative angle
            this.changeRelativeAngle(angle, this.points.length - 2);
        }
    }

    /**
     * Function which removas a line at a specified index. The lengths of the other lines shuffle down, bu the relative angles are kept.
     * @param {Line} obj Reference to the object that is to be deleted.
     */
    removeLine(obj) {
        var id = this.lines.indexOf(obj);

        //Trying to remove the closing line or additional line
        if (id == -1) {
            id = this.additionalLines.indexOf(obj);
            if (id != -1) { // It is an additional line
                var pnts = obj.points;

                for (var p of pnts) {
                    var shouldRemove = false;
                    if (this.additionalPoints.includes(p)) {
                        shouldRemove = true;
                        for (var l of this.additionalLines) {
                            if (l.points.includes(p) && l != this.additionalLines[id]) {
                                shouldRemove = false;
                            }
                        }
                    } else if (p != this.points[0]) {
                        if (p.angle.relative == PI) {
                            shouldRemove = true;
                        }
                    }

                    if (shouldRemove) {
                        this.removePoint(p);
                    }
                }

                this.additionalLines.splice(id, 1);
            } else {
                this.close();
            }
        }
        // We have to have at least one line to remove
        else if (this.lines.length != 0) {
            // Change the lengths, so that they discriminate the length at the chosen id
            for (var i = id; i < this.lines.length - 1; i++) {
                this.lines[i].length = this.lines[i + 1].length;
            }
            // Remove last line and last point
            this.lines.pop();
            this.points.pop();

            // Make sure that the last point doesn't have it's angle
            this.points[this.points.length - 1].angle = null;

            // Recalulate positions and update
            this.recalculatePointPositions();
            this.update();
        }
    }

    addAdditionalLine(p1, p2, disableUpdate = false) {
        var point1;
        var point2;

        if (p1.x == this.points[this.points.length - 1].x && p1.y == this.points[this.points.length - 1].y) {
            this.addPoint(p2.x, p2.y, disableUpdate);
            this.update();
            return;
        } else if (p2.x == this.points[this.points.length - 1].x && p2.y == this.points[this.points.length - 1].y) {
            this.addPoint(p1.x, p1.y, disableUpdate);
            this.update();
            return;
        }

        if (p1.x == this.points[0].x && p1.y == this.points[0].y) {
            this.points.unshift(new Point(this, p2.x, p2.y));
            this.update();
            return;
        } else if (p2.x == this.points[0].x && p2.y == this.points[0].y) {
            this.points.unshift(new Point(this, p1.x, p1.y));
            this.update();
            return;
        }

        var allPoints = this.points.concat(this.additionalPoints);
        for (var p of allPoints) {
            if (round(p.x, 5) == round(p1.x, 5) && round(p.y, 5) == round(p1.y, 5)) {
                p.connectedToAddLine = true;
                point1 = p;
            } else if (round(p.x, 5) == round(p2.x, 5) && round(p.y, 5) == round(p2.y, 5)) {
                p.connectedToAddLine = true;
                point2 = p;
            }
        }

        var onLine = function(l1, l2, p) {
            var d12 = dist(l1.x, l1.y, l2.x, l2.y);
            var d13 = dist(p.x, p.y, l2.x, l2.y);
            var d23 = dist(l1.x, l1.y, p.x, p.y);
            return (d12 + 0.00001 > d23 + d13)
        }

        var extra = 0;
        for (var l of this.lines) {
            //Check if one of the points lays on any of the lines
            if (point1 == undefined) {
                if (onLine(l.points[0], l.points[1], p1)) {
                    point1 = new Point(this, p1.x, p1.y);
                    point1.connectedToAddLine = true;
                    this.points.splice(l.id + 1 + extra, 0, point1);

                    extra = 1;
                }
            }

            if (point2 == undefined) {
                if (onLine(l.points[0], l.points[1], p2)) {
                    point2 = new Point(this, p2.x, p2.y);
                    point2.connectedToAddLine = true;
                    this.points.splice(l.id + 1 + extra, 0, point2);

                    extra = 1;
                }
            }
        }

        for (var l of this.additionalLines) {
            //Check if one of the points lays on any of the additional lines
            if (point1 == undefined) {
                if (onLine(l.points[0], l.points[1], p1)) {
                    point1 = p1;
                    point1.connectedToAddLine = true;

                    this.additionalPoints.push(point1)

                    var l1 = new Line(this, l.points[0], point1)
                    l1.c = "purple";
                    this.additionalLines.push(l1)

                    var l2 = new Line(this, l.points[1], point1)
                    l2.c = "purple";
                    this.additionalLines.push(l2)

                    this.additionalLines.splice(this.additionalLines.indexOf(l), 1);
                }
            }

            if (point2 == undefined) {
                if (onLine(l.points[0], l.points[1], p2)) {
                    point2 = p2;
                    point2.connectedToAddLine = true;

                    this.additionalPoints.push(point2)

                    var l1 = new Line(this, l.points[0], point2)
                    l1.c = "purple";
                    this.additionalLines.push(l1)

                    var l2 = new Line(this, l.points[1], point2)
                    l2.c = "purple";
                    this.additionalLines.push(l2)

                    this.additionalLines.splice(this.additionalLines.indexOf(l), 1);
                }
            }
        }

        //Check if one of the points lays on the closing line
        if (this.closed) {
            if (point1 == undefined) {
                if (onLine(this.closingLine.points[0], this.closingLine.points[1], p1)) {
                    point1 = this.addPoint(p1.x, p1.y, disableUpdate);
                    this.points[this.points.length - 1].connectedToAddLine = true;

                    this.closed = true;
                }
            }

            if (point2 == undefined) {
                if (onLine(this.closingLine.points[0], this.closingLine.points[1], p2)) {
                    point2 = this.addPoint(p2.x, p2.y, disableUpdate);
                    this.points[this.points.length - 1].connectedToAddLine = true;

                    this.closed = true;
                }
            }
        }

        if (point1 == undefined) {
            point1 = new Point(this, p1.x, p1.y);
            point1.connectedToAddLine = true;
            this.additionalPoints.push(point1);
        }
        if (point2 == undefined) {
            point2 = new Point(this, p2.x, p2.y);
            point2.connectedToAddLine = true;
            this.additionalPoints.push(point2);
        }

        if (point1 != undefined && point2 != undefined) {
            var ad = new Line(this, point1, point2);
            ad.c = "purple";
            this.additionalLines.push(ad)
        }

        this.update();
    }

    //OTHER

    /**
     * This function resets the whole PointManager by clearing it of all the points.
     */
    reset() {
        this.points = [];
        this.additionalPoints = [];
        this.lines = [];
        this.additionalLines = [];
        this.closed = false;
        this.update();
    }

    /**
     * This function switches between the pointManager being closed or not.
     */
    close() {
        this.closed = !this.closed;
        this.update();
    }

    /**
     * This function switches between the pointManager snapping to grid of not.
     */
    snapToGrid() {
        this.snapToG = !this.snapToG;
    }

    getAllLines() {
        if (this.closed) {
            return this.lines.concat([this.closingLine])
        }

        return this.lines
    }

    // GET PATH

    /**
     * This function returns an array of simple objects with x,y,z coordinates. This is used for 3D rendering later.
     * */
    getPath() {
        var ret = [];
        // Add in all the point positions
        for (var p of this.points) {
            ret.push({
                x: p.x,
                y: p.y,
                z: 0
            })
        }

        // Also include the closing line
        if (this.closed) {
            ret.push({
                x: this.points[0].x,
                y: this.points[0].y,
                z: 0
            })
        }

        return (ret);
    }
}