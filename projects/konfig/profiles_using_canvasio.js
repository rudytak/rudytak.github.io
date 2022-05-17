const out = 5;
const inn = 2.5;

class Profile {
    constructor(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D = "rgb(128, 128, 128)") {
        this.type = "Other";
        this.wallWidths = wallWidths.map(x => round(x, 5))
        this.outs = outs.map(x => round(x, 5))
        this.inns = inns.map(x => round(x, 5))
        this.aMasses = aMasses.map(x => round(x, 5))
        this.zProfilesA = zProfilesA;
        this.zProfilesC = zProfilesC;
        this.cMasses = cMasses.map(x => round(x, 5))

        this.parts = [];
        this.parent = FloorplanManager;
        this.obj = new OBJfile([], []);

        this.c = "black";
        this.col3D = col3D;
    }

    updateColor() {
        for (var p of this.parts) {
            p.c = this.c;
        }
    }

    setParent(p) {
        this.parent = p;
    }

    isPartOfOuterWall() {
        for (var l of this.parts) {
            if (l.isOuter) {
                return true
            }
        }

        return false
    }

    setMasses() {
        for (var p = 0; p < this.parts.length; p++) {
            this.parts[p].aMass = this.aMasses[p];
            this.parts[p].z_profile_a = this.zProfilesA[p];
            this.parts[p].z_profile_c = this.zProfilesC[p];
            this.parts[p].wallW = this.wallWidths[p];
            this.parts[p].out = this.outs[p];
            this.parts[p].inn = this.inns[p];
            this.parts[p].cMass = this.cMasses[p];
        }
    }

    onlyDims() {
        if (this.parts.length != 0) {
            this.aMasses = this.getAMasses();
            this.cMasses = this.getCMasses();
            this.inns = this.getInnerWidths();
            this.wallWidths = this.getWallWidths();
            this.outs = this.getOuterWidths();
            this.zProfilesA = this.getZProfilesA();
            this.zProfilesC = this.getZProfilesC();
        }

        return (_.omit(this, "neighbors", "parent", "saved", "parts", "obj"))
    }

    getAMasses() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.aMass)
            }
            return ret;
        } else {
            return this.aMasses;
        }
    }
    getZProfilesA() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.z_profile_a)
            }
            return ret;
        } else {
            return this.zProfilesA;
        }
    }
    getZProfilesC() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.z_profile_c)
            }
            return ret;
        } else {
            return this.zProfilesC;
        }
    }
    getWallWidths() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.wallW)
            }
            return ret;
        } else {
            return this.wallWidths;
        }
    }
    getOuterWidths() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.out)
            }
            return ret;
        } else {
            return this.outs;
        }
    }
    getInnerWidths() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.inn)
            }
            return ret;
        } else {
            return this.inns;
        }
    }
    getCMasses() {
        if (this.parts.length != 0) {
            var ret = [];
            for (var p of this.parts) {
                ret.push(p.cMass)
            }
            return ret;
        } else {
            return this.cMasses;
        }
    }

    draw(forceDisab = false, descriptors = false) {
        this.updateColor();

        for (var p = 0; p < this.parts.length; p++) {
            if (this.parts[p].aMass == undefined) {
                this.parts[p].aMass = this.aMasses[p];
            }
            if (this.parts[p].z_profile_a == undefined) {
                this.parts[p].z_profile_a = this.zProfilesA[p];
            }
            if (this.parts[p].z_profile_c == undefined) {
                this.parts[p].z_profile_c = this.zProfilesC[p];
            }
            if (this.parts[p].wallW == undefined) {
                this.parts[p].wallW = this.wallWidths[p];
            }
            if (this.parts[p].inn == undefined) {
                this.parts[p].inn = this.inns[p];
            }
            if (this.parts[p].out == undefined) {
                this.parts[p].out = this.outs[p];
            }
            if (this.parts[p].cMass == undefined) {
                this.parts[p].cMass = this.cMasses[p];
            }
        }

        var highlight = false;
        for (var p of this.parts) p.mouseOver(false) ? highlight = true : undefined;

        for (var p of this.parts) {
            p.draw(true, highlight && forceDisab);

            if (descriptors) {
                var desc;
                if (this.type == "Straight" || this.type == "End") {
                    var desc = new ElementDescriptor(p.x, p.y, p.angle, String.fromCharCode((this.parts.indexOf(p) + 10) % 13 + 110) + "=" +
                            round(this.parent.mainGeometry.grid.toUnit(p.length), 2) + this.parent.mainGeometry.grid.unit, { x: 0, y: -10 }) // Name descriptor
                } else {
                    var desc = new ElementDescriptor(p.x, p.y, p.angle, String.fromCharCode((this.parts.indexOf(p) + 10) % 13 + 110), { x: 0, y: -10 }) // Name descriptor
                }

                desc.c = p.c;

                desc.draw();
            }
        }

        if (this.type == "Straight") {
            stroke("gray")

            var l = this.parts[0];
            var p1 = l.points[0];
            var p2 = l.points[1];
            var a = l.angle + PI / 2;

            var splitterLength = 7;

            line(p1.x - cos(a) * splitterLength / 2, p1.y - sin(a) * splitterLength / 2,
                p1.x + cos(a) * splitterLength / 2, p1.y + sin(a) * splitterLength / 2);

            line(p2.x - cos(a) * splitterLength / 2, p2.y - sin(a) * splitterLength / 2,
                p2.x + cos(a) * splitterLength / 2, p2.y + sin(a) * splitterLength / 2);
        }

        this.drawInner();
        return (highlight);
    }

    getAveragePosition() {
        var allP = [];
        for (var p of this.parts) allP = allP.concat(p.points);

        var totalX = 0;
        var totalY = 0;
        for (var p of allP) {
            totalX += p.x;
            totalY += p.y;
        }

        return {
            x: totalX / allP.length,
            y: totalY / allP.length
        }
    }

    getAverageSize() {
        var totalX = 0;
        var totalY = 0;
        for (var p of this.parts) {
            totalX += Math.abs(p.dx);
            totalY += Math.abs(p.dy);
        }

        return {
            x: totalX / this.parts.length,
            y: totalY / this.parts.length
        }
    }

    drawInner() {}

    calculateWidthIntersectOffset(line1, line2, offset1, offset2) {
        var l1 = new JiriLine(
            new JiriPoint(line1.x1, line1.y1),
            new JiriPoint(line1.x2, line1.y2)
        )
        var l2 = new JiriLine(
            new JiriPoint(line2.x1, line2.y1),
            new JiriPoint(line2.x2, line2.y2)
        )

        var k1 = l1.getPerpendicular(l1.a)
        var k2 = l2.getPerpendicular(l2.a)

        var c1 = new Circle(l1.a, offset1)
        var c2 = new Circle(l2.a, offset2)

        var [b11, b12] = c1.getIntersect(k1)
        var [b21, b22] = c2.getIntersect(k2)

        var p1 = l1.getParallel(b12)
        var p2 = l2.getParallel(b21)

        var ret = p1.getIntersect(p2)

        var orig = l1.getIntersect(l2)

        return {
            x: (ret.x - orig.x),
            y: (ret.y - orig.y)
        }
    }

    findCenterpoint(includeEdges = false) {
        var centerPoint;
        var allP = [];
        var edges = []

        for (var part of this.parts) {
            allP = allP.concat(part.points)
        }

        for (var p of allP) {
            var isC = true;
            for (var part of this.parts) {
                if (!((round(part.points[0].x, 5) == round(p.x, 5) && round(part.points[0].y, 5) == round(p.y, 5)) ||
                        (round(part.points[1].x, 5) == round(p.x, 5) && round(part.points[1].y, 5) == round(p.y, 5)))) {
                    edges.push(p);
                    isC = false;
                    break;
                }
            }

            if (isC) {
                centerPoint = p;
            }
        }

        if (includeEdges) return [centerPoint].concat(edges);

        return (centerPoint);
    }

    draw3D() {
        this.obj = new OBJfile([], []);

        for (var part of this.parts) {
            drawExtrude(part.points[0], part.points[1], 20);
        }
    }
}

class Straight_Profile extends Profile {
    constructor(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D, length) {
        super(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D)

        this.type = "Straight";
        this.length = round(length, 5);

        this.c = "red";

        this.between = false;
        this.nextTo = false;
    }

    drawInner() {
        var l = this.parts[0]
        stroke("gray")

        // DETERMINE THE WIDTHS
        var inner_width, outer_width;
        if (l.isOuter) {
            if (l.nextTo) {
                inner_width = l.wallW + l.inn;
                outer_width = 0;
            } else if (l.between) {
                inner_width = l.wallW + l.inn - l.out;
                outer_width = 0;
            } else {
                inner_width = l.wallW + l.inn;
                outer_width = l.out;
            }
        } else {
            if (l.nextTo) {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            } else if (l.between) {
                inner_width = l.wallW / 2 + l.inn - l.out;
                outer_width = inner_width;
            } else {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            }
        }

        // INNER SIDE
        line(
            l.points[0].x - Math.sin(PI - l.angle) * inner_width,
            l.points[0].y - Math.cos(PI - l.angle) * inner_width,
            l.points[1].x - Math.sin(PI - l.angle) * inner_width,
            l.points[1].y - Math.cos(PI - l.angle) * inner_width
        )

        // OUTER SIDE
        line(
            l.points[0].x + Math.sin(PI - l.angle) * outer_width,
            l.points[0].y + Math.cos(PI - l.angle) * outer_width,
            l.points[1].x + Math.sin(PI - l.angle) * outer_width,
            l.points[1].y + Math.cos(PI - l.angle) * outer_width
        )
    }

    draw3D() {
        this.obj = new OBJfile([], []);

        var l = this.parts[0]
        stroke(this.col3D)

        // DETERMINE THE WIDTHS
        var inner_width, outer_width;
        if (l.isOuter) {
            if (l.nextTo) {
                inner_width = l.wallW + l.inn;
                outer_width = 0;
            } else if (l.between) {
                inner_width = l.wallW + l.inn - l.out;
                outer_width = 0;
            } else {
                inner_width = l.wallW + l.inn;
                outer_width = l.out;
            }
        } else {
            if (l.nextTo) {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            } else if (l.between) {
                inner_width = l.wallW / 2 + l.inn - l.out;
                outer_width = inner_width;
            } else {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            }
        }

        // INNER SIDE
        this.obj.combine(convert3D([{
            x: l.points[0].x - Math.sin(PI - l.angle) * inner_width,
            y: l.points[0].y - Math.cos(PI - l.angle) * inner_width
        }, {
            x: l.points[1].x - Math.sin(PI - l.angle) * inner_width,
            y: l.points[1].y - Math.cos(PI - l.angle) * inner_width
        }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

        // OUTER SIDE
        this.obj.combine(convert3D([{
            x: l.points[0].x + Math.sin(PI - l.angle) * outer_width,
            y: l.points[0].y + Math.cos(PI - l.angle) * outer_width
        }, {
            x: l.points[1].x + Math.sin(PI - l.angle) * outer_width,
            y: l.points[1].y + Math.cos(PI - l.angle) * outer_width
        }], l.isOuter ? l.aMass * (l.z_profile_a ? -1 : 1) : l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

        // BACK SIDE
        this.obj.combine(drawShape([{
            x: l.points[0].x + Math.sin(PI - l.angle) * outer_width,
            y: l.points[0].y + Math.cos(PI - l.angle) * outer_width
        }, {
            x: l.points[1].x + Math.sin(PI - l.angle) * outer_width,
            y: l.points[1].y + Math.cos(PI - l.angle) * outer_width,
        }, {
            x: l.points[1].x - Math.sin(PI - l.angle) * inner_width,
            y: l.points[1].y - Math.cos(PI - l.angle) * inner_width
        }, {
            x: l.points[0].x - Math.sin(PI - l.angle) * inner_width,
            y: l.points[0].y - Math.cos(PI - l.angle) * inner_width
        }], this.col3D, "white"))

    }
}

class Angled_Profile extends Profile {
    constructor(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D, lengths, angle) {
        super(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D)

        this.type = "Angled";

        this.leftLength = round(lengths[0], 5);
        this.realLeftLength;
        this.rightLength = round(lengths[1], 5);
        this.realRightLength;
        this.angle = round(angle, 7);

        this.c = "blue";
        this.orientation = true;
    }

    // CORNER INNER WORKING
    drawInner() {
        // DETERMINE THE WIDTHS
        var inner_widths = [];
        var outer_widths = [];
        var sw = false;
        for (var l of this.parts) {
            var inner_width, outer_width;
            if (l.isOuter) {
                sw = true;
                if (l.nextTo) {
                    inner_width = l.wallW + l.inn;
                    outer_width = 0;
                } else if (l.between) {
                    inner_width = l.wallW + l.inn - l.out;
                    outer_width = 0;
                } else {
                    inner_width = l.wallW + l.inn;
                    outer_width = l.out;
                }
            } else {
                if (l.nextTo) {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                } else if (l.between) {
                    inner_width = l.wallW / 2 + l.inn - l.out;
                    outer_width = inner_width;
                } else {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                }
            }

            inner_widths.push(inner_width);
            outer_widths.push(outer_width);
        }

        // SOME VALUES HAVE TO BE SWITCHED BETWEEN INEER AND OUTER CORNERS
        var swVal = sw ? PI : 0;
        var swVal2 = sw ? -1 : 1;

        var points = this.findCenterpoint(true);
        var center = points[0];
        var edges = points.slice(1, points.length)

        var off_outer = this.calculateWidthIntersectOffset(
            this.parts[0].toSimple(),
            this.parts[1].toSimple(),
            outer_widths[0],
            outer_widths[1])
        var off_inner = this.calculateWidthIntersectOffset(
            this.parts[0].toSimple(),
            this.parts[1].toSimple(),
            inner_widths[0],
            inner_widths[1]
        )

        this.realLeftLength = round(this.parent.mainGeometry.grid.toUnit(max(
            dist(edges[0].x + Math.sin(PI - this.parts[0].angle) * outer_widths[0],
                edges[0].y + Math.cos(PI - this.parts[0].angle) * outer_widths[0],
                center.x + off_outer.x,
                center.y - off_outer.y),
            dist(edges[0].x - Math.sin(PI - this.parts[0].angle) * inner_widths[0],
                edges[0].y - Math.cos(PI - this.parts[0].angle) * inner_widths[0],
                center.x - off_inner.x,
                center.y + off_inner.y)
        )), 6)

        this.realRightLength = round(this.parent.mainGeometry.grid.toUnit(max(
            dist(edges[1].x - Math.sin(PI - this.parts[1].angle) * outer_widths[1] * swVal2,
                edges[1].y - Math.cos(PI - this.parts[1].angle) * outer_widths[1] * swVal2,
                center.x + off_outer.x,
                center.y - off_outer.y),
            dist(edges[1].x + Math.sin(PI - this.parts[1].angle) * inner_widths[1] * swVal2,
                edges[1].y + Math.cos(PI - this.parts[1].angle) * inner_widths[1] * swVal2,
                center.x - off_inner.x,
                center.y + off_inner.y)
        )), 6)

        // OUTER SIDES
        line(
            edges[0].x + Math.sin(PI - this.parts[0].angle) * outer_widths[0],
            edges[0].y + Math.cos(PI - this.parts[0].angle) * outer_widths[0],
            center.x + off_outer.x,
            center.y - off_outer.y
        )

        line(
            edges[1].x - Math.sin(PI - this.parts[1].angle) * outer_widths[1] * swVal2,
            edges[1].y - Math.cos(PI - this.parts[1].angle) * outer_widths[1] * swVal2,
            center.x + off_outer.x,
            center.y - off_outer.y,
        )

        // INNER SIDES
        line(
            edges[0].x - Math.sin(PI - this.parts[0].angle) * inner_widths[0],
            edges[0].y - Math.cos(PI - this.parts[0].angle) * inner_widths[0],
            center.x - off_inner.x,
            center.y + off_inner.y,
        )

        line(
            edges[1].x + Math.sin(PI - this.parts[1].angle) * inner_widths[1] * swVal2,
            edges[1].y + Math.cos(PI - this.parts[1].angle) * inner_widths[1] * swVal2,
            center.x - off_inner.x,
            center.y + off_inner.y,
        )
    }

    draw3D() {
        if (!this.realLeftLength || !this.realRightLength) {
            this.drawInner();
        }

        this.obj = new OBJfile([], []);

        stroke(this.col3D)

        // DETERMINE THE WIDTHS
        var inner_widths = [];
        var outer_widths = [];
        var sw = false;
        for (var l of this.parts) {
            var inner_width, outer_width;
            if (l.isOuter) {
                sw = true;
                if (l.nextTo) {
                    inner_width = l.wallW + l.inn;
                    outer_width = 0;
                } else if (l.between) {
                    inner_width = l.wallW + l.inn - l.out;
                    outer_width = 0;
                } else {
                    inner_width = l.wallW + l.inn;
                    outer_width = l.out;
                }
            } else {
                if (l.nextTo) {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                } else if (l.between) {
                    inner_width = l.wallW / 2 + l.inn - l.out;
                    outer_width = inner_width;
                } else {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                }
            }

            inner_widths.push(inner_width);
            outer_widths.push(outer_width);
        }

        // SOME VALUES HAVE TO BE SWITCHED BETWEEN INEER AND OUTER CORNERS
        var swVal = sw ? PI : 0;
        var swVal2 = sw ? -1 : 1;

        var points = this.findCenterpoint(true);
        var center = points[0];
        var edges = points.slice(1, points.length)

        var off_outer = this.calculateWidthIntersectOffset(
            this.parts[0].toSimple(),
            this.parts[1].toSimple(),
            outer_widths[0],
            outer_widths[1])
        var off_inner = this.calculateWidthIntersectOffset(
            this.parts[0].toSimple(),
            this.parts[1].toSimple(),
            inner_widths[0],
            inner_widths[1]
        )

        // OUTER SIDES
        this.obj.combine(convert3D([{
                x: edges[0].x + Math.sin(PI - this.parts[0].angle) * outer_widths[0],
                y: edges[0].y + Math.cos(PI - this.parts[0].angle) * outer_widths[0]
            },
            {
                x: center.x + off_outer.x,
                y: center.y - off_outer.y
            }
        ], this.parts[0].isOuter ? this.parts[0].aMass * (this.parts[0].z_profile_a ? -1 : 1) : this.parts[0].cMass * (this.parts[0].z_profile_c ? -1 : 1), this.col3D, "white"))
        this.obj.combine(convert3D([{
                x: edges[1].x - Math.sin(PI - this.parts[1].angle) * outer_widths[1] * swVal2,
                y: edges[1].y - Math.cos(PI - this.parts[1].angle) * outer_widths[1] * swVal2
            },
            {
                x: center.x + off_outer.x,
                y: center.y - off_outer.y
            }
        ], this.parts[1].isOuter ? this.parts[1].aMass * (this.parts[1].z_profile_a ? -1 : 1) : this.parts[1].cMass * (this.parts[1].z_profile_c ? -1 : 1), this.col3D, "white"))

        // INNER SIDES
        this.obj.combine(convert3D([{
                x: edges[0].x - Math.sin(PI - this.parts[0].angle) * inner_widths[0],
                y: edges[0].y - Math.cos(PI - this.parts[0].angle) * inner_widths[0]
            },
            {
                x: center.x - off_inner.x,
                y: center.y + off_inner.y
            }
        ], this.parts[0].cMass * (this.parts[0].z_profile_c ? -1 : 1), this.col3D, "white"));
        this.obj.combine(convert3D([{
                x: edges[1].x + Math.sin(PI - this.parts[1].angle) * inner_widths[1] * swVal2,
                y: edges[1].y + Math.cos(PI - this.parts[1].angle) * inner_widths[1] * swVal2
            },
            {
                x: center.x - off_inner.x,
                y: center.y + off_inner.y
            }
        ], this.parts[1].cMass * (this.parts[1].z_profile_c ? -1 : 1), this.col3D, "white"));

        // BACK SIDES
        this.obj.combine(drawShape([{
                x: edges[0].x + Math.sin(PI - this.parts[0].angle) * outer_widths[0],
                y: edges[0].y + Math.cos(PI - this.parts[0].angle) * outer_widths[0]
            },
            {
                x: center.x + off_outer.x,
                y: center.y - off_outer.y
            }, {
                x: center.x - off_inner.x,
                y: center.y + off_inner.y
            }, {
                x: edges[0].x - Math.sin(PI - this.parts[0].angle) * inner_widths[0],
                y: edges[0].y - Math.cos(PI - this.parts[0].angle) * inner_widths[0]
            }
        ], this.col3D, "white"));
        this.obj.combine(drawShape([{
                x: edges[1].x - Math.sin(PI - this.parts[1].angle) * outer_widths[1] * swVal2,
                y: edges[1].y - Math.cos(PI - this.parts[1].angle) * outer_widths[1] * swVal2
            },
            {
                x: center.x + off_outer.x,
                y: center.y - off_outer.y
            }, {
                x: center.x - off_inner.x,
                y: center.y + off_inner.y
            }, {
                x: edges[1].x + Math.sin(PI - this.parts[1].angle) * inner_widths[1] * swVal2,
                y: edges[1].y + Math.cos(PI - this.parts[1].angle) * inner_widths[1] * swVal2
            }
        ], this.col3D, "white"));
    }
}

class T_Profile extends Profile {
    constructor(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D, lengths, angles) {
        super(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D)
        this.type = "T-shape";

        this.xLength = round(lengths[0], 5);
        this.yLength = round(lengths[1], 5);
        this.zLength = round(lengths[2], 5);

        this.realXLength;
        this.realYLength;
        this.realZLength;

        this.xyAngle = round(angles[0], 6);
        this.yzAngle = round(angles[1], 6);
        this.zxAngle = round(angles[2], 6);

        this.c = "green";
    }

    drawInner() {
        var off;

        // DETERMINE THE WIDTHS
        var inner_widths = [];
        var outer_widths = [];
        for (var l of this.parts) {
            var inner_width, outer_width;
            if (l.isOuter) {
                if (l.nextTo) {
                    inner_width = l.wallW + l.inn;
                    outer_width = 0;
                } else if (l.between) {
                    inner_width = l.wallW + l.inn - l.out;
                    outer_width = 0;
                } else {
                    inner_width = l.wallW + l.inn;
                    outer_width = l.out;
                }
            } else {
                if (l.nextTo) {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                } else if (l.between) {
                    inner_width = l.wallW / 2 + l.inn - l.out;
                    outer_width = inner_width;
                } else {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                }
            }

            inner_widths.push(inner_width);
            outer_widths.push(outer_width);
        }

        if (this.parts[0].isOuter || this.parts[1].isOuter || this.parts[2].isOuter) {
            var points = this.findCenterpoint(true);
            var center = points[0];
            var edges = points.slice(1, points.length)

            // LEFT
            off = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[1].toSimple(),
                outer_widths[0],
                outer_widths[1])

            var l = this.parts[0];

            line(
                edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                edges[0].y - Math.cos(PI - l.angle) * inner_widths[0],
                center.x - off.x,
                center.y + off.y,
            )

            this.realXLength = max(l.length,
                dist(edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                    edges[0].y - Math.cos(PI - l.angle) * inner_widths[0],
                    center.x - off.x,
                    center.y + off.y)
            );

            l = this.parts[1];

            line(
                edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                edges[1].y - Math.cos(PI - l.angle) * inner_widths[1],
                center.x - off.x,
                center.y + off.y,
            )

            this.realYLength = max(l.length,
                dist(edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                    edges[1].y - Math.cos(PI - l.angle) * inner_widths[1],
                    center.x - off.x,
                    center.y + off.y)
            );

            // RIGHT
            off = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[0],
                outer_widths[2]
            )

            var l = this.parts[0];

            line(
                edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                edges[0].y + Math.cos(PI - l.angle) * inner_widths[0],
                center.x - off.x,
                center.y - off.y,
            )

            this.realXLength = max(this.realXLength,
                dist(edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                    edges[0].y + Math.cos(PI - l.angle) * inner_widths[0],
                    center.x - off.x,
                    center.y - off.y)
            );

            l = this.parts[2];

            line(
                edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                edges[2].y - Math.cos(PI - l.angle) * inner_widths[2],
                center.x - off.x,
                center.y - off.y,
            )

            this.realZLength = max(l.length,
                dist(edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                    edges[2].y - Math.cos(PI - l.angle) * inner_widths[2],
                    center.x - off.x,
                    center.y - off.y)
            );

            // TOP
            off = this.calculateWidthIntersectOffset(
                this.parts[1].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[1],
                outer_widths[2]
            )

            var l = this.parts[1];

            line(
                edges[1].x + Math.sin(PI - l.angle) * outer_widths[1],
                edges[1].y + Math.cos(PI - l.angle) * outer_widths[1],
                center.x - off.x,
                center.y - off.y,
            )

            this.realYLength = max(this.realYLength,
                dist(edges[1].x + Math.sin(PI - l.angle) * outer_widths[1],
                    edges[1].y + Math.cos(PI - l.angle) * outer_widths[1],
                    center.x - off.x,
                    center.y - off.y)
            );

            l = this.parts[2];

            line(
                edges[2].x + Math.sin(PI - l.angle) * outer_widths[2],
                edges[2].y + Math.cos(PI - l.angle) * outer_widths[2],
                center.x - off.x,
                center.y - off.y,
            )

            this.realZLength = max(this.realZLength,
                dist(edges[2].x + Math.sin(PI - l.angle) * outer_widths[2],
                    edges[2].y + Math.cos(PI - l.angle) * outer_widths[2],
                    center.x - off.x,
                    center.y - off.y)
            );

            this.realXLength = round(this.parent.mainGeometry.grid.toUnit(this.realXLength), 6);
            this.realYLength = round(this.parent.mainGeometry.grid.toUnit(this.realYLength), 6);
            this.realZLength = round(this.parent.mainGeometry.grid.toUnit(this.realZLength), 6);
        } else {
            var points = this.findCenterpoint(true);
            var center = points[0];
            var edges = points.slice(1, points.length)
            var a = this.xyAngle > this.zxAngle ? -1 : 1;

            // Side 1
            off = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[0],
                outer_widths[2]
            )

            var l = this.parts[0];

            line(
                edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                edges[0].y + Math.cos(PI - l.angle) * inner_widths[0],
                center.x - off.x,
                center.y - off.y,
            )

            this.realXLength = max(l.length,
                dist(edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                    edges[0].y - Math.cos(PI - l.angle) * inner_widths[0],
                    center.x - off.x,
                    center.y + off.y)
            );

            l = this.parts[2];

            line(
                edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                edges[2].y - Math.cos(PI - l.angle) * inner_widths[2],
                center.x - off.x,
                center.y - off.y,
            )

            this.realZLength = max(l.length,
                dist(edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                    edges[2].y - Math.cos(PI - l.angle) * inner_widths[2],
                    center.x - off.x,
                    center.y - off.y)
            );

            // Side 2
            off = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[1].toSimple(),
                outer_widths[0],
                outer_widths[1]
            )

            var l = this.parts[0];

            line(
                edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                edges[0].y - Math.cos(PI - l.angle) * inner_widths[0],
                center.x + off.x,
                center.y + off.y,
            )

            this.realXLength = max(this.realXLength,
                dist(edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                    edges[0].y + Math.cos(PI - l.angle) * inner_widths[0],
                    center.x - off.x,
                    center.y - off.y)
            );

            l = this.parts[1];

            line(
                edges[1].x + Math.sin(PI - l.angle) * inner_widths[1],
                edges[1].y + Math.cos(PI - l.angle) * inner_widths[1],
                center.x + off.x,
                center.y + off.y,
            )

            this.realYLength = max(l.length,
                dist(edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                    edges[1].y - Math.cos(PI - l.angle) * inner_widths[1],
                    center.x - off.x,
                    center.y + off.y)
            );

            // Side 3
            off = this.calculateWidthIntersectOffset(
                this.parts[1].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[1],
                outer_widths[2]
            )

            var l = this.parts[1];

            line(
                edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                edges[1].y - Math.cos(PI - l.angle) * inner_widths[1],
                center.x + off.x,
                center.y + off.y,
            )

            this.realYLength = max(this.realYLength,
                dist(edges[1].x + Math.sin(PI - l.angle) * outer_widths[1],
                    edges[1].y + Math.cos(PI - l.angle) * outer_widths[1],
                    center.x - off.x,
                    center.y - off.y)
            );

            l = this.parts[2];

            line(
                edges[2].x + Math.sin(PI - l.angle) * inner_widths[2],
                edges[2].y + Math.cos(PI - l.angle) * inner_widths[2],
                center.x + off.x,
                center.y + off.y,
            )

            this.realZLength = max(this.realZLength,
                dist(edges[2].x + Math.sin(PI - l.angle) * outer_widths[2],
                    edges[2].y + Math.cos(PI - l.angle) * outer_widths[2],
                    center.x - off.x,
                    center.y - off.y)
            );

            this.realXLength = round(this.parent.mainGeometry.grid.toUnit(this.realXLength), 6);
            this.realYLength = round(this.parent.mainGeometry.grid.toUnit(this.realYLength), 6);
            this.realZLength = round(this.parent.mainGeometry.grid.toUnit(this.realZLength), 6);
        }
    }

    draw3D() {
        if (!this.realXLength || !this.realYLength || !this.realZLength) {
            this.drawInner();
        }

        this.obj = new OBJfile([], []);

        // DETERMINE THE WIDTHS
        var inner_widths = [];
        var outer_widths = [];
        for (var l of this.parts) {
            var inner_width, outer_width;
            if (l.isOuter) {
                if (l.nextTo) {
                    inner_width = l.wallW + l.inn;
                    outer_width = 0;
                } else if (l.between) {
                    inner_width = l.wallW + l.inn - l.out;
                    outer_width = 0;
                } else {
                    inner_width = l.wallW + l.inn;
                    outer_width = l.out;
                }
            } else {
                if (l.nextTo) {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                } else if (l.between) {
                    inner_width = l.wallW / 2 + l.inn - l.out;
                    outer_width = inner_width;
                } else {
                    inner_width = l.wallW / 2 + l.inn;
                    outer_width = inner_width;
                }
            }

            inner_widths.push(inner_width);
            outer_widths.push(outer_width);
        }

        if (this.parts[0].isOuter || this.parts[1].isOuter || this.parts[2].isOuter) {
            var points = this.findCenterpoint(true);
            var center = points[0];
            var edges = points.slice(1, points.length)

            // LEFT
            var off1 = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[1].toSimple(),
                outer_widths[0],
                outer_widths[1]
            )

            var l = this.parts[0];

            this.obj.combine(convert3D([{
                x: edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y - Math.cos(PI - l.angle) * inner_widths[0]
            }, {
                x: center.x - off1.x,
                y: center.y + off1.y,
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            l = this.parts[1];

            this.obj.combine(convert3D([{
                x: edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                y: edges[1].y - Math.cos(PI - l.angle) * inner_widths[1]
            }, {
                x: center.x - off1.x,
                y: center.y + off1.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            // RIGHT
            var off2 = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[0],
                outer_widths[2]
            )

            var l = this.parts[0];

            this.obj.combine(convert3D([{
                x: edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y + Math.cos(PI - l.angle) * inner_widths[0]
            }, {
                x: center.x - off2.x,
                y: center.y - off2.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            l = this.parts[2];

            this.obj.combine(convert3D([{
                x: edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                y: edges[2].y - Math.cos(PI - l.angle) * inner_widths[2]
            }, {
                x: center.x - off2.x,
                y: center.y - off2.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            //TOP
            var off3 = this.calculateWidthIntersectOffset(
                this.parts[1].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[1],
                outer_widths[2]
            )

            var l = this.parts[1];

            this.obj.combine(convert3D([{
                x: edges[1].x + Math.sin(PI - l.angle) * outer_widths[1],
                y: edges[1].y + Math.cos(PI - l.angle) * outer_widths[1]
            }, {
                x: center.x - off3.x,
                y: center.y - off3.y
            }], l.aMass * (l.z_profile_a ? -1 : 1), this.col3D, "white"));

            l = this.parts[2];

            this.obj.combine(convert3D([{
                x: edges[2].x + Math.sin(PI - l.angle) * outer_widths[2],
                y: edges[2].y + Math.cos(PI - l.angle) * outer_widths[2]
            }, {
                x: center.x - off3.x,
                y: center.y - off3.y
            }], l.aMass * (l.z_profile_a ? -1 : 1), this.col3D, "white"));

            //BACK
            l = this.parts[2];

            this.obj.combine(drawShape([{
                    x: edges[2].x + Math.sin(PI - l.angle) * outer_widths[2],
                    y: edges[2].y + Math.cos(PI - l.angle) * outer_widths[2]
                }, {
                    x: center.x - off3.x,
                    y: center.y - off3.y
                }, {
                    x: center.x - off2.x,
                    y: center.y - off2.y
                },
                {
                    x: edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                    y: edges[2].y - Math.cos(PI - l.angle) * inner_widths[2]
                }
            ], this.col3D, "white"))

            l = this.parts[1];

            this.obj.combine(drawShape([{
                    x: edges[1].x + Math.sin(PI - l.angle) * outer_widths[1],
                    y: edges[1].y + Math.cos(PI - l.angle) * outer_widths[1]
                }, {
                    x: center.x - off3.x,
                    y: center.y - off3.y
                }, {
                    x: center.x - off1.x,
                    y: center.y + off1.y,
                },
                {
                    x: edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                    y: edges[1].y - Math.cos(PI - l.angle) * inner_widths[1]
                }
            ], this.col3D, "white"))

            l = this.parts[0];

            this.obj.combine(drawShape([{
                x: edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y + Math.cos(PI - l.angle) * inner_widths[0]
            }, {
                x: center.x - off2.x,
                y: center.y - off2.y
            }, {
                x: center.x - off1.x,
                y: center.y + off1.y,
            }, {
                x: edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y - Math.cos(PI - l.angle) * inner_widths[0]
            }], this.col3D, "white"))

            this.obj.combine(drawShape([{
                x: center.x - off3.x,
                y: center.y - off3.y
            }, {
                x: center.x - off2.x,
                y: center.y - off2.y
            }, {
                x: center.x - off1.x,
                y: center.y + off1.y,
            }], this.col3D, "white"))
        } else {
            var points = this.findCenterpoint(true);
            var center = points[0];
            var edges = points.slice(1, points.length)
            var a = this.xyAngle > this.zxAngle ? -1 : 1;

            // Side 1
            var off1 = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[0],
                outer_widths[2]
            )

            var l = this.parts[0];

            this.obj.combine(convert3D([{
                x: edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y + Math.cos(PI - l.angle) * inner_widths[0]
            }, {
                x: center.x - off1.x,
                y: center.y - off1.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            l = this.parts[2];

            this.obj.combine(convert3D([{
                x: edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                y: edges[2].y - Math.cos(PI - l.angle) * inner_widths[2]
            }, {
                x: center.x - off1.x,
                y: center.y - off1.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            // Side 2
            var off2 = this.calculateWidthIntersectOffset(
                this.parts[0].toSimple(),
                this.parts[1].toSimple(),
                outer_widths[0],
                outer_widths[1]
            )

            var l = this.parts[0];

            this.obj.combine(convert3D([{
                x: edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y - Math.cos(PI - l.angle) * inner_widths[0]
            }, {
                x: center.x + off2.x,
                y: center.y + off2.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            this.obj.combine(drawShape([{
                x: edges[0].x - Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y - Math.cos(PI - l.angle) * inner_widths[0]
            }, {
                x: center.x + off2.x,
                y: center.y + off2.y
            }, {
                x: center.x - off1.x,
                y: center.y - off1.y
            }, {
                x: edges[0].x + Math.sin(PI - l.angle) * inner_widths[0],
                y: edges[0].y + Math.cos(PI - l.angle) * inner_widths[0]
            }], this.col3D, "white"))

            l = this.parts[1];

            this.obj.combine(convert3D([{
                x: edges[1].x + Math.sin(PI - l.angle) * inner_widths[1],
                y: edges[1].y + Math.cos(PI - l.angle) * inner_widths[1]
            }, {
                x: center.x + off2.x,
                y: center.y + off2.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))


            //Side 3
            var off3 = this.calculateWidthIntersectOffset(
                this.parts[1].toSimple(),
                this.parts[2].toSimple(),
                outer_widths[1],
                outer_widths[2]
            )

            var l = this.parts[1];

            this.obj.combine(convert3D([{
                x: edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                y: edges[1].y - Math.cos(PI - l.angle) * inner_widths[1]
            }, {
                x: center.x + off3.x,
                y: center.y + off3.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            this.obj.combine(drawShape([{
                x: edges[1].x - Math.sin(PI - l.angle) * inner_widths[1],
                y: edges[1].y - Math.cos(PI - l.angle) * inner_widths[1]
            }, {
                x: center.x + off3.x,
                y: center.y + off3.y
            }, {
                x: center.x + off2.x,
                y: center.y + off2.y
            }, {
                x: edges[1].x + Math.sin(PI - l.angle) * inner_widths[1],
                y: edges[1].y + Math.cos(PI - l.angle) * inner_widths[1]
            }], this.col3D, "white"))

            l = this.parts[2];

            this.obj.combine(convert3D([{
                x: edges[2].x + Math.sin(PI - l.angle) * inner_widths[2],
                y: edges[2].y + Math.cos(PI - l.angle) * inner_widths[2]
            }, {
                x: center.x + off3.x,
                y: center.y + off3.y
            }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"))

            this.obj.combine(drawShape([{
                x: edges[2].x + Math.sin(PI - l.angle) * inner_widths[2],
                y: edges[2].y + Math.cos(PI - l.angle) * inner_widths[2]
            }, {
                x: center.x + off3.x,
                y: center.y + off3.y
            }, {
                x: center.x - off1.x,
                y: center.y - off1.y
            }, {
                x: edges[2].x - Math.sin(PI - l.angle) * inner_widths[2],
                y: edges[2].y - Math.cos(PI - l.angle) * inner_widths[2]
            }], this.col3D, "white"))

            this.obj.combine(drawShape([{
                x: center.x + off3.x,
                y: center.y + off3.y
            }, {
                x: center.x - off1.x,
                y: center.y - off1.y

            }, {
                x: center.x + off2.x,
                y: center.y + off2.y
            }], this.col3D, "white"))
        }
    }
}

class End_Profile extends Profile {
    constructor(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D, length, boolUp = false) {
        super(FloorplanManager, wallWidths, outs, inns, aMasses, zProfilesA, zProfilesC, cMasses, col3D)

        this.type = "End";

        this.length = round(length, 5);
        this.up = boolUp;
        this.upLength = this.parent.defaultUpLength;

        this.c = "orange";
    }

    setParent(p) {
        this.parent = p;
    }

    drawInner() {
        var l = this.parts[0]
        stroke("gray")

        // DETERMINE THE WIDTHS
        var inner_width, outer_width;
        if (l.isOuter) {
            if (l.nextTo) {
                inner_width = l.wallW + l.inn;
                outer_width = 0;
            } else if (l.between) {
                inner_width = l.wallW + l.inn - l.out;
                outer_width = 0;
            } else {
                inner_width = l.wallW + l.inn;
                outer_width = l.out;
            }
        } else {
            if (l.nextTo) {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            } else if (l.between) {
                inner_width = l.wallW / 2 + l.inn - l.out;
                outer_width = inner_width;
            } else {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            }
        }

        // INNER SIDE
        line(
            l.points[0].x - Math.sin(PI - l.angle) * inner_width,
            l.points[0].y - Math.cos(PI - l.angle) * inner_width,
            l.points[1].x - Math.sin(PI - l.angle) * inner_width,
            l.points[1].y - Math.cos(PI - l.angle) * inner_width
        )

        // OUTER SIDE
        line(
            l.points[0].x + Math.sin(PI - l.angle) * outer_width,
            l.points[0].y + Math.cos(PI - l.angle) * outer_width,
            l.points[1].x + Math.sin(PI - l.angle) * outer_width,
            l.points[1].y + Math.cos(PI - l.angle) * outer_width
        )

        // END CAP
        if (this.isFirst || !l.isOuter) {
            line(
                l.points[0].x + Math.sin(PI - l.angle) * outer_width,
                l.points[0].y + Math.cos(PI - l.angle) * outer_width,
                l.points[0].x - Math.sin(PI - l.angle) * inner_width,
                l.points[0].y - Math.cos(PI - l.angle) * inner_width
            )
        } else {
            line(
                l.points[1].x + Math.sin(PI - l.angle) * outer_width,
                l.points[1].y + Math.cos(PI - l.angle) * outer_width,
                l.points[1].x - Math.sin(PI - l.angle) * inner_width,
                l.points[1].y - Math.cos(PI - l.angle) * inner_width
            )
        }
    }

    draw3D() {
        this.obj = new OBJfile([], []);

        var l = this.parts[0]
        stroke(this.col3D)

        // DETERMINE THE WIDTHS
        var inner_width, outer_width;
        if (l.isOuter) {
            if (l.nextTo) {
                inner_width = l.wallW + l.inn;
                outer_width = 0;
            } else if (l.between) {
                inner_width = l.wallW + l.inn - l.out;
                outer_width = 0;
            } else {
                inner_width = l.wallW + l.inn;
                outer_width = l.out;
            }
        } else {
            if (l.nextTo) {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            } else if (l.between) {
                inner_width = l.wallW / 2 + l.inn - l.out;
                outer_width = inner_width;
            } else {
                inner_width = l.wallW / 2 + l.inn;
                outer_width = inner_width;
            }
        }

        // INNER SIDE
        this.obj.combine(convert3D([{
            x: l.points[0].x - Math.sin(PI - l.angle) * inner_width,
            y: l.points[0].y - Math.cos(PI - l.angle) * inner_width
        }, {
            x: l.points[1].x - Math.sin(PI - l.angle) * inner_width,
            y: l.points[1].y - Math.cos(PI - l.angle) * inner_width
        }], l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"));
        // OUTER SIDE
        this.obj.combine(convert3D([{
            x: l.points[0].x + Math.sin(PI - l.angle) * outer_width,
            y: l.points[0].y + Math.cos(PI - l.angle) * outer_width
        }, {
            x: l.points[1].x + Math.sin(PI - l.angle) * outer_width,
            y: l.points[1].y + Math.cos(PI - l.angle) * outer_width
        }], l.isOuter ? l.aMass * (l.z_profile_a ? -1 : 1) : l.cMass * (l.z_profile_c ? -1 : 1), this.col3D, "white"));
        // BACK SIDE
        this.obj.combine(drawShape(
            [{
                    x: l.points[0].x + Math.sin(PI - l.angle) * outer_width,
                    y: l.points[0].y + Math.cos(PI - l.angle) * outer_width
                }, {
                    x: l.points[1].x + Math.sin(PI - l.angle) * outer_width,
                    y: l.points[1].y + Math.cos(PI - l.angle) * outer_width
                },
                {
                    x: l.points[1].x - Math.sin(PI - l.angle) * inner_width,
                    y: l.points[1].y - Math.cos(PI - l.angle) * inner_width
                }, {
                    x: l.points[0].x - Math.sin(PI - l.angle) * inner_width,
                    y: l.points[0].y - Math.cos(PI - l.angle) * inner_width
                }
            ], this.col3D, "white"));

        // END CAP
        if (this.isFirst || !l.isOuter) {
            this.obj.combine(convert3D([{
                    x: l.points[0].x + Math.sin(PI - l.angle) * outer_width,
                    y: l.points[0].y + Math.cos(PI - l.angle) * outer_width
                },
                {
                    x: l.points[0].x - Math.sin(PI - l.angle) * inner_width,
                    y: l.points[0].y - Math.cos(PI - l.angle) * inner_width
                }
            ], this.parent.mainGeometry.grid.toPixels(this.upLength) * (this.up ? -1 : 1), this.col3D, "white"))
        } else {
            this.obj.combine(convert3D([{
                    x: l.points[1].x + Math.sin(PI - l.angle) * outer_width,
                    y: l.points[1].y + Math.cos(PI - l.angle) * outer_width
                },
                {
                    x: l.points[1].x - Math.sin(PI - l.angle) * inner_width,
                    y: l.points[1].y - Math.cos(PI - l.angle) * inner_width
                }
            ], this.parent.mainGeometry.grid.toPixels(this.upLength) * (this.up ? -1 : 1), this.col3D, "white"))
        }
    }
}