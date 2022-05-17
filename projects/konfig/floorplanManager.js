const globalAppType = "kantmanufaktur";

class FloorplanManager {

    // CREATION

    /**
     * The PointManager constructor.
     */
    constructor(outerHeight = 0.2, width = 0.25, innerHeight = 0.1, outerWidth = 0.05, innerWidth = 0.025) {
        this.mainGeometry = new PointManager([]);
        this.mainGeometry.parent = this;
        this.mainGeometry.updateCall = function() {
            if (!this.lastSent) this.lastSent = 0;
            if (performance.now() - this.lastSent > 1000 / maxFPS) {
                if (!this.dragging) {
                    this.parent.addToStack();
                }

                if (this.parent.sendData) {

                    c.updateProject(projectDetails.id, this.parent.export(), !this.dragging);
                    this.lastSent = performance.now();
                }
            } else return;
        }

        this.outerHeight = outerHeight;
        this.innerHeight = innerHeight;
        this.wallWidth = width;
        this.innerWidth = innerWidth;
        this.outerWidth = outerWidth;

        //this.innerGeometry = null;
        this.autoProfileGeometry = null;
        this.autoProfiles = [];
        this.autoProfilesCompact = [];
        this.autoProfilesList = [];
        this.autoProfilesListCompact = [];

        this.mainGeometry.snapToGrid();
        this.mainGeometry.convertToUnit = true;
        this.mainGeometry.remove180DegCorners = false;

        this.additionalVertex1 = null;
        this.additionalVertex2 = null;

        this.tool = 0;
        this.applyForceLength = true;
        this.forceLength = 3;

        this.hoverProfile = null;
        this.changing = false;
        this.changingProfile = null;

        this.dragging = false;

        this.receiveData = false;
        this.sendData = false;

        this.mainGeometry.doUpdateCall = true;

        this.stack = [];
        this.maxStackSize = 10;
        this.stackIndex = 0;

        this.defaultUpLength = 0.25;
        this.defaultCol = "rgb(128,128,128)";
        this.profile_type = 0;
        this.steepness = 3;
        this.thickness = 2;
        this.halter = 1000;

        this.pdf = [];
    }

    async draw() {
        if (this.autoProfileGeometry != null) {
            this.autoProfileGeometry.allowHover = false;
        }

        if (this.tool == 0) {
            this.mainGeometry.draw();
        } else if (this.tool == 1) {
            this.mainGeometry.draw();

            //Save the mouse position into a variable
            var mP = { x: mousePos().x, y: mousePos().y };
            //Try snaping to grid
            if (this.mainGeometry.snapToG) {
                const _allL = this.mainGeometry.lines.concat(this.mainGeometry.additionalLines);
                if (this.mainGeometry.closed) _allL.push(this.mainGeometry.closingLine);

                mP = this.mainGeometry.grid.getClosestSnap(mP.x, mP.y, this.mainGeometry.points, _allL);
            }

            // Set up color etc
            strokeWeight(2 * zoomVal);
            stroke("purple");
            fill("purple");

            // Draw the mouse cursor
            ellipse(mP.x, mP.y, 7, 7);


            // If there are at least some points
            if (this.additionalVertex1 != null) {
                line(this.additionalVertex1.x, this.additionalVertex1.y, mP.x, mP.y);
            }
        } else if (this.tool == 2) {
            //noLoop();

            if (this.autoProfileGeometry == null || this.autoProfiles.length == 0) {
                this.createProfileGeometry();
                this.autoProfileGeometry.allowHover = true;
                this.autoProfileGeometry.changeLineLengthConservative = true;
            }

            this.hoverProfile = null;

            this.mainGeometry.grid.draw();

            for (var l of this.mainGeometry.lines.concat(this.mainGeometry.closingLine).concat(this.mainGeometry.additionalLines)) {
                if (l != null) {
                    for (var d of l.descriptors) {
                        d.draw();
                    }
                }
            }

            for (var p of this.autoProfiles) {
                if (p.draw()) {
                    this.hoverProfile = p;
                }
            }

            //this.autoProfileGeometry.draw(false);

            //this.innerGeometry.draw(false);
        } else if (this.tool == 3) {
            if (this.autoProfileGeometry == null || this.autoProfiles.length == 0) {
                this.createProfileGeometry();
                this.autoProfileGeometry.allowHover = true;
                this.autoProfileGeometry.changeLineLengthConservative = true;
            }
            this.hoverProfile = null;

            rotateX(PI / 2);
            translate(0, -height / 2, -height / 2);
            for (var p of this.autoProfiles) {
                p.draw3D();
            }

            drawAxis(1000);
            orbitControl(1, 1);
            rotateX(-PI / 2);
        } else if (this.tool == -1) {
            if (this.autoProfileGeometry == null || this.autoProfiles.length == 0) {
                this.createProfileGeometry();
                this.autoProfileGeometry.allowHover = true;
                this.autoProfileGeometry.changeLineLengthConservative = true;
            }

            // Profile list
            var pdf_data = this.getProfiles(true);
            for (var i = 0; i < pdf_data.length; i++) {
                var end_c = 0;
                var str_c = 0;
                var ang_c = 0;
                var Tpr_c = 0;
                var oth_c = 0;

                for (var r = 0; r < pdf_data[i].length; r++) {
                    var pr = pdf_data[i][r].profile;

                    var type_id;
                    var type_c;
                    var type_profileType;
                    var type_angle = 0;
                    var type_length;

                    switch (pr.type) {
                        case "End":
                            end_c++;

                            type_id = 3;
                            type_c = end_c;
                            if (pr.up) {
                                type_profileType = "ak"
                            } else {
                                type_profileType = "ek"
                            }
                            type_angle = 0;
                            type_length = pr.length * 1000 + ` (Höhe: ${pr.upLength*1000})`;
                            break;
                        case "Straight":
                            str_c++;

                            type_id = 1;
                            type_c = str_c;
                            type_profileType = "l";
                            type_angle = 0;
                            type_length = pr.length * 1000;
                            break;
                        case "Angled":
                            ang_c++;

                            type_id = 2;
                            type_c = ang_c;
                            if (pr.angle > Math.PI) {
                                type_profileType = "ie";
                            } else {
                                type_profileType = "ae";
                            }
                            type_angle = Math.round(pr.angle * 180 / Math.PI * 1e2) / 1e2 + "°";
                            type_length = pr.leftLength * 1000 + "/" + pr.rightLength * 1000;
                            break;
                        case "T-shape":
                            Tpr_c++;

                            type_id = 4;
                            type_c = Tpr_c;
                            type_profileType = "gete";
                            type_angle = `${Math.round(pr.xyAngle * 180 / Math.PI * 1e2) / 1e2}°/${Math.round(pr.yzAngle * 180 / Math.PI * 1e2) / 1e2}°`
                            type_length = pr.xLength * 1000 + "/" + pr.yLength * 1000 + "/" + pr.zLength * 1000;
                            break;
                        default:
                            oth_c++;

                            type_id = 5;
                            type_c = oth_c;
                            type_profileType = "";
                            type_angle = 0;
                            type_length = pr.lengths.map(x => Math.round(x * 1000 * 1e2) / 1e2).reduce((a, b) => a + "/" + b);
                            break;
                    }

                    var lastID = null;
                    var lastProf = null;
                    var sameConnectedProfiles = []
                    var touchWithLast = false;
                    var d, k;
                    for (var prof of pdf_data[i][r].all_profiles) {
                        var isFirst = true;
                        if (lastProf != null) {
                            touchWithLast = this.areProfilesTouching(prof, lastProf)
                        } else touchWithLast = true
                        for (var l of prof.parts) {
                            d = l.descriptors[0]
                            var origD = d.offset;
                            var origTS = d.textSize;
                            var origText = d.text;

                            var bounds = this.getBounds();
                            var c = 15 / 800
                            k = pow(max(bounds.w, bounds.h), 0.975) * c

                            var textSize = max(k, 7.5)
                            d.offset = {
                                x: 0,
                                y: -(l.isOuter ? l.out : l.inn + l.wallW / 2) - textSize * 1.2 - 1
                            }
                            d.textSize = textSize

                            var leng
                            if (prof.type == "Straight" || prof.type == "End" || prof.type == "Other") {
                                leng = parseFloat(d.text)

                                // DRAW THE ID OF THE PROFILE
                                if ((k < 30 || lastID != `${i+1}.${type_id}.${type_c}` || !touchWithLast)) {
                                    if (sameConnectedProfiles.length > 0) {
                                        var mid = sameConnectedProfiles[floor(sameConnectedProfiles.length / 2)]
                                            //console.log(sameConnectedProfiles)
                                        var d1 = mid.descriptors[0]

                                        d1.offset = d.offset
                                        d1.textSize = d.textSize

                                        d1.text = lastID
                                        d1.draw();

                                        //console.log("drawn", lastID)
                                        sameConnectedProfiles = []
                                    } else {
                                        //console.log("draw", `${i+1}.${type_id}.${type_c}`)
                                        d.text = /*round(leng * 1000, 3) +*/ ((isFirst == (prof.type != "T-shape")) ? `\n${i+1}.${type_id}.${type_c}` : "")

                                        d.draw();
                                    }
                                } else {
                                    sameConnectedProfiles.push(l);
                                }
                                lastID = `${i+1}.${type_id}.${type_c}`
                            } else if (prof.type == "Angled") {
                                if (isFirst) leng = prof.realLeftLength
                                else leng = prof.realRightLength

                                if (isFirst) {
                                    var a = prof.parts[0].angle
                                    var id_d = new ElementDescriptor(l.points[1].x, l.points[1].y, 0, `\n${i+1}.${type_id}.${type_c}`, {
                                        x: -cos(a) * 1.5 * d.offset.y,
                                        y: -sin(a) * 1.5 * d.offset.y
                                    })
                                    id_d.textSize = textSize
                                    id_d.draw();
                                }
                            } else if (prof.type = "T-shape") {
                                var ind = prof.parts.indexOf(l)
                                switch (ind) {
                                    case 0:
                                        leng = prof.realXLength;
                                        break;
                                    case 1:
                                        leng = prof.realYLength;
                                        break;
                                    case 2:
                                        leng = prof.realZLength;
                                        break;
                                }

                                if (isFirst) {
                                    var a = (prof.parts[1].angle + prof.parts[2].angle) / 2
                                    var id_d = new ElementDescriptor(l.points[0].x, l.points[0].y, a, `\n${i+1}.${type_id}.${type_c}`, {
                                        x: 0,
                                        y: d.offset.y
                                    })
                                    id_d.textSize = textSize
                                    id_d.draw();
                                }
                            }

                            // DRAW THE LENGTH OF THE PROFILE
                            d.offset = {
                                x: 0,
                                y: textSize + 1
                            }
                            if (k < 30) {
                                d.text = round(leng * 1000, 0) /*+ (isFirst ? `\n${i+1}.${type_id}.${type_c}` : "")*/

                                d.draw();
                            }

                            d.offset = origD;
                            d.textSize = origTS;
                            d.text = origText;

                            isFirst = false
                        }
                        lastProf = prof;
                        prof.draw()
                    }

                    if (sameConnectedProfiles.length > 0) {
                        var mid = sameConnectedProfiles[floor(sameConnectedProfiles.length / 2)]
                        var d1 = mid.descriptors[0]

                        d1.offset = d.offset
                        d1.textSize = d.textSize

                        d1.text = lastID
                        d1.draw();

                        //console.log("drawn", lastID, d1, d)
                        sameConnectedProfiles = []
                    }
                }
            }
        }
    }

    downloadOBJ() {
        var obj = new OBJfile([], []);

        for (var p of this.autoProfiles) {
            if (p.obj.vertices.lenght == 0) p.draw3D();

            obj.combine(p.obj);
        }

        obj.export(true);
    }

    reset() {
        for (var inp of document.getElementsByTagName("input")) {
            try {
                if (inp.value == "" && inp.type == "text" &&
                    this.mainGeometry.changingData.input != inp &&
                    this.autoProfileGeometry.changingData.input != inp && inp.style.left == "-100px") {
                    inp.remove();
                }
            } catch (error) {}
        }

        this.mainGeometry.reset();
        //this.innerGeometry = null;
        this.autoProfileGeometry = null;
        this.autoProfiles = [];
        this.autoProfilesList = [];
        this.autoProfilesListCompact = [];
        this.additionalVertex1 = null;
        this.additionalVertex2 = null;
        this.tool = 0;

        this.stack = [defaultProfileData];
        this.stackIndex = 0;
    }

    keyPressed() {
        if (this.tool == 0) {
            this.mainGeometry.keyPressed();
        } else if (this.tool == 1) {
            if (keyCode == 27) {
                this.additionalVertex1 = null;
                this.additionalVertex2 = null;
            }
        }
    }

    mousePressed(event) {
        if (this.tool == 0) this.mainGeometry.mousePressed(event);
        else if (this.tool == 1) {
            if (event.which == 1) {
                //Save the mouse position into a variable
                var mP = { x: mousePos().x, y: mousePos().y };
                //Try snaping to grid
                if (this.mainGeometry.snapToG) {
                    const _allL = this.mainGeometry.lines.concat(this.mainGeometry.additionalLines);
                    if (this.mainGeometry.closed) _allL.push(this.mainGeometry.closingLine);

                    mP = this.mainGeometry.grid.getClosestSnap(mP.x, mP.y, this.mainGeometry.points, _allL);
                }

                if (isInFrame(mP.x, mP.y)) {
                    if (this.additionalVertex1 == null) {
                        this.additionalVertex1 = new Point(this.mainGeometry, mP.x, mP.y);
                    } else if (this.additionalVertex2 == null) {
                        this.additionalVertex2 = new Point(this.mainGeometry, mP.x, mP.y);

                        this.mainGeometry.addAdditionalLine(this.additionalVertex1, this.additionalVertex2);
                        this.mainGeometry.updateCall();

                        this.additionalVertex1 = null;
                        this.additionalVertex2 = null;
                    }
                }
            } else {
                this.additionalVertex1 = null;
                this.additionalVertex2 = null;
            }
        } else if (this.tool == 2) {
            if (isInFrame(mousePos().x, mousePos().y)) {
                var d = document.getElementById("ProfileChangeDiv");

                if (this.hoverProfile != null) {
                    this.changingProfile = this.hoverProfile;
                    this.changing = true;

                    var ht = "";
                    d.innerHTML = "";

                    var xinht = '',
                        yinht = '',
                        zinht = '';
                    for (var i = 0; i < this.changingProfile.parts.length; i++) {
                        var name = String.fromCharCode((i + 10) % 13 + 110);

                        // Dropdown open
                        //test
                        if (name == 'x') {
                            xinht += `<div data-segment="${name}">
                                        <div class="input-group" style="">
                                            <div class="input-group-prepend"><span class="input-group-text">${name + " Länge (mm)"}</span></div>
                                            <input class="form-control profileInputs" type="number" step='250' value="${
                                                1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].length), 5)
                                            }" id="example-number-input"/>
                                        </div> `

                            // Separator
                            xinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // a mass
                            xinht += `
                                            <div class="input-group" style="">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " a-Maß (mm)"}</span></div>
                                                <input class="form-control profileInputsA" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].aMass), 5)
                                                }" id="example-number-input"/>
                                            </div> `

                            // Z profil

                            xinht += `
                                            <form ${this.changingProfile.parts[i].isOuter?"":"style='display:none'"}>
                                                <div>
                                                    <label class="checkbox checkbox-success" style="margin-top:10px; margin-left: 10px;">
                                                        <h3 class="card-title font-weight-bolder text-gray" style="margin-bottom: 0px; margin-right: 5px;">${name}-Profil: </h3>
                                                        <input class="form-control profileInputs_ZProfileA" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.parts[i].z_profile_a ? "checked":""}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                            </form>`

                            // Separator
                            xinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // b mass
                            xinht += `
                                            <div class="input-group" style="margin-bottom:10px;">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " Mauerbreite (mm)"}</span></div>
                                                <input class="form-control profileInputsB" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].wallW), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            xinht += `
                                            <div class="input-group" style="margin-bottom:10px;">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " äußerer Versatz (mm)"}</span></div>
                                                <input class="form-control profileInputsB_Out" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].out), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            xinht += `
                                            <div class="input-group" style="">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " innerer Versatz (mm)"}</span></div>
                                                <input class="form-control profileInputsB_Inn" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].inn), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            // Separator
                            xinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // c mass
                            xinht += `
                                            <div class="input-group">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " c-Maß (mm)"}</span></div>
                                                <input class="form-control profileInputsC" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].cMass), 5)
                                                }" id="example-number-input"/>
                                            </div>`

                            // Z profil

                            xinht += `
                                            <form ${this.changingProfile.parts[i].isOuter?"":"style='display:none'"}>
                                                <div>
                                                    <label class="checkbox checkbox-success" style="margin-top:10px; margin-left: 10px;">
                                                        <h3 class="card-title font-weight-bolder text-gray" style="margin-bottom: 0px; margin-right: 5px;">${name}-Profil: </h3>
                                                        <input class="form-control profileInputs_ZProfileC" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.parts[i].z_profile_c ? "checked":""}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                            </form>
                                        </div> `;

                        } else if (name == 'y') {
                            yinht += `<div data-segment="${name}">
                                        <div class="input-group" style="">
                                            <div class="input-group-prepend"><span class="input-group-text">${name + " Länge (mm)"}</span></div>
                                            <input class="form-control profileInputs" type="number" step='250' value="${
                                                1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].length), 5)
                                            }" id="example-number-input"/>
                                        </div> `

                            // Separator
                            yinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // a mass
                            yinht += `
                                            <div class="input-group" style="">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " a-Maß (mm)"}</span></div>
                                                <input class="form-control profileInputsA" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].aMass), 5)
                                                }" id="example-number-input"/>
                                            </div> `

                            // Z profil

                            yinht += `
                                            <form ${this.changingProfile.parts[i].isOuter?"":"style='display:none'"}>
                                                <div>
                                                    <label class="checkbox checkbox-success" style="margin-top:10px; margin-left: 10px;">
                                                        <h3 class="card-title font-weight-bolder text-gray" style="margin-bottom: 0px; margin-right: 5px;">${name}-Profil: </h3>
                                                        <input class="form-control profileInputs_ZProfileA" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.parts[i].z_profile_a ? "checked":""}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                            </form>`

                            // Separator
                            yinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // b mass
                            yinht += `
                                            <div class="input-group" style="margin-bottom:10px;">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " Mauerbreite (mm)"}</span></div>
                                                <input class="form-control profileInputsB" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].wallW), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            yinht += `
                                            <div class="input-group" style="margin-bottom:10px;">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " äußerer Versatz (mm)"}</span></div>
                                                <input class="form-control profileInputsB_Out" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].out), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            yinht += `
                                            <div class="input-group" style="">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " innerer Versatz (mm)"}</span></div>
                                                <input class="form-control profileInputsB_Inn" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].inn), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            // Separator
                            yinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // c mass
                            yinht += `
                                            <div class="input-group">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " c-Maß (mm)"}</span></div>
                                                <input class="form-control profileInputsC" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].cMass), 5)
                                                }" id="example-number-input"/>
                                            </div>`

                            // Z profil

                            yinht += `
                                            <form ${this.changingProfile.parts[i].isOuter?"":"style='display:none'"}>
                                                <div>
                                                    <label class="checkbox checkbox-success" style="margin-top:10px; margin-left: 10px;">
                                                        <h3 class="card-title font-weight-bolder text-gray" style="margin-bottom: 0px; margin-right: 5px;">${name}-Profil: </h3>
                                                        <input class="form-control profileInputs_ZProfileC" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.parts[i].z_profile_c ? "checked":""}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                            </form>
                                        </div> `;
                        } else if (name == 'z') {
                            zinht += `<div data-segment="${name}">
                                        <div class="input-group" style="">
                                            <div class="input-group-prepend"><span class="input-group-text">${name + " Länge (mm)"}</span></div>
                                            <input class="form-control profileInputs" type="number" step='250' value="${
                                                1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].length), 5)
                                            }" id="example-number-input"/>
                                        </div> `

                            // Separator
                            zinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // a mass
                            zinht += `
                                            <div class="input-group" style="">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " a-Maß (mm)"}</span></div>
                                                <input class="form-control profileInputsA" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].aMass), 5)
                                                }" id="example-number-input"/>
                                            </div> `

                            // Z profil

                            zinht += `
                                            <form ${this.changingProfile.parts[i].isOuter?"":"style='display:none'"}>
                                                <div>
                                                    <label class="checkbox checkbox-success" style="margin-top:10px; margin-left: 10px;">
                                                        <h3 class="card-title font-weight-bolder text-gray" style="margin-bottom: 0px; margin-right: 5px;">${name}-Profil: </h3>
                                                        <input class="form-control profileInputs_ZProfileA" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.parts[i].z_profile_a ? "checked":""}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                            </form>`

                            // Separator
                            zinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // b mass
                            zinht += `
                                            <div class="input-group" style="margin-bottom:10px;">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " Mauerbreite (mm)"}</span></div>
                                                <input class="form-control profileInputsB" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].wallW), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            zinht += `
                                            <div class="input-group" style="margin-bottom:10px;">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " äußerer Versatz (mm)"}</span></div>
                                                <input class="form-control profileInputsB_Out" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].out), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            zinht += `
                                            <div class="input-group" style="">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " innerer Versatz (mm)"}</span></div>
                                                <input class="form-control profileInputsB_Inn" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].inn), 5)
                                                }" id="example-number-input"/>
                                            </div>
                                            `

                            // Separator
                            zinht += `<div class="separator separator-solid separator-border-20" style="margin-top:10px; margin-bottom:10px;"></div>`;

                            // c mass
                            zinht += `
                                            <div class="input-group">
                                                <div class="input-group-prepend"><span class="input-group-text">${name + " c-Maß (mm)"}</span></div>
                                                <input class="form-control profileInputsC" type="number" step='25' value="${
                                                    1000*round(this.autoProfileGeometry.grid.toUnit(this.changingProfile.parts[i].cMass), 5)
                                                }" id="example-number-input"/>
                                            </div>`

                            // Z profil

                            zinht += `
                                            <form ${this.changingProfile.parts[i].isOuter?"":"style='display:none'"}>
                                                <div>
                                                    <label class="checkbox checkbox-success" style="margin-top:10px; margin-left: 10px;">
                                                        <h3 class="card-title font-weight-bolder text-gray" style="margin-bottom: 0px; margin-right: 5px;">${name}-Profil: </h3>
                                                        <input class="form-control profileInputs_ZProfileC" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.parts[i].z_profile_c ? "checked":""}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                            </form>
                                        </div> `;
                        }
                        //test
                        ht += `<button type="button" class="btn btn-primary" data-toggle="popover" data-segment="${name}" data-trigger="click" onclick="if(!this.clicked){ this.clicked = false} this.clicked = !this.clicked"> ${name} Segment</button>`;
                        // Length

                        ht += "<br>"
                    }

                    if (this.changingProfile.type == "End") {
                        ht += `
                        <div>
                            <label class="checkbox checkbox-success" style="margin-bottom:10px">
                                <h3 class="card-title font-weight-bolder text-grey" style="margin-bottom: 0px; margin-right: 5px;">Aufkantung: </h3>
                                <input id="profileCheckbox" type="checkbox" autocomplete="off" name="Checkboxes5" ${this.changingProfile.up ? "checked":""}>
                                <span></span>
                            </label>
                        </div>
                        <div class="input-group" style="margin-top 10px; margin-bottom:10px;">
                            <div class="input-group-prepend"><span class="input-group-text">${"Höhe (mm)"}</span></div>
                            <input class="form-control profileInputsC" type="number" step='25' value="${
                                1000*round(this.changingProfile.upLength, 5)
                            }" id="profileUpLength"/>
                        </div>
                        <br>
                        `
                    }

                    ht += "<button class='btn btn-success' style ='margin-right: 10px;' onclick = 'floorPlan.setProfileChanges()'> Einstellen </button>";

                    if (this.changingProfile.type == "Straight"
                        //|| this.changingProfile.type == "End"
                    ) {
                        // Remove button
                        ht += "<button class='btn btn-danger' onclick = 'floorPlan.removeProfile()' style ='margin-right: 10px;'> Entfernen </button>";

                        // Split profile
                        if (this.changingProfile.type == "Straight") {
                            ht += "<button class='btn btn-warning' onclick = 'floorPlan.splitProfile()'> Aufteilen </button><br><br>";
                        } else {
                            ht += "<br><br>"
                        }
                    } else if (this.changingProfile.type == "Angled") {
                        if (!this.changingProfile.orientation) {
                            ht += "<button class='btn btn-warning' onclick = 'floorPlan.changeAngledProfileOrientation()'> Satz außen </button>";
                        } else {
                            ht += "<button class='btn btn-warning' onclick = 'floorPlan.changeAngledProfileOrientation()'> Satz innen </button>";
                        }
                    }

                    d.innerHTML += ht;
                    //test
                    $('button[data-segment="x"][data-toggle="popover"]').popover({
                        html: true,
                        title: function() { return 'Fill Measurement <a href="javascript:;" class="close" data-dismiss="alert">&times;</a>'; },
                        content: function() { return xinht; },
                        sanitize: false
                    });
                    $('button[data-segment="y"][data-toggle="popover"]').popover({
                        html: true,
                        title: function() { return 'Fill Measurement <a href="javascript:;" class="close" data-dismiss="alert">&times;</a>'; },
                        content: function() { return yinht; },
                        sanitize: false
                    });
                    $('button[data-segment="z"][data-toggle="popover"]').popover({
                        html: true,
                        title: function() { return 'Fill Measurement <a href="javascript:;" class="close" data-dismiss="alert">&times;</a>'; },
                        content: function() { return zinht; },
                        sanitize: false
                    });
                    $(document).on("click", ".popover .close", function() {
                        $(this).parents(".popover").popover('hide');
                    });
                    /*
                    var xlength = '',
                        xmeasure = '',
                        xwall = '',
                        xouter = '',
                        xinternal = '',
                        xcmeasure = '',
                        ylength = '',
                        ymeasure = '',
                        ywall = '',
                        youter = '',
                        yinternal = '',
                        ycmeasure = '',
                        zlength = '',
                        zmeasure = '',
                        zwall = '',
                        zouter = '',
                        zinternal = '',
                        zcmeasure = '';*/
                    $('[data-toggle=popover]').on('hide.bs.popover', function() {
                        var segment = $(this).attr('data-segment');
                        //console.log('segment', segment, this)
                        if (segment == 'x') {
                            this.xlength = $('.profileInputs').val();
                            this.xmeasure = $('.profileInputsA').val();
                            this.xwall = $('.profileInputsB').val();
                            this.xouter = $('.profileInputsB_Out').val();
                            this.xinternal = $('.profileInputsB_Inn').val();
                            this.xcmeasure = $('.profileInputsC').val();
                        } else if (segment == 'y') {
                            this.ylength = $('.profileInputs').val();
                            this.ymeasure = $('.profileInputsA').val();
                            this.ywall = $('.profileInputsB').val();
                            this.youter = $('.profileInputsB_Out').val();
                            this.yinternal = $('.profileInputsB_Inn').val();
                            this.ycmeasure = $('.profileInputsC').val();
                        } else if (segment == 'z') {
                            this.zlength = $('.profileInputs').val();
                            this.zmeasure = $('.profileInputsA').val();
                            this.zwall = $('.profileInputsB').val();
                            this.zouter = $('.profileInputsB_Out').val();
                            this.zinternal = $('.profileInputsB_Inn').val();
                            this.zcmeasure = $('.profileInputsC').val();
                        }
                    });
                    $('[data-toggle=popover]').on('click', function() {
                        //setTimeout(() => {
                        var segment = $(this).attr('data-segment');
                        //console.log('segment showing', segment, this)
                        if (segment == 'x') {
                            $('.profileInputs').val(this.xlength == undefined ? $('.profileInputs').attr('value') : this.xlength);
                            $('.profileInputsA').val(this.xmeasure == undefined ? $('.profileInputsA').attr('value') : this.xmeasure);
                            $('.profileInputsB').val(this.xwall == undefined ? $('.profileInputsB').attr('value') : this.xwall);
                            $('.profileInputsB_Out').val(this.xouter == undefined ? $('.profileInputsB_Out').attr('value') : this.xouter);
                            $('.profileInputsB_Inn').val(this.xinternal == undefined ? $('.profileInputsB_Inn').attr('value') : this.xinternal);
                            $('.profileInputsC').val(this.xcmeasure == undefined ? $('.profileInputsC').attr('value') : this.xcmeasure);
                            //console.log('xlength', this.xlength == undefined ? $('.profileInputs').attr('value') : this.xlength)
                        } else if (segment == 'y') {
                            $('.profileInputs').val(this.ylength == undefined ? $('.profileInputs').attr('value') : this.ylength);
                            $('.profileInputsA').val(this.ymeasure == undefined ? $('.profileInputsA').attr('value') : this.ymeasure);
                            $('.profileInputsB').val(this.ywall == undefined ? $('.profileInputsB').attr('value') : this.ywall);
                            $('.profileInputsB_Out').val(this.youter == undefined ? $('.profileInputsB_Out').attr('value') : this.youter);
                            $('.profileInputsB_Inn').val(this.yinternal == undefined ? $('.profileInputsB_Inn').attr('value') : this.yinternal);
                            $('.profileInputsC').val(this.ycmeasure == undefined ? $('.profileInputsC').attr('value') : this.ycmeasure);
                        } else if (segment == 'z') {
                            $('.profileInputs').val(this.zlength == undefined ? $('.profileInputs').attr('value') : this.zlength);
                            $('.profileInputsA').val(this.zmeasure == undefined ? $('.profileInputsA').attr('value') : this.zmeasure);
                            $('.profileInputsB').val(this.zwall == undefined ? $('.profileInputsB').attr('value') : this.zwall);
                            $('.profileInputsB_Out').val(this.zouter == undefined ? $('.profileInputsB_Out').attr('value') : this.zouter);
                            $('.profileInputsB_Inn').val(this.zinternal == undefined ? $('.profileInputsB_Inn').attr('value') : this.zinternal);
                            $('.profileInputsC').val(this.zcmeasurey == undefined ? $('.profileInputsC').attr('value') : this.zcmeasure);
                        }
                        //}, 0);
                    });
                    //test
                    return;
                }
                d.innerHTML = "";

                this.changingProfile = null;
                this.changing = false;
            }
        }
    }

    mouseReleased() {
        this.dragging = false;

        if (this.tool == 0 || this.tool == 1) this.mainGeometry.mouseReleased();
        else if (this.tool == 2) this.autoProfileGeometry.mouseReleased();
    }

    mouseDragged() {
        this.dragging = true;

        if (this.tool == 0 || this.tool == 1) this.mainGeometry.mouseDragged();
    }

    async setTool(toolNum) {
        var oldTool = this.tool;

        this.tool = toolNum;

        this.mainGeometry.changingData.changing = false;
        this.mainGeometry.changingData.input.style.display = "none";
        if (this.autoProfileGeometry != null) this.autoProfileGeometry.changingData.changing = false;

        if (this.tool == 0 || this.tool == 1) this.autoProfiles = [];
        if (this.tool == 0) //this.mainGeometry.finished = true;
            if (this.tool == 1) {
                this.additionalVertex1 = null;
                this.mainGeometry.finished = true;
            }
        if (this.tool == 2 && oldTool != 3 && oldTool != 2) {
            this.autoProfileGeometry = null;

            if (this.applyForceLength) {
                var leng = prompt("Wie lange möchten Sie Ihre Stücke (2m/3m/4m/5m/auto)?")


                if (leng.substring(0, 1) == "2") {
                    this.forceLength = 2;
                } else if (leng.substring(0, 1) == "3") {
                    this.forceLength = 3;
                } else if (leng.substring(0, 1) == "4") {
                    this.forceLength = 4;
                } else if (leng.substring(0, 1) == "5") {
                    this.forceLength = 5;
                } else {
                    this.applyForceLength = false;
                }
            }
        }

        if (this.mainGeometry.doUpdateCall) {
            if (this.tool == 3) c.restrictProjectEdit(projectDetails.id);
            else await c.liftProjectEditRestriction(projectDetails.id);
            //this.mainGeometry.updateCall();
        }
    }

    setProfileChanges() {
        var values = [];
        var aMasses = [];
        var wallWidths = [];
        var inns = [];
        var outs = [];
        var cMasses = [];
        var zProfilesA = [];
        var zProfilesC = [];

        for (var b of $('[data-segment]')) {
            if (!b.clicked) b.click()

            for (var input of document.getElementsByClassName("profileInputs")) {
                values.push(Math.abs(parseFloat(input.value) / 1000));
            }

            for (var input of document.getElementsByClassName("profileInputsA")) {
                aMasses.push(Math.abs(parseFloat(this.autoProfileGeometry.grid.toPixels(input.value)) / 1000));
            }
            for (var input of document.getElementsByClassName("profileInputsB")) {
                wallWidths.push(Math.abs(parseFloat(this.autoProfileGeometry.grid.toPixels(input.value)) / 1000));
            }
            for (var input of document.getElementsByClassName("profileInputsB_Inn")) {
                inns.push(Math.abs(parseFloat(this.autoProfileGeometry.grid.toPixels(input.value)) / 1000));
            }
            for (var input of document.getElementsByClassName("profileInputsB_Out")) {
                outs.push(Math.abs(parseFloat(this.autoProfileGeometry.grid.toPixels(input.value)) / 1000));
            }
            for (var input of document.getElementsByClassName("profileInputsC")) {
                cMasses.push(Math.abs(parseFloat(this.autoProfileGeometry.grid.toPixels(input.value)) / 1000));
            }
            for (var input of document.getElementsByClassName("profileInputs_ZProfileA")) {
                zProfilesA.push(input.checked);
            }
            for (var input of document.getElementsByClassName("profileInputs_ZProfileC")) {
                zProfilesC.push(input.checked);
            }

            b.click()
        }

        //this.changingProfile = this.autoProfiles[this.autoProfiles.indexOf(this.changingProfile)];

        for (var i = 0; i < this.changingProfile.parts.length; i++) {
            this.changingProfile.parts[i].aMass = aMasses[i];
            this.changingProfile.parts[i].wallW = wallWidths[i];
            this.changingProfile.parts[i].inn = inns[i];
            this.changingProfile.parts[i].out = outs[i];
            this.changingProfile.parts[i].cMass = cMasses[i];
            this.changingProfile.parts[i].z_profile_a = zProfilesA[i];
            this.changingProfile.parts[i].z_profile_c = zProfilesC[i];

            this.changeProfileLineLength(values[i], this.changingProfile.parts[i]);
        }

        if (this.changingProfile.type == "End") {
            var prof = floorPlan.autoProfiles[floorPlan.autoProfiles.indexOf(floorPlan.changingProfile)];
            prof.up = document.getElementById("profileCheckbox").checked;
            prof.upLength = (+document.getElementById("profileUpLength").value / 1000);
        }

        var d = document.getElementById("ProfileChangeDiv");

        d.innerHTML = "";

        this.changingProfile = null;
        this.changing = false;

        this.saveProfiles();
    }

    removeProfile() {
        var lineID = -1;

        for (var l of this.autoProfileGeometry.lines) {
            if (this.changingProfile.parts[0].points[0].x == l.points[0].x &&
                this.changingProfile.parts[0].points[0].y == l.points[0].y &&
                this.changingProfile.parts[0].points[1].x == l.points[1].x &&
                this.changingProfile.parts[0].points[1].y == l.points[1].y) {
                lineID = this.autoProfileGeometry.lines.indexOf(l);
                break;
            }
        }

        if (lineID != -1) {
            this.autoProfileGeometryLineTypes.splice(lineID, 1);
            //this.autoProfileGeometry.changeLength(this.changingProfile.parts[0].length + this.autoProfileGeometry.lines[lineID + 1].length, this.changingProfile.parts[0])
            this.autoProfileGeometry.removePoint(this.changingProfile.parts[0].points[1]);
            this.autoProfiles.splice(this.autoProfiles.indexOf(this.changingProfile), 1);
        } else {
            for (var l of this.autoProfileGeometry.additionalLines) {
                if (l != this.changingProfile.parts[0]) {
                    var center;
                    var side1;
                    var side2;

                    if (this.changingProfile.parts[0].points[1] == l.points[0]) {
                        center = l.points[0];
                        side1 = this.changingProfile.parts[0].points[0];
                        side2 = l.points[1];
                    } else if (this.changingProfile.parts[0].points[1] == l.points[1]) {
                        center = l.points[1];
                        side1 = this.changingProfile.parts[0].points[0];
                        side2 = l.points[0];
                    }

                    if (center) {
                        lineID = (this.autoProfileGeometry.lines.concat(this.autoProfileGeometry.additionalLines)).indexOf(this.changingProfile.parts[0]);
                        //this.autoProfileGeometryLineTypes.splice(lineID, 1);

                        this.autoProfileGeometry.removePoint(center);
                        this.autoProfileGeometry.addAdditionalLine(side2, side1);

                        this.autoProfiles.splice(this.autoProfiles.indexOf(this.changingProfile), 1);
                        break;
                    }
                }
            }
        }

        var d = document.getElementById("ProfileChangeDiv");

        d.innerHTML = "";

        this.changingProfile = null;
        this.changing = false;

        this.saveProfiles();
    }

    splitProfile() {
        var lineID = -1;

        for (var l of this.autoProfileGeometry.lines) {
            if (this.changingProfile.parts[0].points[0].x == l.points[0].x &&
                this.changingProfile.parts[0].points[0].y == l.points[0].y &&
                this.changingProfile.parts[0].points[1].x == l.points[1].x &&
                this.changingProfile.parts[0].points[1].y == l.points[1].y) {
                lineID = this.autoProfileGeometry.lines.indexOf(l);
                break;
            }
        }

        if (lineID != -1) {
            var l = this.autoProfileGeometry.lines[lineID];

            this.autoProfileGeometryLineTypes.splice(lineID, 0, "Straight");
            this.autoProfileGeometry.points.splice(lineID + 1, 0, new Point(this.autoProfileGeometry, l.x, l.y))
            this.autoProfileGeometry.update();
            this.autoProfiles.splice(lineID, 0, Object.create(this.changingProfile));
        } else {
            var origLID = this.autoProfileGeometry.lines.length - 1;
            for (var l of this.autoProfileGeometry.additionalLines) {
                if (this.changingProfile.parts[0].points[0].x == l.points[0].x &&
                    this.changingProfile.parts[0].points[0].y == l.points[0].y &&
                    this.changingProfile.parts[0].points[1].x == l.points[1].x &&
                    this.changingProfile.parts[0].points[1].y == l.points[1].y) {
                    lineID = this.autoProfileGeometry.additionalLines.indexOf(l);
                    break;
                }
            }

            var l = this.autoProfileGeometry.additionalLines[lineID];

            //this.autoProfileGeometryLineTypes.splice(lineID + origLID, 0, "Straight");
            this.autoProfiles.splice(lineID + origLID, 0, Object.create(this.changingProfile));

            var side1 = this.autoProfileGeometry.additionalLines[lineID].points[0];
            var side2 = this.autoProfileGeometry.additionalLines[lineID].points[1];
            var center = new Point(this.autoProfileGeometry, this.autoProfileGeometry.additionalLines[lineID].x, this.autoProfileGeometry.additionalLines[lineID].y);
            this.autoProfileGeometry.additionalLines.splice(lineID, 1)

            this.autoProfileGeometry.addAdditionalLine(side1, center);
            this.autoProfileGeometry.addAdditionalLine(center, side2);
        }

        var d = document.getElementById("ProfileChangeDiv");

        d.innerHTML = "";

        this.changingProfile = null;
        this.changing = false;

        this.saveProfiles();
    }

    changeAngledProfileOrientation() {
        this.changingProfile.orientation = !this.changingProfile.orientation

        var d = document.getElementById("ProfileChangeDiv");

        d.innerHTML = "";

        this.changingProfile = null;
        this.changing = false;

        this.saveProfiles();
    }

    changeProfileLineLength(length, line) {
        var findConnections = function(p, f, arr, al) {
            var ret = [];

            var allL = [];
            if (!arr) {
                allL = f.mainGeometry.lines.concat(f.mainGeometry.additionalLines);
                if (f.mainGeometry.closed) allL.push(f.mainGeometry.closingLine);
            } else {
                allL = arr;
            }

            for (var l of allL) {
                if (l != al) {
                    if (round(l.points[0].x, 5) == round(p.x, 5) && round(l.points[0].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    } else if (round(l.points[1].x, 5) == round(p.x, 5) && round(l.points[1].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    }
                }
            }

            return ret
        }

        var newLength = this.autoProfileGeometry.grid.toPixels(length);
        var chLine = line;
        var prof;

        for (var pr of this.autoProfiles) {
            for (var part of pr.parts) {
                if ((part.points[0].x == chLine.points[0].x &&
                        part.points[0].y == chLine.points[0].y &&
                        part.points[1].x == chLine.points[1].x &&
                        part.points[1].y == chLine.points[1].y) ||
                    (part.points[1].x == chLine.points[0].x &&
                        part.points[1].y == chLine.points[0].y &&
                        part.points[0].x == chLine.points[1].x &&
                        part.points[0].y == chLine.points[1].y)) {
                    prof = pr;
                }
            }
        }

        if (prof.type != new Straight_Profile(null, [], [], [], [], [], [], [], "grey").type) {
            if (prof.parts.length > 1) {
                var centerPoint = prof.findCenterpoint();

                this.autoProfileGeometry.changeLengthConservative(
                    newLength,
                    chLine,
                    centerPoint
                );
            } else {
                // End piece
                var centerPoint;
                var minC = 1000;

                for (var p of prof.parts[0].points) {
                    var c = findConnections(p, this, this.autoProfileGeometry.lines.concat(this.autoProfileGeometry.additionalLines), prof.parts[0]);
                    if (c.length < minC) {
                        minC = c.length;
                        centerPoint = p;
                    }
                }

                this.autoProfileGeometry.changeLengthConservative(
                    newLength,
                    chLine,
                    centerPoint
                );
            }

            this.autoProfileGeometry.changingData.changing = false;
            return;
        } else {
            this.autoProfileGeometry.changeLengthConservative(
                newLength,
                chLine,
                chLine.points[0]
            );
        }
    }


    /**
     * Creates the inner/outer geometry.
     * @param {Boolean} makeOuter Tells the algorithm to make the new geometry the outer geometry (as if the main geometry was the inner geometry)
     */
    /*
        createWall(makeOuter = false) {
            var points = []
            var wallW = this.mainGeometry.grid.toPixels(this.wallWidth);
            this.innerGeometry = new PointManager();

            var m = 1;
            if (makeOuter) m = -1;

            //First point
            var angle, scaledAngle;
            if (this.mainGeometry.closed) {
                angle = this.mainGeometry.lines[0].angle + this.mainGeometry.closingAngle / 2;
                scaledAngle = this.mainGeometry.closingAngle;
                if (scaledAngle > PI) scaledAngle = 2 * PI - scaledAngle;
            } else {
                angle = this.mainGeometry.lines[0].angle + PI / 2;
                scaledAngle = PI;
            }

            points.push(new Point(this.innerGeometry,
                this.mainGeometry.points[0].x + m * Math.cos(angle) * wallW / Math.sin(scaledAngle / 2),
                this.mainGeometry.points[0].y + m * Math.sin(angle) * wallW / Math.sin(scaledAngle / 2)
            ))

            for (var p = 1; p < this.mainGeometry.points.length - 1; p++) {
                //All other points
                var angle = this.mainGeometry.lines[p].angle + this.mainGeometry.relativeAngles[p] / 2
                var scaledAngle = this.mainGeometry.relativeAngles[p];

                if (scaledAngle > PI) scaledAngle = 2 * PI - scaledAngle;

                points.push(new Point(this.innerGeometry,
                    this.mainGeometry.points[p].x + m * Math.cos(angle) * wallW / Math.sin(scaledAngle / 2),
                    this.mainGeometry.points[p].y + m * Math.sin(angle) * wallW / Math.sin(scaledAngle / 2)
                ))
            }


            var angle, scaledAngle;
            if (this.mainGeometry.closed) {
                scaledAngle = (PI - this.mainGeometry.closingLine.angle + this.mainGeometry.lines[this.mainGeometry.points.length - 2].angle) % (2 * PI);
                angle = this.mainGeometry.closingLine.angle + scaledAngle / 2;
                if (scaledAngle > PI) scaledAngle = 2 * PI - scaledAngle;
            } else {
                angle = this.mainGeometry.lines[0].angle - PI / 2;
                scaledAngle = -PI;
            }

            points.push(new Point(this.innerGeometry,
                this.mainGeometry.points[this.mainGeometry.points.length - 1].x + m * Math.cos(angle) * wallW / Math.sin(scaledAngle / 2),
                this.mainGeometry.points[this.mainGeometry.points.length - 1].y + m * Math.sin(angle) * wallW / Math.sin(scaledAngle / 2)
            ))

            this.innerGeometry.points = points;
            this.innerGeometry.finished = true;
            if (this.mainGeometry.closed) {
                this.innerGeometry.close();
            }
            this.innerGeometry.allowHover = false;
        }*/

    async createProfileGeometry() {
        // Calculate the starting wall width in pixels
        var wallW = this.mainGeometry.grid.toPixels(this.wallWidth);

        // Calculate the corner margin (0.25m) in pixels
        var cornerMargin = this.mainGeometry.grid.toPixels(0.25);
        // This saves what types the lines are
        this.autoProfileGeometryLineTypes = [];

        // Create a new empty PointManager
        this.autoProfileGeometry = new PointManager([this.mainGeometry.points[0]]);
        // Set up the pointManager
        this.autoProfileGeometry.finished = true;
        this.autoProfileGeometry.allowHover = false;
        this.autoProfileGeometry.convertToUnit = true;

        // This function calculates the addition margin depending on the angle and the wall thickness
        var add = function(x, wall) {
            return (Math.abs(wall * (1 / Math.sin(x) + 1 / Math.tan(x))));
        }

        // Function that adds a corner, a T piece or a other piece
        var addVert = function(id, f, ang, len, isRight) {
            var a = additionalConnections(id, f);

            if (a == 0) {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("Corner")
            } else if (a == 1) {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("T-shape")
            } else {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("Other")
            }
        }

        var addVertEND = function(id, f, ang, len, isRight) {
            var a = additionalConnections(id, f);

            if (a == 0) {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("End")
            } else if (a == 1) {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("Corner")
            } else if (a == 2) {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("T-shape")
            } else {
                f.autoProfileGeometry.addLine(ang, len, isRight)
                f.autoProfileGeometryLineTypes.push("Other")
            }
        }

        var findbestLength = function(l, f) {
            //Var find the best piece length
            var bestLength = 3;
            var largestDelta = 0;
            for (var tl = 3; tl <= 5; tl++) {
                var delta = (f.mainGeometry.grid.toUnit(l) % tl) / tl;
                if (delta > largestDelta) {
                    largestDelta = delta;
                    bestLength = tl;
                }
            }

            if (f.applyForceLength) return f.mainGeometry.grid.toPixels(f.forceLength);

            return f.mainGeometry.grid.toPixels(bestLength);
        }

        var findConnections = function(p, f, arr) {
            var ret = [];

            var allL = [];
            if (!arr) {
                allL = f.mainGeometry.lines.concat(f.mainGeometry.additionalLines);
                if (f.mainGeometry.closed) allL.push(f.mainGeometry.closingLine);
            } else {
                allL = arr;
            }

            for (var l of allL) {
                if (l != al) {
                    if (round(l.points[0].x, 5) == round(p.x, 5) && round(l.points[0].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    } else if (round(l.points[1].x, 5) == round(p.x, 5) && round(l.points[1].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    }
                }
            }

            return ret
        }

        // This function returns how many addition connections are made to this point
        var additionalConnections = function(id, f) {
            var p = f.mainGeometry.points[id];
            var arr = f.mainGeometry.additionalLines

            var ret = [];

            var allL = [];
            if (!arr) {
                allL = f.mainGeometry.lines.concat(f.mainGeometry.additionalLines);
                if (f.mainGeometry.closed) allL.push(f.mainGeometry.closingLine);
            } else {
                allL = arr;
            }

            for (var l of allL) {
                if (l != al) {
                    if (round(l.points[0].x, 5) == round(p.x, 5) && round(l.points[0].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    } else if (round(l.points[1].x, 5) == round(p.x, 5) && round(l.points[1].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    }
                }
            }

            return ret.length;
        }

        // The additional margin of the first point
        var add1 = cornerMargin;
        if (this.mainGeometry.closed) {
            // An angled piece
            add1 = add(this.mainGeometry.closingAngle, wallW);

            addVert(0, this, this.mainGeometry.lines[0].angle, cornerMargin + add1, true)
        } else {
            // An end piece
            addVertEND(0, this, this.mainGeometry.lines[0].angle, cornerMargin + add1, true)
        }

        var traveled = cornerMargin + add1;

        // Loop through all of the lines
        for (var l of this.mainGeometry.lines) {
            // Check if we are not on the last line
            if (this.mainGeometry.relativeAngles[l.id + 1] == undefined) {
                if (this.mainGeometry.closed) {
                    // We are so the next margin is calculated from the closingLine
                    var add2 = add(PI - this.mainGeometry.closingLine.angle + this.mainGeometry.lines[this.mainGeometry.lines.length - 1].angle, wallW);
                } else {
                    // End piece
                    var add2 = cornerMargin;
                }
            } else {
                // Otherwise calculate the next margin normally
                var add2 = add(this.mainGeometry.relativeAngles[l.id + 1], wallW);
            }

            // Convert back to pixels
            var bestLength = findbestLength(l.length - 2 * cornerMargin - add1 - add2, this);

            //Go and split the line into the pieces until we hit the next point
            while ((l.length - cornerMargin - add2) > bestLength + traveled) {
                // Add a line that is totally straight
                this.autoProfileGeometry.addLine(PI, bestLength, true)
                    // Say that it is straight
                this.autoProfileGeometryLineTypes.push("Straight")

                // Add to the total distance traveled
                traveled += bestLength;
            }

            // On the last piece of the line cut the line shorter
            this.autoProfileGeometry.addLine(PI, l.length - cornerMargin - add2 - traveled, true)
            this.autoProfileGeometryLineTypes.push("Straight")

            if (this.mainGeometry.relativeAngles[l.id + 1] != undefined || this.mainGeometry.closed) {
                // Add a corner piece
                addVert(l.id + 1, this, PI, cornerMargin + add2, true)
            }

            // The margins now shuffle
            add1 = add2;

            // try getting the next relative angle
            var nextAngle = this.mainGeometry.relativeAngles[l.id + 1];
            // if it is undefined:
            if (nextAngle == undefined) {
                if (this.mainGeometry.closed) {
                    //Is closed so we calculate the relative angle from the closing line
                    nextAngle = PI - this.mainGeometry.closingLine.angle + this.mainGeometry.lines[this.mainGeometry.lines.length - 1].angle;

                    // Find if the angle isRight
                    var isRight = true;
                    if (nextAngle > PI) {
                        nextAngle = 2 * PI - nextAngle;
                        isRight = false;
                    }

                    // Add a corner piece
                    addVert(l.id + 1, this, nextAngle, cornerMargin + add2, isRight)
                } else {
                    // End piece
                    addVertEND(l.id + 1, this, PI, cornerMargin + add1, true)
                }
            } else {
                // Next angle is defined

                // Find if the angle isRight
                var isRight = true;
                if (nextAngle > PI) {
                    nextAngle = 2 * PI - nextAngle;
                    isRight = false;
                }

                // Add a corner piece
                addVert(l.id + 1, this, nextAngle, cornerMargin + add2, isRight)
            }

            traveled = cornerMargin + add1;
        }

        if (this.mainGeometry.closed) {
            add2 = add(this.mainGeometry.closingAngle, wallW);

            bestLength = findbestLength(this.mainGeometry.closingLine.length - 2 * cornerMargin - add1 - add2, this);

            while ((this.mainGeometry.closingLine.length - cornerMargin - add2) > bestLength + traveled) {
                this.autoProfileGeometry.addLine(PI, bestLength, true)
                this.autoProfileGeometryLineTypes.push("Straight")

                traveled += bestLength;
            }

            this.autoProfileGeometry.addLine(PI, this.mainGeometry.closingLine.length - cornerMargin - add2 - traveled, true)
            this.autoProfileGeometryLineTypes.push("Straight")

            // Add a corner piece
            addVert(0, this, PI, cornerMargin + add2, true)
        }

        //Addition lines
        for (var al of this.mainGeometry.additionalLines) {
            var l1;
            var l2;

            add1 = 0;
            add2 = 0;

            var p1Connections = findConnections(al.points[0], this);
            var p2Connections = findConnections(al.points[1], this);

            //1st point

            //Calculate the additional offset
            if (p1Connections.length == 0) add1 = cornerMargin + wallW;
            else if (p1Connections.length == 1) add1 = cornerMargin + add(PI - al.angle + p1Connections[0].angle, wallW);
            else if (p1Connections.length == 2) add1 = cornerMargin + wallW;
            else add1 = cornerMargin + wallW;

            // Make the 1st connection to the maingeometry
            var p1 = new Point(this.autoProfileGeometry, al.points[0].x, al.points[0].y);
            var p2 = new Point(this.autoProfileGeometry, al.points[0].x + cos(al.angle) * add1, al.points[0].y + sin(al.angle) * add1);
            l1 = p2;

            this.autoProfileGeometry.addAdditionalLine(p1, p2);

            // Set the color
            if (p1Connections.length == 0) {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "orange";
            } else if (p1Connections.length == 1) {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "blue";
            } else if (p1Connections.length == 2) {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "green";
            } else {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "black";
            }

            //2nd point

            //Calculate the additional offset
            if (p2Connections.length == 0) add2 = cornerMargin + wallW;
            else if (p2Connections.length == 1) add2 = cornerMargin + add(PI - al.angle + p2Connections[0].angle, wallW);
            else if (p2Connections.length == 2) add2 = cornerMargin + wallW;
            else add2 = cornerMargin + wallW;

            // Make the 1st connection to the maingeometry
            var p1 = new Point(this.autoProfileGeometry, al.points[1].x, al.points[1].y);
            var p2 = new Point(this.autoProfileGeometry, al.points[1].x - cos(al.angle) * add2, al.points[1].y - sin(al.angle) * add2);
            l2 = p2;

            this.autoProfileGeometry.addAdditionalLine(p1, p2);

            // Set the color
            if (p2Connections.length == 0) {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "orange";
            } else if (p2Connections.length == 1) {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "blue";
            } else if (p2Connections.length == 2) {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "green";
            } else {
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "black";
            }

            var len = dist(l1.x, l1.y, l2.x, l2.y);
            var bestLength = findbestLength(len, this);

            var trav = 0;
            while (trav + bestLength < len) {
                var p1 = new Point(this.autoProfileGeometry, l1.x, l1.y);
                var p2 = new Point(this.autoProfileGeometry, l1.x + cos(al.angle) * bestLength, l1.y + sin(al.angle) * bestLength);

                this.autoProfileGeometry.addAdditionalLine(p1, p2);
                this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "red";

                trav += bestLength;
            }

            var p1 = new Point(this.autoProfileGeometry, l1.x + cos(al.angle) * trav, l1.y + sin(al.angle) * trav);
            this.autoProfileGeometry.addAdditionalLine(p1, l2);
            this.autoProfileGeometry.additionalLines[this.autoProfileGeometry.additionalLines.length - 1].c = "red";
        }

        this.saveProfiles();
        //removeEmptyInputsFromBody();

        this.mainGeometry.update();
        this.autoProfileGeometry.update();
    }

    async saveProfiles(includeInStack = true) {
        for (var p of this.autoProfiles) {
            p.updateColor();
        }

        for (var al of this.autoProfileGeometry.additionalLines.concat(this.autoProfileGeometry.lines)) {
            al.saved = false
        }
        var findConnections = function(p, f, arr) {
            var ret = [];

            var allL = [];
            if (!arr) {
                allL = f.mainGeometry.lines.concat(f.mainGeometry.additionalLines);
                if (f.mainGeometry.closed) allL.push(f.mainGeometry.closingLine);
            } else {
                allL = arr;
            }

            for (var l of allL) {
                if (l != al) {
                    if (round(l.points[0].x, 5) == round(p.x, 5) && round(l.points[0].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    } else if (round(l.points[1].x, 5) == round(p.x, 5) && round(l.points[1].y, 5) == round(p.y, 5)) {
                        ret.push(l);
                    }
                }
            }

            return ret
        }

        //Reset all arrays
        var wallWidthPx = this.autoProfileGeometry.grid.toPixels(this.wallWidth);
        var innerHeightPx = this.autoProfileGeometry.grid.toPixels(this.innerHeight);
        var outerHeightPx = this.autoProfileGeometry.grid.toPixels(this.outerHeight);
        var innerWidthPx = this.autoProfileGeometry.grid.toPixels(this.innerWidth);
        var outerWidthPx = this.autoProfileGeometry.grid.toPixels(this.outerWidth);

        var oldAutoProfiles = this.autoProfiles;
        if (oldAutoProfiles.length == 0) {
            for (var i = 0; i < this.autoProfileGeometry.lines.length + this.autoProfileGeometry.additionalLines.length; i++) {
                oldAutoProfiles.push(
                    new Profile(null,
                        Array(10).fill(wallWidthPx),
                        Array(10).fill(outerWidthPx),
                        Array(10).fill(innerWidthPx),
                        Array(10).fill(outerHeightPx),
                        Array(10).fill(false),
                        Array(10).fill(false),
                        Array(10).fill(innerHeightPx),
                        this.defaultCol
                    )
                )

                for (var j = 0; j < 10; j++) {
                    var l = new Line(new PointManager([]), this.autoProfileGeometry.lines[1].points[0], this.autoProfileGeometry.lines[1].points[0], -2);
                    l.aMass = oldAutoProfiles[i].aMasses[j];
                    l.wallW = oldAutoProfiles[i].wallWidths[j];
                    l.inn = oldAutoProfiles[i].inns[j];
                    l.out = oldAutoProfiles[i].outs[j];
                    l.cMass = oldAutoProfiles[i].cMasses[j];
                    l.z_profile_a = false;
                    l.z_profile_c = false;

                    oldAutoProfiles[oldAutoProfiles.length - 1].parts.push(l);
                }

                // End piece specific values to default values
                oldAutoProfiles[oldAutoProfiles.length - 1].up = false;
                oldAutoProfiles[oldAutoProfiles.length - 1].upLength = this.defaultUpLength;

                // Corner specific values
                oldAutoProfiles[oldAutoProfiles.length - 1].orientation = true;
            }
        }
        this.autoProfiles = [];
        this.autoProfilesListCompact = [];

        var op = oldAutoProfiles[0];
        //Save the profiles
        if (this.autoProfileGeometryLineTypes[0] == "End") {
            var parts = [this.autoProfileGeometry.lines[0]]
            for (var part of parts) part.saved = true;

            var save = new End_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D,
                this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[0].length), false)
            save.parts = parts;

            save.up = oldAutoProfiles[0].up;
            save.upLength = oldAutoProfiles[0].upLength;
            save.isFirst = true;

            this.autoProfiles.push(save);
        } else if (this.autoProfileGeometryLineTypes[0] == "Corner") {
            var parts = [this.autoProfileGeometry.lines[this.autoProfileGeometry.lines.length - 1], this.autoProfileGeometry.lines[0]]
            for (var part of parts) part.saved = true;

            var save = new Angled_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D, [this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[this.autoProfileGeometry.lines.length - 1].length), this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[0].length)],
                PI + this.autoProfileGeometry.lines[this.autoProfileGeometry.lines.length - 1].angle - this.autoProfileGeometry.lines[0].angle)
            save.parts = parts;
            save.orientation = op.orientation;

            this.autoProfiles.push(save);
        }

        var ma = this.mainGeometry.closed ? this.autoProfileGeometryLineTypes.length - 1 : this.autoProfileGeometryLineTypes.length;

        for (var p = 1; p < ma; p++) {
            var op = oldAutoProfiles[this.autoProfiles.length];

            if (this.autoProfileGeometryLineTypes[p] == "Corner") {
                var parts = [this.autoProfileGeometry.lines[p], this.autoProfileGeometry.lines[p + 1]]
                for (var part of parts) part.saved = true;

                var save = new Angled_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D, [this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[p].length), this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[p + 1].length)],
                    this.autoProfileGeometry.relativeAngles[p + 1]);
                save.parts = parts;
                save.orientation = op.orientation;

                this.autoProfiles.push(save)

                p++;
            } else if (this.autoProfileGeometryLineTypes[p] == "Straight") {
                var parts = [this.autoProfileGeometry.lines[p]]
                for (var part of parts) part.saved = true;

                var save = new Straight_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D,
                    this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[p].length));
                save.parts = parts;

                this.autoProfiles.push(save);

                // Save the rounded version
                var opl = oldAutoProfiles[this.autoProfiles.length - 1];
                var save2 = new Straight_Profile(this, opl.getWallWidths(), opl.getOuterWidths(), opl.getInnerWidths(), opl.getAMasses(), opl.getZProfilesA(), opl.getZProfilesC(), opl.getCMasses(),
                    max(Math.ceil(this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[p].length)), 3));
                save2.parts = parts;
            } else if (this.autoProfileGeometryLineTypes[p] == "T-shape") {
                var angles = [];
                var parts = findConnections(this.autoProfileGeometry.lines[p].points[1], this, this.autoProfileGeometry.additionalLines, true);
                parts.push(this.autoProfileGeometry.lines[p], this.autoProfileGeometry.lines[p + 1])
                for (var part of parts) {
                    /*
                    part.saved = true;

                    if ((PI - part.angle + parts[(parts.indexOf(part) + 1) % parts.length].angle) == PI) angles.push(PI)
                    else angles.push((PI - part.angle + parts[(parts.indexOf(part) + 1) % parts.length].angle) % 2 * PI)
                    */

                    part.saved = true;

                    var ang = (part.angle - parts[(parts.indexOf(part) + 1) % parts.length].angle);
                    if (ang < 0) ang = ang + 2 * PI;
                    if (ang > PI) ang = 2 * PI - ang

                    if (ang == PI || ang == 0) angles.push(PI)
                    else angles.push(ang)
                }

                var save = new T_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D,
                    parts.map(x => this.autoProfileGeometry.grid.toUnit(x.length)), angles);
                save.parts = parts;

                this.autoProfiles.push(save);

                p++;
            } else if (this.autoProfileGeometryLineTypes[p] == "End") {
                var parts = [this.autoProfileGeometry.lines[p]]
                for (var part of parts) part.saved = true;

                var save = new End_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D,
                    this.mainGeometry.grid.toUnit(this.autoProfileGeometry.lines[p].length), false);
                save.parts = parts;

                save.up = op.up;
                save.upLength = op.upLength;

                this.autoProfiles.push(save);
            } else {
                var parts = findConnections(this.autoProfileGeometry.lines[p].points[1], this, this.autoProfileGeometry.additionalLines);
                parts.push(this.autoProfileGeometry.lines[p], this.autoProfileGeometry.lines[p + 1])
                for (var part of parts) part.saved = true;

                var save = new Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D)
                save.parts = parts;

                this.autoProfiles.push(save);

                p++;
            }
        }

        // Add in the additional profiles
        for (var al of this.autoProfileGeometry.additionalLines) {
            var op = oldAutoProfiles[this.autoProfiles.length];

            if (!al.saved) {
                var c = [...this.autoProfileGeometry.additionalLines];
                c.splice(c.indexOf(al), 1);

                var contacts1 = findConnections(al.points[0], this, c);
                var contacts2 = findConnections(al.points[1], this, c);

                if (contacts1.length == 0 || contacts2.length == 0) {
                    //Save an End piece
                    var parts = [al]
                    for (var part of parts) part.saved = true;

                    var save = new End_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D,
                        this.mainGeometry.grid.toUnit(al.length), false);
                    save.parts = parts;

                    save.up = op.up;
                    save.upLength = op.upLength;

                    this.autoProfiles.push(save);
                } else {
                    if (contacts1.length != contacts2.length) {
                        var angles = [];
                        var parts = contacts1.length > contacts2.length ? contacts1 : contacts2;
                        parts.push(al);
                        for (var part of parts) {
                            part.saved = true;

                            var ang = (part.angle - parts[(parts.indexOf(part) + 1) % parts.length].angle);
                            if (ang < 0) ang = ang + 2 * PI;
                            if (ang > PI) ang = 2 * PI - ang

                            if (ang == PI || ang == 0) angles.push(PI)
                            else angles.push(ang)
                        }

                        if (parts.length == 3) {
                            // T-shape
                            var save = new T_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D, parts.map(x => this.autoProfileGeometry.grid.toUnit(x.length)), angles);
                            save.parts = parts;
                        } else if (parts.length > 3) {
                            // Other
                            var save = new Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D)
                            save.parts = parts;
                        }

                        this.autoProfiles.push(save);
                    } else if (contacts1.length == contacts2.length &&
                        round((al.angle + PI) % PI, 5) == round((contacts1[0].angle + PI) % PI, 5) &&
                        round((al.angle + PI) % PI, 5) == round((contacts2[0].angle + PI) % PI, 5)) {
                        // Save a line
                        var parts = [al];
                        for (var part of parts) part.saved = true;

                        var save = new Straight_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D,
                            this.mainGeometry.grid.toUnit(contacts1.length));
                        save.parts = parts;

                        this.autoProfiles.push(save);

                        // Save the rounded version
                        var opl = oldAutoProfiles[this.autoProfiles.length - 1];
                        var save2 = new Straight_Profile(this, opl.getWallWidths(), opl.getOuterWidths(), opl.getInnerWidths(), opl.getAMasses(), opl.getZProfilesA(), opl.getZProfilesC(), opl.getCMasses(),
                            max(Math.ceil(this.mainGeometry.grid.toUnit(contacts1.length)), 3));
                        save2.parts = parts;
                    } else {
                        // save corner
                        var other;
                        if (al.angle != contacts1[0].angle) {
                            other = contacts1[0];
                        } else {
                            other = contacts2[0];
                        }

                        if (!other.saved) {
                            var parts = [al, other]
                            for (var part of parts) part.saved = true;

                            var save = new Angled_Profile(this, op.getWallWidths(), op.getOuterWidths(), op.getInnerWidths(), op.getAMasses(), op.getZProfilesA(), op.getZProfilesC(), op.getCMasses(), op.col3D, [this.mainGeometry.grid.toUnit(al.length), this.mainGeometry.grid.toUnit(other.length)],
                                PI + al.angle - other.angle);
                            save.parts = parts;
                            save.orientation = op.orientation;

                            this.autoProfiles.push(save)
                        }
                    }
                }
            }
        }

        if (this.autoProfiles[0] && !this.autoProfiles[0].parts[0].aMass) {
            for (var p of this.autoProfiles) {
                p.setMasses();
            }
        }

        var copy = [...this.autoProfiles]
        this.generateNeighbors(copy);
        var startCorner;
        for (var p of copy) {
            if (p.type == "Angled") {
                startCorner = p;
                //copy.splice(copy.indexOf(p), 1)
                break;
            }
        }
        var tree = {
            start: startCorner,
            path: [],
            connections: []
        };

        var findStraightPath = (from, first) => {
            var path = [first]
            var origFrom = from
            var done = false;

            if (first.type != "Straight") {
                return {
                    path: [],
                    end: first,
                    start: from
                }
            }

            while (!done) {
                for (var p of first.neighbors.map(x => x.neighbor)) {
                    if (p != from && p != first) {
                        if (p.type == "Straight") {
                            path.push(p)
                            from = first;
                            first = p;
                        } else {
                            done = true;

                            for (var pathEl of path) {
                                copy.splice(copy.indexOf(pathEl), 1)
                            }
                            return {
                                path: path,
                                end: p,
                                start: origFrom
                            }
                        }
                    }
                }
            }

            /*
            for (var p of copy) {
                if (p != from && p != first) {
                    if (this.areNeighbors(first, p)) {
                        if (p.type == "Straight") {
                            path.push(p)
                            from = first;
                            first = p;
                        } else {
                            for (var pathEl of path) {
                                copy.splice(copy.indexOf(pathEl), 1)
                            }
                            return {
                                path: path,
                                end: p,
                                start: origFrom
                            }
                        }
                    }
                }
            }*/

            /*
            var anyEnd;
            for (var p of this.autoProfiles) {
                if (p.type != "Straight") {
                    if (this.areNeighbors(p, path[path.length - 1])) {
                        anyEnd = p;
                        break;
                    }
                }
            }*/
            return {
                path: path,
                end: null,
                start: origFrom
            }
        }

        var findConn = (parent, from, branch) => {
            if (!branch.start || branch.start == null) branch.start = from;
            if (from == null || branch.start == null) return

            for (var p = 0; p < copy.length; p++) {
                if (copy[p] != parent && copy[p] != branch.start) {
                    if (this.areNeighbors(branch.start, copy[p])) {
                        var pathData = findStraightPath(branch.start, copy[p]);

                        var newBranch = {
                            start: pathData.end,
                            path: pathData.path,
                            connections: []
                        }

                        findConn(branch.start, pathData.end, newBranch)

                        branch.connections.push(newBranch)
                        p = 0;
                    }
                }
            }

            copy.splice(copy.indexOf(from), 1)
        }

        findConn(null, tree.start, tree);

        var setConnectionMasses = (branch, lastOrientation, parent = null) => {
            // SET CONNECTION FROM PARENT
            var connectionFromParent
            for (var p of branch.path) {
                connectionFromParent = this.areNeighbors(branch.start, p, true).ob1;
                if (connectionFromParent) {
                    if (lastOrientation && (branch.start.orientation != undefined ? branch.start.orientation : true)) {
                        // Nothing
                        connectionFromParent.nextTo = false;
                        connectionFromParent.between = false;
                    } else if ((!(branch.start.orientation != undefined ? branch.start.orientation : true) || !lastOrientation) && (lastOrientation != (branch.start.orientation != undefined ? branch.start.orientation : true))) {
                        // Single one inner

                        connectionFromParent.nextTo = true;
                    } else if ((!(branch.start.orientation != undefined ? branch.start.orientation : true) || !lastOrientation) && (lastOrientation == (branch.start.orientation != undefined ? branch.start.orientation : true))) {
                        // Both inner

                        connectionFromParent.between = true;
                    }
                    break;
                }
            }

            // SET ALL PATHS
            for (var p of branch.path) {
                if (lastOrientation && (branch.start.orientation != undefined ? branch.start.orientation : true)) {
                    // Nothing
                    for (var part of p.parts) {
                        part.nextTo = false;
                        part.between = false;
                    }
                } else if ((!(branch.start.orientation != undefined ? branch.start.orientation : true) || !lastOrientation) && (lastOrientation != (branch.start.orientation != undefined ? branch.start.orientation : true))) {
                    // Single one inner

                    for (var part of p.parts) {
                        part.nextTo = true;
                    }
                } else if ((!(branch.start.orientation != undefined ? branch.start.orientation : true) || !lastOrientation) && (lastOrientation == (branch.start.orientation != undefined ? branch.start.orientation : true))) {
                    // Both inner

                    for (var part of p.parts) {
                        part.between = true;
                    }
                }
            }

            // SET ALL OUT CONNECTIONS
            for (var con of branch.connections) {

                var startPart;
                for (var p of con.path) {
                    startPart = this.areNeighbors(branch.start, p, true);
                    startPart = startPart.ob1;
                    if (startPart) break;
                }

                var nextOrientation = setConnectionMasses(con, (branch.start.orientation != undefined ? branch.start.orientation : true), branch.start)

                if ((branch.start.orientation != undefined ? branch.start.orientation : true) && nextOrientation) {
                    // Nothing
                    startPart.nextTo = false;
                    startPart.between = false;
                } else if ((!(branch.start.orientation != undefined ? branch.start.orientation : true) || !nextOrientation) && ((branch.start.orientation != undefined ? branch.start.orientation : true) != nextOrientation)) {
                    // Single one inner
                    startPart.nextTo = true;
                } else if ((!(branch.start.orientation != undefined ? branch.start.orientation : true) || !nextOrientation) && ((branch.start.orientation != undefined ? branch.start.orientation : true) == nextOrientation)) {
                    // Both inner
                    startPart.between = true;
                }

                //setConnectionMasses(con, (branch.start.orientation != undefined ? branch.start.orientation : true), branch.start)
            }

            return ((branch.start.orientation != undefined ? branch.start.orientation : true))
        }

        if (startCorner != undefined) setConnectionMasses(tree, true)

        this.compressProfileList();

        if (includeInStack) {
            if (this.mainGeometry.doUpdateCall) {
                this.mainGeometry.updateCall();
            } else this.addToStack();
        }
    }

    areNeighbors(ob1, ob2, includeTouchParts = false) {
        var id = ob1.neighbors.map(x => x.neighbor).indexOf(ob2)
        if (id != -1) {
            if (includeTouchParts) {
                return ({
                    ob1: ob1.neighbors[id].touch,
                    ob2: ob2.neighbors[id].touch
                })
            }
            return true
        }
        return false
    }

    generateNeighbors(arr) {
        for (var o1 of arr) {
            for (var o2 of arr) {
                if (o1 != o2) {
                    var touch = this.areProfilesTouching(o1, o2, true)
                    if (touch) {
                        if (!o1.neighbors) o1.neighbors = new Set()
                        if (!o2.neighbors) o2.neighbors = new Set()

                        o1.neighbors.add({
                            neighbor: o2,
                            touch: touch.ob1
                        })

                        o2.neighbors.add({
                            neighbor: o1,
                            touch: touch.ob2
                        })
                    }
                }
            }
        }

        for (var o1 of this.autoProfiles) {
            o1.neighbors = Array.from(o1.neighbors)
        }
    }

    areProfilesTouching(ob1, ob2, includeTouchParts = false) {
        for (var p1 of ob1.parts) {
            for (var p2 of ob2.parts) {
                if ((round(p1.points[0].x, 5) == round(p2.points[0].x, 5) &&
                        round(p1.points[0].y, 5) == round(p2.points[0].y, 5)) ||
                    (round(p1.points[1].x, 5) == round(p2.points[1].x, 5) &&
                        round(p1.points[1].y, 5) == round(p2.points[1].y, 5)) ||
                    (round(p1.points[0].x, 5) == round(p2.points[1].x, 5) &&
                        round(p1.points[0].y, 5) == round(p2.points[1].y, 5)) ||
                    (round(p1.points[1].x, 5) == round(p2.points[0].x, 5) &&
                        round(p1.points[1].y, 5) == round(p2.points[0].y, 5))) {

                    if (includeTouchParts) {
                        return ({
                            ob1: p1,
                            ob2: p2
                        })
                    }
                    return true
                }
            }
        }

        return false
    }

    createRoundedProfiles() {
        this.autoProfilesList = [];

        for (var p of this.autoProfiles) {
            if (p.type == new Straight_Profile(null, [], [], [], [], [], [], [], "grey").type) {
                var copy = new Straight_Profile(p.parent, p.getWallWidths(), p.getOuterWidths(), p.getInnerWidths(), p.getAMasses(), p.getZProfilesA(), p.getZProfilesC(), p.getCMasses(), p.col3D,
                    max(3, Math.ceil(p.length)));
                copy.parts = p.parts;

                this.autoProfilesList.push(copy);
            } else {
                this.autoProfilesList.push(p);
            }
        }
    }

    compressProfileList() {
        this.createRoundedProfiles();

        this.autoProfilesListCompact = [];

        this.autoProfilesListCompact.push({
            profile: this.autoProfilesList[0],
            amount: 0,
            all_profiles: [this.autoProfilesList[0]]
        })

        for (var p of this.autoProfilesList) {
            var createNew = true;
            for (var t = 0; t < this.autoProfilesListCompact.length; t++) {
                var type = this.autoProfilesListCompact[t];

                if (_.isEqual(type.profile.onlyDims(), p.onlyDims())) {
                    type.amount++;
                    type.all_profiles.push(p)
                    createNew = false;
                    break;
                }
            }

            if (createNew) {
                this.autoProfilesListCompact.push({
                    profile: p,
                    amount: 1,
                    all_profiles: [p]
                })
            }
        }

        this.autoProfilesCompact = [];

        this.autoProfilesCompact.push({
            profile: this.autoProfiles[0],
            amount: 0,
            all_profiles: [this.autoProfiles[0]]
        })

        for (var p of this.autoProfiles) {
            var createNew = true;
            for (var t = 0; t < this.autoProfilesCompact.length; t++) {
                var type = this.autoProfilesCompact[t];

                if (_.isEqual(type.profile.onlyDims(), p.onlyDims())) {
                    type.amount++;
                    type.all_profiles.push(p)
                    createNew = false;
                    break;
                }
            }

            if (createNew) {
                this.autoProfilesCompact.push({
                    profile: p,
                    amount: 1,
                    all_profiles: [p]
                })
            }
        }
    }

    getProfiles(includeOrigProfile = false) {
        this.compressProfileList()

        var profileGroups = []

        var getProfileData = function(p1) {
            // INIT VALS
            p1.getInnerWidths()
            p1.getWallWidths()
            p1.getOuterWidths()

            var ind = 0;
            var maxBMass1 = Math.max(...p1.inns.map((x, i) => p1.inns[i] + p1.outs[i] + p1.wallWidths[i]));
            for (var i = 0; i < p1.inns.length; i++) {
                if (maxBMass1 == p1.inns[i] + p1.outs[i] + p1.wallWidths[i]) {
                    ind = i;
                    break;
                }
            }

            var p1d = {
                col: p1.col3D,
                a: (p1.getAMasses()[ind]),
                i: (p1.getInnerWidths()[ind]),
                w: (p1.getWallWidths()[ind]),
                o: (p1.getOuterWidths()[ind]),
                b: maxBMass1,
                c: (p1.getCMasses()[ind]),
                za: p1.getZProfilesA()[ind],
                zc: p1.getZProfilesC()[ind]
            }

            ////////////////////

            return (p1d)
        }

        for (var pr of this.autoProfilesCompact) {
            if (profileGroups.length == 0) {
                profileGroups.push([{
                    p: _.omit(pr.profile, "parent", "parts", "neighbors"),
                    am: pr.amount,
                    profile: pr.profile,
                    all_profiles: pr.all_profiles
                }])
            } else {
                var added = false
                for (var profG of profileGroups) {
                    var p1d = getProfileData(profG[0].profile)
                    var p2d = getProfileData(pr.profile)

                    if (_.isEqual(p1d, p2d)) {
                        profG.push({
                            p: _.omit(pr.profile, "parent", "parts", "neighbors"),
                            am: pr.amount,
                            profile: pr.profile,
                            all_profiles: pr.all_profiles
                        })
                        added = true
                        break;
                    }
                }

                if (!added) {
                    profileGroups.push([{
                        p: _.omit(pr.profile, "parent", "parts", "neighbors"),
                        am: pr.amount,
                        profile: pr.profile,
                        all_profiles: pr.all_profiles
                    }])
                }
            }
        }

        for (var par of profileGroups) {
            for (var p of par) {
                if (p.p.type == "Other") {
                    p.p.lengths = p.profile.parts.map(x => floorPlan.mainGeometry.grid.toUnit(x.length));
                }
            }
        }

        if (includeOrigProfile) return (profileGroups)
        return (profileGroups.map(x => x.map(y => _.omit(y, "profile", "all_profiles"))));
    }

    getBounds(image_padding = 30) {
        // Find bounds
        var minX = Number.POSITIVE_INFINITY;
        var maxX = Number.NEGATIVE_INFINITY;
        var minY = Number.POSITIVE_INFINITY;
        var maxY = Number.NEGATIVE_INFINITY;

        for (var p of this.autoProfileGeometry.points.concat(this.autoProfileGeometry.additionalPoints)) {
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
        }

        var w = maxX - minX + 2 * image_padding
        var h = maxY - minY + 2 * image_padding

        return {
            x: {
                min: minX,
                max: maxX
            },
            y: {
                min: minY,
                max: maxY
            },
            w: w,
            h: h
        }
    }

    addPDF() {
        var oldTool = this.tool;
        var oldCamPosition = cameraPosition;
        var oldZoom = zoomVal;
        var oldW = width;
        var oldH = height;
        this.tool = -1;

        // Find bounds
        var bounds = this.getBounds();
        var c = 15 / 800
        var k = pow(max(bounds.w, bounds.h), 0.975) * c

        var image_padding = 3 * k;
        var bounds = this.getBounds(image_padding);
        var minX = bounds.x.min;
        var maxX = bounds.x.max;
        var minY = bounds.y.min;
        var maxY = bounds.y.max;
        var w = bounds.w
        var h = bounds.h

        // Draw
        resizeCanvas(1000, 700);
        clear();
        zoomVal = min(width / w, height / h)
        cameraPosition = {
            x: (-(minX + maxX) * zoomVal / 2 + width / 2),
            y: (-(minY + maxY) * zoomVal / 2 + height / 2)
        }
        draw();

        this.pdf.push({
            pdf_data: this.getProfiles(),
            img: renderer.elt.toDataURL()
        })

        this.tool = oldTool;
        cameraPosition = oldCamPosition;
        zoomVal = oldZoom;
        resizeCanvas(oldW, oldH);
    }

    removePDF(id) {
        this.pdf.splice(id, 1);
    }

    addToStack() {
        //console.log("ADD");

        if (this.stackIndex < this.stack.length - 1) {
            this.stack.length = this.stackIndex + 1;
        }

        this.stack.push(this.export());
        this.stackIndex++;

        if (this.stack.length > this.maxStackSize) {
            this.stack.shift();
            this.stackIndex--;
        }

        for (var s = 0; s < this.stack.length; s++) {
            if (this.stack[s] == this.stack[s + 1]) {
                this.stack.splice(s + 1, 1);
                s--;
                this.stackIndex--;
            }
        }

        //throw ("Added")
    }

    undo(forceQuit = false) {
        this.stackIndex = constrain(this.stackIndex, 0, this.stack.length - 1)

        if (this.stackIndex > 0) {
            this.stackIndex--;

            this.import(this.stack[this.stackIndex], false)

            if (this.sendData && !forceQuit) {
                c.updateProject(projectDetails.id, this.export(), "-1");
                this.lastSent = performance.now();
            }
        }
    }

    redo(forceQuit = false) {
        this.stackIndex = constrain(this.stackIndex, 0, this.stack.length - 1)

        if (this.stackIndex < this.stack.length - 1) {
            this.stackIndex++;

            this.import(this.stack[this.stackIndex], false)

            if (this.sendData && !forceQuit) {
                c.updateProject(projectDetails.id, this.export(), "1");
                this.lastSent = performance.now();
            }
        }
    }

    export () {
        /* 
        Type :
            0=End
            1=Straight
            2=Angled
            3=T-shpae
            4=Other
        */
        var points = [];
        var addLines = [];
        var profiles = [];

        for (var p of this.mainGeometry.points) {
            points.push({
                x: round(p.x, 5),
                y: round(p.y, 5)
            })
        }

        for (var l of this.mainGeometry.additionalLines) {
            addLines.push({
                p1: {
                    x: round(l.points[0].x, 5),
                    y: round(l.points[0].y, 5)
                },
                p2: {
                    x: round(l.points[1].x, 5),
                    y: round(l.points[1].y, 5)
                }
            })
        }

        if (this.tool == 2) {
            for (var prof of this.autoProfiles) {
                var profileCopy = {}
                var partsCopy = [];

                for (var part of prof.parts) {
                    var partCopy = {
                        a: part.aMass,
                        b: part.wallW,
                        bi: part.inn,
                        bo: part.out,
                        c: part.cMass,
                        za: part.z_profile_a,
                        zc: part.z_profile_c,
                        len: part.length,
                        ang: part.angle,
                        o: part.isOuter,
                        p: [{
                            x: part.points[0].x,
                            y: part.points[0].y
                        }, {
                            x: part.points[1].x,
                            y: part.points[1].y
                        }]
                    }

                    partsCopy.push(partCopy);
                }

                profileCopy.p = partsCopy;

                if (prof.type == "End") {
                    profileCopy.t = 0;

                    profileCopy.l = prof.length;
                    profileCopy.up = prof.up;
                    profileCopy.ul = prof.upLength;
                } else if (prof.type == "Straight") {
                    profileCopy.t = 1;

                    profileCopy.l = prof.length;
                } else if (prof.type == "Angled") {
                    profileCopy.t = 2;

                    profileCopy.ll = prof.leftLength;
                    profileCopy.rl = prof.rightLength;
                    profileCopy.a = prof.angle;
                    profileCopy.or = prof.orientation;
                } else if (prof.type == "T-shape") {
                    profileCopy.t = 3;

                    profileCopy.x = prof.xLength;
                    profileCopy.y = prof.yLength;
                    profileCopy.z = prof.zLength;

                    profileCopy.xy = prof.xyAngle;
                    profileCopy.yz = prof.yzAngle;
                    profileCopy.zx = prof.zxAngle;
                } else {
                    profileCopy.t = 4;
                }

                profileCopy.c3D = prof.col3D;

                profiles.push(profileCopy);
            }
        }

        var exp = {
            appType: globalAppType,
            closed: this.mainGeometry.closed,
            tool: this.tool,
            points: points,
            addLines: addLines,
            profiles: profiles,
            default: {
                oh: this.outerHeight,
                ih: this.innerHeight,
                ww: this.wallWidth,
                iw: this.innerWidth,
                ow: this.outerWidth,
                ul: this.defaultUpLength,
                col: this.defaultCol,
                pt: this.profile_type,
                st: this.steepness,
                al: this.thickness,
                grid: this.mainGeometry.grid.conversionToUnit,
                ha: this.halter
            },
            pdf: this.pdf
        };

        //console.log(exp)
        return (JSON.stringify(exp));
    }

    import (data, includeInStack = true) {
        var dataIn = JSON.parse(data);

        var oldApplyFL = this.applyForceLength;
        this.applyForceLength = false;

        if (includeInStack === "1") {
            this.redo(true);
            return;
        } else if (includeInStack === "-1") {
            this.undo(true);
            return;
        }

        delete this.mainGeometry;
        delete this.autoProfileGeometry;
        delete this.autoProfileGeometryLineTypes;
        delete this.autoProfiles;
        delete this.autoProfilesList;
        delete this.autoProfilesListCompact;

        this.mainGeometry = new PointManager([]);
        this.mainGeometry.parent = this;
        this.mainGeometry.updateCall = function() {
            if (!this.lastSent) this.lastSent = 0;
            if (performance.now() - this.lastSent > 1000 / maxFPS) {
                if (!this.dragging) {
                    this.parent.addToStack();
                }

                if (this.parent.sendData) {

                    c.updateProject(projectDetails.id, this.parent.export(), !this.dragging);
                    this.lastSent = performance.now();
                }
            } else return;
        }

        this.mainGeometry.convertToUnit = true;
        this.mainGeometry.snapToG = true;
        this.mainGeometry.finished = true;
        this.mainGeometry.remove180DegCorners = false;

        for (var p of dataIn.points) {
            this.mainGeometry.addPoint(p.x, p.y, true);
        }
        for (var al of dataIn.addLines) {
            this.mainGeometry.addAdditionalLine(new Point(this.mainGeometry, al.p1.x, al.p1.y), new Point(this.mainGeometry, al.p2.x, al.p2.y), true);
        }

        if (dataIn.closed) this.mainGeometry.close();
        this.mainGeometry.update();

        this.setTool(dataIn.tool);

        this.autoProfiles = [];
        this.autoProfileGeometry = new PointManager();
        this.autoProfileGeometry.convertToUnit = true;
        this.autoProfileGeometryLineTypes = [];
        for (var prof of dataIn.profiles) {
            var pushProf;

            var aMasses = prof.p.map(x => x.a);
            var zProfilesA = prof.p.map(x => x.za)
            var zProfilesC = prof.p.map(x => x.zc)
            var wallWidths = prof.p.map(x => x.b);
            var inns = prof.p.map(x => x.bi);
            var outs = prof.p.map(x => x.bo);
            var cMasses = prof.p.map(x => x.c);

            if (prof.t == 0) {
                pushProf = new End_Profile(this, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, prof.c3D, prof.l, prof.up);
                pushProf.upLength = prof.ul;
            } else if (prof.t == 1) {
                pushProf = new Straight_Profile(this, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, prof.c3D, prof.l);
            } else if (prof.t == 2) {
                pushProf = new Angled_Profile(this, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, prof.c3D, [prof.ll, prof.rl], prof.a);
                pushProf.orientation = prof.or;
            } else if (prof.t == 3) {
                pushProf = new T_Profile(this, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, prof.c3D, [prof.x, prof.y, prof.z], [prof.xy, prof.yz, prof.zx]);
            } else {
                pushProf = new Profile(this, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, prof.c3D);
            }

            var isOut = false;
            for (var part = (dataIn.closed && this.autoProfiles.length == 0) ? 1 : 0; part < prof.p.length; part++) {
                var pushPart = new Line(this.autoProfileGeometry, new Point(this.autoProfileGeometry, prof.p[part].p[0].x, prof.p[part].p[0].y), new Point(this.autoProfileGeometry, prof.p[part].p[1].x, prof.p[part].p[1].y));
                pushPart.aMass = prof.p[part].a;
                pushPart.wallW = prof.p[part].b;
                pushPart.inn = prof.p[part].bi;
                pushPart.out = prof.p[part].bo;
                pushPart.cMass = prof.p[part].c;
                pushPart.z_profile_a = prof.p[part].za;
                pushPart.z_profile_c = prof.p[part].zc;
                pushPart.isOuter = prof.p[part].o;

                if (prof.t == 0) {
                    pushPart.c = "orange";
                } else if (prof.t == 1) {
                    pushPart.c = "red";
                } else if (prof.t == 2) {
                    pushPart.c = "blue";
                } else if (prof.t == 3) {
                    pushPart.c = "green";
                } else {
                    pushPart.c = "black";
                }

                pushProf.parts.push(pushPart);

                if (pushPart.isOuter) {
                    if (this.autoProfileGeometry.points.length == 0) {
                        this.autoProfileGeometry.addPoint(pushPart.points[0].x, pushPart.points[0].y, false, true);
                    }
                    this.autoProfileGeometry.addPoint(pushPart.points[1].x, pushPart.points[1].y, false, true);

                    this.autoProfileGeometry.lines[this.autoProfileGeometry.lines.length - 1] = pushPart;

                    isOut = true;
                } else {
                    this.autoProfileGeometry.addAdditionalLine(pushPart.points[0], pushPart.points[1], true);
                }
            }

            if (isOut) {
                if (prof.t == 0) {
                    this.autoProfileGeometryLineTypes.push("End");
                } else if (prof.t == 1) {
                    this.autoProfileGeometryLineTypes.push("Straight");
                } else if (prof.t == 2) {
                    this.autoProfileGeometryLineTypes.push("Corner");
                    if (!(dataIn.closed && this.autoProfiles.length == 0)) this.autoProfileGeometryLineTypes.push("Corner");
                } else if (prof.t == 3) {
                    this.autoProfileGeometryLineTypes.push("T-shape");
                    this.autoProfileGeometryLineTypes.push("T-shape");
                } else {
                    this.autoProfileGeometryLineTypes.push("Other");
                    this.autoProfileGeometryLineTypes.push("Other");
                }
            }

            this.autoProfiles.push(pushProf)
        }

        // Handle the first part of the first profile (corner) when closed
        if (dataIn.closed) {
            if (dataIn.profiles.length > 0) {
                var pushProf = this.autoProfiles[0];
                var prof = dataIn.profiles[0];
                var part = 0;

                var pushPart = new Line(this.autoProfileGeometry, new Point(this.autoProfileGeometry, prof.p[part].p[0].x, prof.p[part].p[0].y), new Point(this.autoProfileGeometry, prof.p[part].p[1].x, prof.p[part].p[1].y));
                pushPart.aMass = prof.p[part].a;
                pushPart.wallW = prof.p[part].b;
                pushPart.inn = prof.p[part].bi;
                pushPart.out = prof.p[part].bo;
                pushPart.cMass = prof.p[part].c;
                pushPart.z_profile_a = prof.p[part].za;
                pushPart.z_profile_c = prof.p[part].zc;
                pushPart.isOuter = prof.p[part].o;

                if (prof.t == 0) {
                    pushPart.c = "orange";
                } else if (prof.t == 1) {
                    pushPart.c = "red";
                } else if (prof.t == 2) {
                    pushPart.c = "blue";
                } else if (prof.t == 3) {
                    pushPart.c = "green";
                } else {
                    pushPart.c = "black";
                }

                pushProf.parts.unshift(pushPart);

                if (pushPart.isOuter) {
                    if (this.autoProfileGeometry.points.length == 0) {
                        this.autoProfileGeometry.addPoint(pushPart.points[0].x, pushPart.points[0].y, false, true);
                    }
                    this.autoProfileGeometry.addPoint(pushPart.points[1].x, pushPart.points[1].y, false, true);

                    this.autoProfileGeometry.lines[this.autoProfileGeometry.lines.length - 1] = pushPart;

                    isOut = true;
                } else {
                    this.autoProfileGeometry.addAdditionalLine(pushPart.points[0], pushPart.points[1], true);
                }

                this.autoProfileGeometryLineTypes.push("Corner");
            }
        }

        this.autoProfileGeometry.finished = true;
        this.autoProfileGeometry.update();
        this.saveProfiles(includeInStack);

        this.createRoundedProfiles();
        this.compressProfileList();

        for (var inp of document.getElementsByTagName("input")) {
            if (inp.value == "" && inp.type == "text" &&
                this.mainGeometry.changingData.input != inp &&
                this.autoProfileGeometry.changingData.input != inp && inp.style.display == "none") {
                inp.remove();
            }
        }

        this.autoProfileGeometry.changeLineLengthConservative = true;
        this.mainGeometry.doUpdateCall = true;

        this.outerHeight = dataIn.default.oh;
        this.innerHeight = dataIn.default.ih;
        this.wallWidth = dataIn.default.ww;
        this.innerWidth = dataIn.default.iw;
        this.outerWidth = dataIn.default.ow;
        this.defaultUpLength = dataIn.default.ul;
        this.defaultCol = dataIn.default.col;
        this.profile_type = dataIn.default.pt;
        this.steepness = dataIn.default.st;
        this.thickness = dataIn.default.al;
        this.halter = dataIn.default.ha;

        this.pdf = dataIn.pdf ? dataIn.pdf : [];

        if (includeInStack) {
            this.addToStack();
        }

        this.applyForceLength = oldApplyFL;
    }
}