//WEBGL

function convert3D(path, h, fillC, outlineC) {
    var ret = new OBJfile([], []);
    for (let i = 0; i < path.length - 1; i++) {
        let x1 = path[i].x,
            x2 = path[i + 1].x,
            y1 = path[i].y,
            y2 = path[i + 1].y;

        ret.combine(drawExtrude([x1, y1], [x2, y2], -h, fillC, outlineC));
    }

    return ret;
}

function drawExtrude(start, end, length = 200, fillColor = "grey", strokeColor = "white") {
    push();
    stroke(strokeColor);
    strokeWeight(0.5);
    fill(fillColor);
    beginShape();
    vertex(...start);
    vertex(...end);
    vertex(end[0], end[1], length);
    vertex(start[0], start[1], length);
    endShape(CLOSE);
    pop();

    return new OBJfile([start, end, [end[0], end[1], -length],
        [start[0], start[1], -length]
    ], [
        [1, 2, 3, 4]
    ]);
}

function drawShape(vertices, fillColor = "grey", strokeColor = "white") {
    var vOBJ = [];
    var f = [];

    push();
    stroke(strokeColor);
    strokeWeight(0.5);
    fill(fillColor);
    beginShape();
    for (var v = 0; v < vertices.length; v++) {
        vertex(vertices[v].x, vertices[v].y);

        vOBJ.push([vertices[v].x, vertices[v].y, 0]);
        f.push(v + 1);
    }
    endShape(CLOSE);
    pop();

    return new OBJfile(vOBJ, [f]);
}

function drawAxis(unit) {

    push()
    strokeWeight(5);
    textSize(40);
    textFont(nickainley);
    // x axis
    stroke(255, 0, 0);
    line(0, 0, 0, unit, 0, 0);
    fill(255, 0, 0);
    text("X", unit + 5, 0, 0);

    // y axis
    stroke(0, 255, 0);
    line(0, 0, 0, 0, unit, 0);
    fill(0, 255, 0);
    textFont(nickainley);
    text("Y", 0, unit + 5, 0);

    /*
    if (pointMan.finished) {
        // z axis
        stroke(0, 0, 255);
        line(0, 0, 0, 0, 0, unit);
        fill(0, 0, 255);
        textFont(nickainley);
        text("Z", 0, 0, unit + 5);
    }*/
    pop()
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

class OBJfile {
    constructor(vertices, faces) {
        this.vertices = vertices;
        this.faces = faces;
        this.data = "";
    }

    combine(obj2) {
        for (var f of obj2.faces) {
            var n = [];
            for (var v of f) {
                n.push(v + this.vertices.length);
            }

            this.faces = this.faces.concat([n]);
        }
        this.vertices = this.vertices.concat(obj2.vertices);

        return this;
    }

    export (includeDownload = false) {
        this.data = "";

        for (var v of this.vertices) {
            this.data += "v " + (v[0] ? v[0] : 0) + " " + (v[1] ? v[1] : 0) + " " + (v[2] ? v[2] : 0) + "\n";
        }

        for (var f of this.faces) {
            var facedata = "";
            for (var v of f) {
                facedata += v + " ";
            }

            this.data += "f " + facedata + "\n";
        }

        if (includeDownload) {
            download("export.obj", this.data);
        }

        return (this.data)
    }
}