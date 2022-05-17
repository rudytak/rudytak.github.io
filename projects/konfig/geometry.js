//import { Canvas, jiri_round } from './index.js'
//import { decimaljiri_roundAngle, decimaljiri_roundCoordinate, lineLengthMultiplier } from "./constants.js"

function getIntersect(a, b) {
    try {
        return intersectFunctions[a.constructor.name][b.constructor.name](a, b);
    } catch (e) {
        if (!(e instanceof TypeError)) console.error(e);
        try {
            return intersectFunctions[b.constructor.name][a.constructor.name](b, a);
        } catch (e) {
            console.error(e);
        }
    }
}
const intersectFunctions = {
    JiriPoint: {
        /**
         * 
         * @param {JiriLine} line 
         * @param {JiriPoint} point
         * @returns {JiriPoint | null} 
         */
        JiriLine: (point, line) => line.x(point.y) === point.x ? point : null,
        /**
         * `
         * @param {JiriPoint} point 
         * @param {JiriPoint} point2 
         * @returns {JiriPoint | null}
         */
        JiriPoint: (point, point2) => point.x === point2.x && point.y === point2.y ? point : null,
        /**
         * 
         * @param {JiriPoint} point 
         * @param {Ray} ray 
         */
        Ray: (point, ray) => ray.x(point.y) === point.x ? point : null,
        /**
         * 
         * @param {JiriPoint} point 
         * @param {Segment} segment 
         */
        Segment: (point, segment) => segment.x(point.y) === point.x ? point : null,
        /**
         * 
         * @param {JiriPoint} point 
         * @param {Circle} circle 
         * @returns {JiriPoint | null}
         */
        Circle: (point, circle) => point.distance(circle.center) == jiri_round(circle.radius, "coordinate") ? point : null,
        /**
         * 
         * @param {JiriPoint} point 
         * @param {Polygon} polygon 
         * @returns {JiriPoint | null}
         */
        Polygon: (point, polygon) => polygon.edges.map(v => v.getIntersect(point)).filter(v => v !== null).length > 0 ? point : null,
        /**
         * 
         * @param {JiriPoint} point 
         * @param {Triangle} triangle
         * @returns {JiriPoint | null}
         */
        Triangle: (point, triangle) => intersectFunctions.JiriPoint.Polygon(point, triangle),
    },
    JiriLine: {
        /**
         * 
         * @param {JiriLine} line 
         * @param {JiriLine} line2 
         * @returns {JiriLine | JiriPoint | null}
         */
        JiriLine: (line, line2) => {
            if (line.a.x == line.b.x) {
                if (line2.a.x == line2.b.x) {
                    return line.a.intersects(line2) ? line : null;
                } else {
                    return new JiriPoint(line.a.x, line2.y(line.a.x));
                }
            }
            if (line2.a.x == line2.b.x) return new JiriPoint(line2.a.x, line.y(line2.a.x));
            var a1 = line.getLinePolynom().getLinearCoefficient();
            var b1 = line.getLinePolynom().getAbsoluteCoefficient();
            var a2 = line2.getLinePolynom().getLinearCoefficient();
            var b2 = line2.getLinePolynom().getAbsoluteCoefficient();
            if (a1 === a2) {
                if (b1 === b2) {
                    return line;
                }
                return null;
            } else {
                var x = (b2 - b1) / (a1 - a2);
                var y = a1 * x + b1;
                return new JiriPoint(x, y);
            }
        }
    },
    Segment: {
        /**
         * 
         * @param {Segment} segment 
         * @param {Segment} segment2 
         * @returns {Segment | JiriPoint | null}
         */
        Segment: (segment, segment2) => {
            var l = segment.getLine();
            var l2 = segment2.getLine();
            var i = l.getIntersect(l2);
            if (i === null) return null;
            if (i instanceof JiriPoint) return i.intersects(segemnt) && i.intersects(segment2) ? i : null;
            if (i instanceof JiriLine) {
                if (i.a.x === i.b.x) {
                    var t = [l.a, l.b, l2.a, l2.b].sort((a, b) => a.y - b.y);
                } else var t = [l.a, l.b, l2.a, l2.b].sort((a, b) => a.x - b.x);
                if (t[0].distance(t[1]) === 0) {
                    if (t[2].distance(t[3]) === 0) {
                        return segment;
                    } else {
                        return [segment, segment2].find(v => v.a.distance(t[3]) === 0 || v.b.distance(t[3]) === 0)
                    }
                }
                if (t[1].distance(t[2]) === 0) return t[1];
                if (t[1].intersects(segment) && t[2].intersects(segment) && t[1].intersects(segment2) && t[2].intersects(segment2)) {
                    if (!t[0].intersects(segment) && !t[3].intersects(segment)) return segment;
                    if (!t[0].intersects(segment2) && !t[3].intersects(segment2)) return segment2;
                    return new Segment(t[1], t[2]);
                } else return null;
            }
        },
        /**
         * 
         * @param {Segment} segment 
         * @param {JiriLine} line 
         * @returns {Segment | JiriPoint | null}
         */
        JiriLine: (segment, line) => {
            var l = segment.getLine();
            var i = l.getIntersect(line);
            if (i === null) return null;
            else {
                return i instanceof JiriLine ? segment : i;
            }
        }
    },
    Ray: {
        /**
         * 
         * @param {Ray} ray 
         * @param {Ray} ray2 
         * @returns {Ray | Segment | JiriPoint | null}
         */
        Ray: (ray, ray2) => {
            var [l, l2] = [ray, ray2].map(v => v.getLine());
            var i = l.getIntersect(l2);
            if (i === null) return null;
            else {
                if (i instanceof JiriLine) {
                    if (ray.a.distance(ray2.a) === 0 && ray.b.distance(ray2.b) === 0) return ray;
                    if (ray.intersects(ray2.a) && ray2.intersects(ray.a)) return new Segment(ray.a, ray2.a);
                    if (ray.intersects(ray2.a)) return ray2;
                    else return ray;
                } else return i;
            }
        },
        /**
         * 
         * @param {Ray} ray 
         * @param {JiriLine} line 
         * @returns {Ray | JiriPoint | null}
         */
        JiriLine: (ray, line) => {
            var l = ray.getLine();
            var i = l.getIntersect(line);
            if (i === null) return null;
            else if (i instanceof JiriLine) return ray;
            else {
                return ray.intersects(i) ? i : null
            }
        },
        /**
         * 
         * @param {Ray} ray 
         * @param {Segment} segment
         * @returns {Segment | JiriPoint | null} 
         */
        Segment: (ray, segment) => {
            var l = segment.getLine();
            var i = l.getIntersect(ray);
            if (i === null) return null;
            if (i instanceof JiriPoint) return i.intersects(segment) ? i : null;
            else {
                if (segment.a.intersects(ray)) {
                    if (segment.a.distance(ray.a) === 0) return ray.a;
                    return segment.b.intersects(ray) ? segment : new Segment(segment.a, ray.a);
                } else {
                    return segment.b.intersects(ray) ? new Segment(segment.b, ray.a) : null;
                }
            }
        }
    },
    Circle: {
        /**
         * 
         * @param {Circle} circle 
         * @param {Circle} circle2 
         * @returns {Circle | [JiriPoint, JiriPoint] | JiriPoint | null}
         */
        Circle: (circle, circle2) => {
            if (circle.center.distance(circle2.center) === 0) return jiri_round(circle.r) === jiri_round(circle2.r) ? circle : null;
            if (circle.center.distance(circle2.center) > jiri_round(circle.r + circle2.r)) return null;
            var l = new Segment(circle.center, circle2.center)
            var rRatio = circle.r / (circle.r + circle2.r);
            let dx = circle.center.x - circle2.center.x;
            if (circle.center.distance(circle2.center) === jiri_round(circle.r + circle2.r)) {
                if (l.a.x == l.b.x) {
                    var ya = Math.max(l.a.y, l.b.y) - [circle, circle2].find(c => c.center.y == Math.max(l.a.y, l.b.y)).r;
                    return new JiriPoint(l.a.x, ya);
                }
                let pdx = dx * rRatio;
                let x = circle.center.x + pdx;
                let y = l.y(x);
                return new JiriPoint(x, y);
            }
            if (circle.center.x === circle2.center.x) {
                var angle1cos = (l.length() ** 2 + circle.r ** 2 - circle2.r ** 2) / (2 * l.length() + circle2.r);
                var k = angle1cos * circle.r;
                var kRatio = k / l.length();
                var pdx = dx * kRatio;
                var x = circle.center.x + pdx;
                var y = circle.center.x;
                var p = new JiriPoint(x, y);
                var c = Math.sin(Math.acos(angle1cos)) * circle.r;
                return [new JiriPoint(y, x - c), new JiriPoint(y, x + c)];
            }
            var angle1cos = (l.length() ** 2 + circle.r ** 2 - circle2.r ** 2) / (2 * l.length() * circle2.r);
            var k = angle1cos * circle.r;
            var kRatio = k / l.length();
            var pdx = dx * kRatio;
            var x = circle.center.x - pdx;
            var y = l.getLine().y(x);
            var c = Math.sin(Math.acos(angle1cos)) * circle.r;
            var p = new JiriPoint(x, y);
            var p2 = new JiriPoint(p.x, circle.center.y);
            if (p.distance(p2) === 0) return [new JiriPoint(p.x, p.y + c), new JiriPoint(p.x, p.y - c)];
            var t = new Triangle(circle.center, p2, p);
            var angle2 = t.getGamma();
            var angle3 = Math.PI / 2 - angle2;
            var dy = -Math.cos(angle3) * c;
            dx = Math.sin(angle3) * c;
            return [new JiriPoint(p.x + dx, p.y + dy), new JiriPoint(p.x - dx, p.y - dy)];
        },
        /**
         * 
         * @param {Circle} circle 
         * @param {JiriLine} line 
         * @returns {[JiriPoint, JiriPoint] | JiriPoint | null}
         */
        JiriLine: (circle, line) => {
            if (jiri_round(circle.center.distance(line)) > jiri_round(circle.r)) return null;
            if (jiri_round(circle.center.distance(line)) === jiri_round(circle.r)) {
                let l = line.getPerpendicular(circle.center);
                return l.getIntersect(line);
            }
            var h = line.getPerpendicular(circle.center);
            var d = line.distance(circle.center);
            var l = Math.pow(circle.r ** 2 - d * d, 1 / 2);
            if (line.intersects(circle.center)) {
                if (line.a.x === line.b.x) {
                    return [new JiriPoint(circle.center.x, circle.center.y - circle.r), new JiriPoint(circle.center.x, circle.center.y + circle.r)];
                }
                let s = new Segment(line.a, line.b);
                let angle = Math.acos((s.b.x - s.a.x) / s.length());
                let dx = Math.cos(angle) * l;
                let dy = Math.sin(angle) * l;
                let p = new JiriPoint(circle.center.x + dx, circle.center.y + dy);
                if (!p.intersects(line)) p = new JiriPoint(circle.center.x + dx, circle.center.y - dy);
                return [p, p.reflectAbout(circle.center)];
            }
            var c = new Circle(line.getIntersect(h), l);
            return c.getIntersect(line);
        },
        /**
         * 
         * @param {Circle} circle 
         * @param {Ray} ray 
         * @returns {[JiriPoint, JiriPoint] | JiriPoint | null}
         */
        Ray: (circle, ray) => {
            var l = ray.getLine();
            var is = l.getIntersect(circle);
            if (is === null) return null;
            if (is instanceof JiriPoint) return is.intersects(ray) ? is : null;
            if (is instanceof Array) {
                var a = is.filter(i => i.intersects(ray));
                if (a.length === 0) return null;
                if (a.length === 1) return a[1];
                return a;
            }
        },
        /**
         *  
         * @param {Circle} circle 
         * @param {Segment} segment 
         * @returns {[JiriPoint, JiriPoint], Point, null}
         */
        Segment: (circle, segment) => {
            var l = segment.getLine();
            var is = l.getIntersect(circle);
            if (is === null) return null;
            if (is instanceof JiriPoint) return is.intersects(segment) ? is : null;
            if (is instanceof Array) {
                var a = is.filter(i => i.intersects(segment));
                if (a.length === 0) return null;
                if (a.length === 1) return a[1];
                return a;
            }
        }
    },
    Polygon: {
        /**
         * 
         * @param {Polygon} polygon 
         * @param {JiriLine} line 
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        JiriLine: (polygon, line) => {
            /**
             * @type {Array<Segment | JiriPoint | null>}
             */
            var c = [];
            for (var e of polygon.edges) {
                c.push(e.getIntersect(line));
            }
            c = c.flat(3);
            //Removes points that lay on segments, that intersect and nulls
            c = c.filter((v, i, a) => {
                if (v === null) return false;
                if (v instanceof JiriPoint) {
                    for (var e of a) {
                        if (!(e instanceof JiriPoint)) continue;
                        if (e.intersects(v)) return false;
                    }
                }
                return true;
            });
            //Removes duplicate points
            for (var i = 0; i < c.length; i++) {
                var v = c[i];
                if (!(v instanceof JiriPoint)) continue;
                if (c.filter(a => a instanceof JiriPoint && a.distance(v) === 0)) {
                    c.splice(i, 1);
                }
            }
            //Join segments if possible
            for (var i = 0; i < c.length; i++) {
                var v = c[i];
                if (v instanceof JiriPoint) continue;
                var u = [];
                for (var a of c) {
                    if (a instanceof JiriPoint || a === v) continue;
                    if (!a.intersects(v)) continue;
                    u.push(v.join(a));
                }
            }
            c.push(...u);

            //Removes extra segments
            for (var i = 0; i < c.length; i++) {
                var v = c[i];
                if (v instanceof JiriPoint) continue;
                for (var a of c) {
                    if (a instanceof JiriPoint) continue;
                    if (!a.getIntersect(v) === v) c.splice(i, 1);
                }
            }
            if (c.length === 0) return null;
            if (c.length === 1) return c[0];
            return c;
        },
        /**
         * 
         * @param {Polygon} polygon 
         * @param {Ray} ray 
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Ray: (polygon, ray) => {
            var l = ray.getLine();
            var i = l.getIntersect(polygon);
            if (i === null) return null;
            if (i instanceof Segment || i instanceof JiriPoint) return i.getIntersect(ray);
            if (i instanceof Array) return i.map(v => v.getIntersect(ray)).filter(v => v !== null);
        },
        /**
         * 
         * @param {Polygon} polygon 
         * @param {Segment} segment 
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Segment: (polygon, segment) => {
            var l = segment.getLine();
            var i = l.getIntersect(polygon);
            if (i === null) return null;
            if (i instanceof Segment || i instanceof JiriPoint) return i.getIntersect(segment);
            if (i instanceof Array) return i.map(v => v.getIntersect(segment)).filter(v => v !== null);
        },
        /**
         * 
         * @param {Polygon} polygon 
         * @param {Circle} circle 
         * @returns {Array<JiriPoint> | JiriPoint | null}
         */
        Circle: (polygon, circle) => {
            var ps = polygon.vertices.map(v => v.getIntersect(circle)).filter(v => v !== null).flat(3);
            //Removes duplicates
            for (var i = 0; i < ps.length; i++) {
                for (var a of ps) {
                    if (a.distance(ps[i]) === 0) ps.splice(i, 1);
                }
            }
            if (ps.length === 0) return null;
            if (ps.length === 1) return ps[0];
            return ps;
        },
        /**
         * 
         * @param {Polygon} polygon 
         * @param {Polygon} polygon2 
         * @returns {Polygon | Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Polygon: (polygon, polygon2) => {
            if (polygon === polygon2) return polygon;
            /**
             * @type {Array<Segment | JiriPoint | null>}
             */
            var c = [];
            for (var e of polygon2.edges) {
                c.push(e.getIntersect(polygon));
            }
            c = c.flat(3);
            //Removes points that lay on segments, that intersect and nulls
            c = c.filter((v, i, a) => {
                if (v === null) return false;
                if (v instanceof JiriPoint) {
                    for (var e of a) {
                        if (!(e instanceof JiriPoint)) continue;
                        if (e.intersects(v)) return false;
                    }
                }
                return true;
            });
            //Removes duplicate points
            for (var i = 0; i < c.length; i++) {
                var v = c[i];
                if (!(v instanceof JiriPoint)) continue;
                if (c.filter(a => a instanceof JiriPoint && a.distance(v) === 0)) {
                    c.splice(i, 1);
                }
            }
            //Join segments if possible
            for (var i = 0; i < c.length; i++) {
                var v = c[i];
                if (v instanceof JiriPoint) continue;
                for (var a of c) {
                    if (a instanceof JiriPoint) continue;
                    var g = a.getIntersect(v);
                    if (g === null) continue;
                    if (g instanceof Segment) c.push(v.join(a));
                    if (g instanceof JiriPoint) {
                        if ([v.a, v.b, a.a, a.b].filter(j => j.intersects(v)).length === 4) c.push(v.join(a));
                    }
                }
            }
            //Removes extra segments
            for (var i = 0; i < c.length; i++) {
                var v = c[i];
                if (v instanceof JiriPoint) continue;
                for (var a of c) {
                    if (a instanceof JiriPoint) continue;
                    if (!a.getIntersect(v) === v) c.splice(i, 1);
                }
            }
            if (c.length === 0) return null;
            if (c.length === 1) return c[0];
            return c;
        }
    },
    Triangle: {
        /**
         * 
         * @param {Triangle} triangle 
         * @param {Triangle} trinagle2 
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Triangle: (triangle, trinagle2) => intersectFunctions.Polygon.Polygon(triangle, trinagle2),
        /**
         * 
         * @param {Triangle} triangle 
         * @param {Circle} circle
         * @returns {Array<JiriPoint> | JiriPoint | null}
         */
        Circle: (triangle, circle) => intersectFunctions.Polygon.Circle(triangle, circle),
        /**
         * 
         * @param {Triangle} triangle 
         * @param {Polygon} polygon 
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Polygon: (triangle, polygon) => intersectFunctions.Polygon.Polygon(triangle, polygon),
        /**
         * 
         * @param {Triangle} triangle 
         * @param {JiriLine} line 
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        JiriLine: (triangle, line) => intersectFunctions.Polygon.JiriLine(triangle, line),
        /**
         * 
         * @param {Triangle} triangle 
         * @param {Ray} ray
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Ray: (triangle, ray) => intersectFunctions.Polygon.Ray(triangle, ray),
        /**
         * 
         * @param {Triangle} triangle 
         * @param {Segment} segment
         * @returns {Array<Segment | JiriPoint> | Segment | JiriPoint | null}
         */
        Segment: (triangle, segment) => intersectFunctions.Polygon.Segment(triangle, segment),
    }
}



//! Base
/**
 * @description Class representing datatypes of the geometry canvasio library
 * @abstract
 */
class Base {
    constructor() {

        }
        /**
         * @description The default intersect function. May be overriden by extending classes.
         * @param {Base} object Object to calculate the intersect with
         * @returns {Base | Array<Base> | null} 
         */
    getIntersect(object) {
            try {
                return getIntersect(this, object);
            } catch (err) {
                throw new Error("Intersect for these two objects has not been yet defined. If you belive this is a mistake, please report this on the offical GitHub page. Objects: " + this + " and " + object);
            }
        }
        /**
         * @description Checks if the objects intersect. May be overriden by extending classes.
         * @param {Base} object 
         * @returns {Boolean}
         */
    intersects(object) {
        return this.getIntersect(object) !== null;
    }
}



//! Polygon
/**
 * @description Class representing any polygon
 * @extends {Base}
 */
class Polygon extends Base {
    /**
     * 
     * @param {Array<JiriPoint>} points 
     */
    constructor(points) {
            for (var p of points) {
                if (!(p instanceof JiriPoint)) throw new TypeError("All vericies of a polygon must be Points.");
            }
            super();
            /**
             * @description Vertices of this polygon
             * @type {Array<JiriPoint>} 
             */
            this.vertices = points;
            /**
             * @description Edges of this polygon
             * @type {Array<Segment>}
             */
            this.edges = this.vertices.map((v, i, a) => {
                if (i === 0) i = a.length;
                return new Segment(v, a[i - 1]);
            });
        }
        /**
         * @description Returns the string representation of this object
         * @returns {String}
         */
    toString() {
            return `Polygon: (${this.vertices.join(", ")}})`;
        }
        /**
         * 
         * @param {number} vertices 
         * @param {JiriPoint} center 
         * @param {number} radius 
         * @param {number} angle 
         */
    static createRegular(vertices, center, radius, angle = 0) {
        var angleIncrement = Math.PI * 2 / vertices;
        var vects = [];
        for (var i = 0; i < vertices; i++) {
            vects.push(Vector.fromPolar(angle + i * angleIncrement, radius));
        }
        return new this(vects.map(v => new JiriPoint(v[0] + center.x, v[1] + center.y)));
    }
}



//! Line
/**
 * @description Class representing a line
 */
class JiriLine extends Base {
    /**
     * 
     * @param {JiriPoint} point1 
     * @param {JiriPoint} point2 
     */
    constructor(point1, point2) {
            if (!(point1 instanceof JiriPoint)) throw new TypeError("The point1 argument must be a type of Point.");
            if (!(point2 instanceof JiriPoint)) throw new TypeError("The point2 argument must be a type of Point.");
            if (point1.distance(point2) === 0) throw new Error("Need two different points to construct a line.");
            super();
            /**
             * @description The first point of the line
             * @type {JiriPoint}
             */
            this.a = [point1, point2].find(p => p.x === Math.min(point1.x, point2.x));
            /**
             * @description The second point of the line
             * @type {JiriPoint}
             */
            this.b = [point1, point2].find(p => p.distance(this.a) > 0);
        }
        /**
         * @description Returns the y value for a point with given x that lays on this line
         * @param {Number} x The x coordinate
         * @returns {Number} y
         */
    y(x) {
            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return jiri_round(a * x + b, "coordinate");
        }
        /**
         * @description Returns the x value for a point with given y that lays on this line
         * @param {Number} y The y coordinate
         * @returns {Number} x
         */
    x(y) {
            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return jiri_round((y - b) / a, "coordinate");
        }
        /**
         * @description Returns a polynom of this line
         * @returns {Polynom} 
         */
    getLinePolynom() {
            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return new Polynom(a, b);
        }
        /**
         * @description Returns the string representation of this point in the form Line: ([x1, y1], [x2, y2])
         * @returns {String}
         */
    toString() {
            return `Line: (${this.a}, ${this.b})`;
        }
        /**
         * @description Returns a perpendicular line going thru the point
         * @param {JiriPoint} point The point
         * @returns {JiriLine}
         */
    getPerpendicular(point) {
            if (!point.intersects(this)) {
                var pline = this.getParallel(point);
                return pline.getPerpendicular(point);
            }
            var angle = Math.atan((this.a.x - this.b.x) / (this.a.y - this.b.y));
            var x = -Math.cos(angle);
            var y = Math.sin(angle);
            return new JiriLine(point, new JiriPoint(x + point.x, y + point.y));
        }
        /**
         * @description Returns a parallel line going thru the point
         * @param {JiriPoint} point The point
         * @returns {JiriLine}
         */
    getParallel(point) {
            if (this.intersects(point)) return this;
            var l = new JiriLine(point, new JiriPoint(point.x, point.y - 1));
            var p = l.getIntersect(this);
            if (p === null) return l;
            var p2 = new JiriPoint(p.x - 1, this.y(p.x - 1));
            return new JiriLine(point, new JiriPoint(p2.x, p2.y + point.y - p.y));
        }
        /**
         * @description Returns the distance between this line and the given point
         * @param {JiriPoint} point
         * @returns {Number}
         */
    distance(point) {
        return point.distance(this);
    }
}



//! Point 
/**
 * @description Class representing a point
 */
class JiriPoint extends Base {
    /**
     * 
     * @param {Number} x The x coordinate of the point
     * @param {Number} y The y coordinate of the point
     */
    constructor(x, y) {
            if (typeof x !== 'number') throw new TypeError("The x coordinate of a point must be a number.");
            if (typeof y !== 'number') throw new TypeError("The y coordinate of a point must be a number.");
            super();
            /**
             * @type {Number}
             * @description The x coordinate of the point.
             */
            this.x = jiri_round(x, "coordinate");
            /**
             * @type {Number}
             * @description The y coordinate of the point.
             */
            this.y = jiri_round(y, "coordinate");
        }
        /**
         * @description Returns the absolute value of point (aka. distance from [0, 0])
         * @returns {Number}
         */
    absolute() {
            return Math.pow(this.x * this.x + this.y * this.y, 1 / 2);
        }
        /**
         * @description Returns the string representation of this point in the form [x, y]
         * @returns {String}
         */
    toString() {
            return `[${this.x}, ${this.y}]`;
        }
        /**
         * @description Returns the array representation of the point 
         * @returns {Array<Number>}
         */
    toArray() {
            return [this.x, this.y];
        }
        /**
         * @description Returns the distance between this and the object provided
         * @param {JiriPoint | JiriLine} object The object provided
         * @returns {Number} The distance
         */
    distance(object) {
            if (object instanceof JiriPoint) return jiri_round(Math.pow(Math.pow(this.x - object.x, 2) + Math.pow(this.y - object.y, 2), 1 / 2), "coordinate");
            if (object instanceof JiriLine) {
                var l = object.getPerpendicular(this);
                var p = l.getIntersect(object);
                if (p instanceof JiriLine) return 0;
                return this.distance(p);
            }
            throw new TypeError("The point argument must be a Point.");
        }
        /**
         * @description Reflects the point about an object
         * @param {JiriLine | JiriPoint} object
         * @returns {JiriPoint}
         */
    reflectAbout(object) {
            if (object instanceof JiriPoint) {
                var dx = object.x - this.x;
                var dy = object.y - this.y;
                return new JiriPoint(object.x + dx, object.y + dy);
            }
            if (object instanceof JiriLine) {
                var perpendicular = object.getPerpendicular(this);
                var i = perpendicular.getIntersect(object);
                return this.reflectAbout(i);
            }
            throw new TypeError("Cannot reflect about this object.");
        }
        /**
         * @description Creates a point object form the string representation of it in the form [x, y];
         * @param {String} string 
         * @returns {JiriPoint}
         */
    static fromString(string) {
            var a = string.split("[").pop().split("]")[0].split(", ");
            return new JiriPoint(a[0], a[1]);
        }
        /**
         * @param {Vector} vector
         */
    static fromVector(vector) {
        if (vector.length != 2) throw new Error("Can only create a point from a 2D vector.");
        return new this(vector[0], vector[1]);
    }
}



//! Polynom
/**
 * @description Class representing a polynom
 */
class Polynom {
    /**
     * @param  {...Number} coefficients The coefficents of this polynom in the usual oreder 
     * @example new Polynom(1, 0, 0); //Creates the x^2 polynom
     */
    constructor(...coefficients) {
            for (var coefficient of coefficients) {
                if (typeof coefficient !== 'number') throw new TypeError("All coefficients of a polynom must be numbers.");
            }
            /**
             * @type {Number}
             * @description The degree of the polynom
             */
            this.degree = coefficients.length;
            /**
             * @type {Array<Number>}
             * @description The 
             */
            this.coefficients = coefficients.map((v, i, a) => a[a.length - 1 - i]);
        }
        /**
         * @description Returns the value of the polynom at the given point.
         * @param {Number} x The point at which the value should be returned.
         * @returns {Number} 
         * @example var p = new Polynom(1, 0, 0);
         * p.valueAt(2); // returns 4
         */
    valueAt(x) {
            return this.coefficients.map((v, i) => v * Math.pow(x, i)).reduce((a, b) => a + b);
        }
        /**
         * @description Gets the absolute coefficient of this polynom
         * @returns {Number}
         */
    getAbsoluteCoefficient() {
            return this.coefficients[0];
        }
        /**
         * @description Gets the linear coefficient of this polynom
         * @returns {Number}
         */
    getLinearCoefficient() {
            return this.coefficients[1];
        }
        /**
         * @description Gets the quadratic coefficient of this polynom
         * @returns {Number}
         */
    getQuadraticCoefficient() {
            return this.coefficients[2];
        }
        /**
         * @description Gets the cubic coefficient of this polynom
         * @returns {Number}
         */
    getCubicCoefficient() {
        return this.coefficients[3];
    }
}



//! Ray
/**
 * @description Class representing a ray
 */
class Ray extends Base {
    /**
     * 
     * @param {JiriPoint} endPoint Point, at witch the ray ends
     * @param {JiriPoint} point2 Point describing the rays direction
     */
    constructor(endPoint, point2) {
            if (!(endPoint instanceof JiriPoint)) throw new TypeError("The endPoint argument must be a type of Point.");
            if (!(point2 instanceof JiriPoint)) throw new TypeError("The point2 argument must be a type of Point.");
            super();
            /**
             * @description The first point of the line
             * @type {JiriPoint}
             */
            this.a = endPoint;
            /**
             * @description The second point of the line
             * @type {JiriPoint}
             */
            this.b = point2;
        }
        /**
         * @description Returns the y value for a point with given x that lays on this ray
         * @param {Number} x The x coordinate
         * @returns {Number | undefined} y
         */
    y(x) {
            if (this.a.x < this.b.x) {
                if (this.a.x > x) return undefined
            } else {
                if (this.a.x < x) return undefined;
            }

            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return jiri_round(a * x + b, "coordinate");
        }
        /**
         * @description Returns the x value for a point with given y that lays on this ray
         * @param {Number} y The y coordinate
         * @returns {Number | undefined} x
         */
    x(y) {
            if (this.a.y < this.b.y)
                if (this.a.y > y) return undefined;
                else;
            if (this.a.y < y) return undefined;
            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return jiri_round((y - b) / a, "coordinate");
        }
        /**
         * @description Returns this ray extended to a line
         * @returns {JiriLine}
         */
    getLine() {
            return new JiriLine(this.a, this.b);
        }
        /**
         * @description Returns the string representation of this point in the form Ray: ([x1, y1], [x2, y2])
         * @returns {String}
         */
    toString() {
        return `Ray: (${this.a}, ${this.b})`;
    }
}



//! Segment
/**
 * @description Class representing a segment
 */
class Segment extends Base {
    /**
     * 
     * @param {JiriPoint} point1 
     * @param {JiriPoint} point2 
     */
    constructor(point1, point2) {
            if (!(point1 instanceof JiriPoint)) throw new TypeError("The point1 argument must be a type of Point.");
            if (!(point2 instanceof JiriPoint)) throw new TypeError("The point2 argument must be a type of Point.");
            if (point1.distance(point2) === 0) throw new Error("Need two different points to construct a segment.")
            super();
            /**
             * @description The first point of the segment
             * @type {JiriPoint}
             */
            this.a = [point1, point2].find(p => p.x === Math.min(point1.x, point2.x));
            /**
             * @description The second point of the segment
             * @type {JiriPoint}
             */
            this.b = [point1, point2].find(p => p.x === Math.max(point1.x, point2.x));
        }
        /**
         * @description Returns the y value for a point with given x that lays on this segment
         * @param {Number} x The x coordinate
         * @returns {Number | null} y
         */
    y(x) {
            if (x < this.a.x || x > this.b.x) return null;
            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return jiri_round(a * x + b, "coordinate");
        }
        /**
         * @description Returns the x value for a point with given y that lays on this segment
         * @param {Number} y The y coordinate
         * @returns {Number | null} x
         */
    x(y) {
            if (this.a.y < this.b.y)
                if (y < this.a.y || y > this.b.y) return null;
                else;
            if (y > this.a.y || y < this.b.y) return null;
            var b = (this.b.y * this.a.x - this.a.y * this.b.x) / (this.a.x - this.b.x);
            var a = (this.b.y - this.a.y) / (this.b.x - this.a.x);
            return jiri_round((y - b) / a, "coordinate");
        }
        /**
         * @description Returns the string representation of this point in the form Segment: ([x1, y1], [x2, y2])
         * @returns {String}
         */
    toString() {
            return `Segment: (${this.a}, ${this.b})`;
        }
        /**
         * @description Returns this segment extended to a line
         * @returns {JiriLine}
         */
    getLine() {
            return new JiriLine(this.a, this.b);
        }
        /**
         * @description Returns the length of the segment
         * @returns {Number}
         */
    length() {
            return this.a.distance(this.b);
        }
        /**
         * @description Join two segments
         * @param {Segment} segment 
         * @returns {Segment}
         */
    join(segment) {
        if (!(segment instanceof Segment)) throw new TypeError("The segemnt argument must be a Segment.");
        var i = this.getIntersect(segment);
        if (i === null) throw new Error("Cannot join segments that do not intersect.");
        if (i instanceof JiriPoint) {
            if (!(this.getLine().getIntersect(this) instanceof Segment)) throw new Error("Cannot join segments that do not lay on one line.");
            var a = [this.a, this.b].find(v => v.distance(i) > 0);
            var b = [segment.a, segment.b].find(v => v.distance(i) > 0);
            return new Segment(a, b);
        }
        if (i instanceof Segment) {
            var a = [this.a, this.b].find(v => !v.intersects(i));
            var b = [segment.a, segment.b].find(v => !v.intersects(i));
            if (a.distance(b) === 0) return segment;
            return new Segment(a, b);
        }
    }
}



//! Circle
/**
 * @description Class representing a circle
 */
class Circle extends Base {
    /**
     * @param {JiriPoint} center Center of the circle
     * @param {Number} radius Radius of the circle
     */
    constructor(center, radius) {
            if (typeof radius !== 'number') throw new TypeError("Radius must be a number.");
            if (!(center instanceof JiriPoint)) throw new TypeError("Center must be a Point.");
            super();
            /**
             * @description Radius of the circle
             * @type {Number} 
             */
            this.r = radius;
            /**
             * @description Center of the circle
             * @type {JiriPoint}
             */
            this.center = center;
        }
        /**
         * @description Returns the circumference of the circe 
         * @returns {Number}
         */
    length() {
            return Math.PI * 2 * this.r;
        }
        /**
         * @description Returns the string representation of this circle
         * @returns {String}
         */
    toString() {
        return `Circle(${this.r}, ${this.center})`;
    }
}



//! Triangle
/**
 * @description Class representing a triangle
 * @extends {Polygon}
 */
class Triangle extends Polygon {
    /**
     * 
     * @param {JiriPoint} a The A point of the triangle
     * @param {JiriPoint} b The B point of the triangle
     * @param {JiriPoint} c The C point of the triangle
     */
    constructor(a, b, c) {
            if (!(a instanceof JiriPoint)) throw new TypeError("The a argument must be a type of Point.");
            if (!(b instanceof JiriPoint)) throw new TypeError("The b argument must be a type of Point.");
            if (!(c instanceof JiriPoint)) throw new TypeError("The c argument must be a type of Point.");
            if (new JiriLine(a, b).intersects(c)) throw new Error("Cannot construct a triangle from three points that lay on the same line.");
            if (a.distance(b) === 0 || a.distance(c) === 0 || c.distance(b) === 0) throw new Error("Points on a triangle cannot match.");
            super([a, b, c]);
            /**
             * @description One vertex of the triangle
             * @type {JiriPoint}
             */
            this.A = a;
            /**
             * @description One vertex of the triangle
             * @type {JiriPoint}
             */
            this.B = b;
            /**
             * @description One vertex of the triangle
             * @type {JiriPoint}
             */
            this.C = c;
            /**
             * @description One edge of the triangle
             * @type {Segment}
             */
            this.c = this.edges[1];
            /**
             * @description One edge of the triangle
             * @type {Segment}
             */
            this.b = this.edges[0];
            /**
             * @description One edge of the triangle
             * @type {Segment}
             */
            this.a = this.edges[2];
        }
        /**
         * @description Returns the value of the angle α
         * @returns {Number}
         */
    getAlpha() {
            var a = this.a.length();
            var b = this.b.length();
            var c = this.c.length();
            return Math.acos((b * b + c * c - a * a) / (2 * b * c));
        }
        /**
         * @description Returns the value of the angle β
         * @returns {Number}
         */
    getBeta() {
            var a = this.a.length();
            var b = this.b.length();
            var c = this.c.length();
            return Math.acos((a * a + c * c - b * b) / (2 * a * c));
        }
        /**
         * @description Returns the value of the angle γ
         * @returns {Number}
         */
    getGamma() {
            var a = this.a.length();
            var b = this.b.length();
            var c = this.c.length();
            return Math.acos((a * a + b * b - c * c) / (2 * a * b));
        }
        /**
         * @description Returns the string representation of this object
         * @returns {String}
         */
    toString() {
        return `Triangle: (${this.vertices.join(", ")}})`;
    }
}




//! Draw
/**
 * @description Class that manages drawing Geometry object to canvas.
 */
class Drawer {
    /**
     * 
     * @param {Canvas} canvas 
     */
    constructor(canvas) {
            /**
             * @description The canvas this drawer draws to
             * @type {Canvas}
             */
            this.canvas = canvas;
        }
        /**
         * @description Draws an object
         * @param {JiriPoint | JiriLine | Ray | Segment | Circle | Triangle} object 
         * @returns {void}
         */
    draw(object) {
            if (object instanceof JiriPoint) return this.drawPoint(object);
            if (object instanceof JiriLine) return this.drawLine(object);
            if (object instanceof Ray) return this.drawRay(object);
            if (object instanceof Segment) return this.drawSegment(object);
            if (object instanceof Circle) return this.drawCircle(object);
            if (object instanceof Polygon || object instanceof Triangle) return this.drawPolygon(object);
            throw new TypeError("Cannot draw this object. If you believe this is not correct, please report this on the offical GitHub page. Object:" + (object && object.constructor ? object.constructor.name : object));
        }
        /**
         * @description Draws a Point on to the canvas
         * @param {JiriPoint} point
         * @returns {void}
         * 
         */
    drawPoint(point) {
            if (!(point instanceof JiriPoint)) throw new TypeError("The point argument must be a type of Point.")
            var d = this.canvas.context.lineWidth;
            this.canvas.context.beginPath();
            this.canvas.context.arc(point.x, point.y, d * 2, 0, Math.PI * 2);
            this.canvas.context.closePath();
            this.canvas.context.fill();
        }
        /**
         * @description Draws a Line on to the canvas
         * @param {JiriLine} line
         * @returns {void}
         * 
         */

    drawLine(line) {
            if (!(line instanceof JiriLine)) throw new TypeError("The line argument must be a type of Line.");
            if (line.a.x === line.b.x) {
                this.canvas.drawLine({
                    x: line.a.x,
                    y: -lineLengthMultiplier
                }, {
                    x: line.b.x,
                    y: lineLengthMultiplier
                });
            } else {
                this.canvas.drawLine({
                    x: -lineLengthMultiplier,
                    y: line.y(-lineLengthMultiplier)
                }, {
                    x: lineLengthMultiplier,
                    y: line.y(lineLengthMultiplier)
                });
            }
        }
        /**
         * @description Draws a Ray on to the canvas
         * @param {Ray} ray 
         * @returns {void}
         * 
         */

    drawRay(ray) {
            if (!(ray instanceof Ray)) throw new TypeError("The ray argument must be a type of Ray.");
            if (ray.a.x === ray.b.x) {
                this.canvas.drawLine(ray.a, {
                    x: ray.b.x,
                    y: ray.b.y < ray.a.y ? -lineLengthMultiplier : lineLengthMultiplier
                });
            } else {
                this.canvas.drawLine(ray.a, {
                    x: ray.b.x < ray.a.x ? -lineLengthMultiplier : lineLengthMultiplier,
                    y: ray.y(ray.b.x < ray.a.x ? -lineLengthMultiplier : lineLengthMultiplier)
                });
            }
        }
        /**
         * @description Draws a Segment on to the canvas
         * @param {Segment} segment 
         * @returns {void}
         * 
         */

    drawSegment(segment) {
            if (!(segment instanceof Segment)) throw new TypeError("The segment argument must be a type of Segment.");
            this.canvas.drawLine(segment.a, segment.b);
        }
        /**
         * @description Draws a circle on to the canvas
         * @param {Circle} circle 
         * @returns {void}
         * 
         */

    drawCircle(circle) {
            if (!(circle instanceof Circle)) throw new TypeError("The circle argument must be a type of Circle.")
            this.canvas.drawCircle(circle.center.x, circle.center.y, circle.r);
        }
        /**
         * @description Draws a polygon on to the canvas
         * @param {Polygon} polygon 
         * @returns {void}
         * 
         */

    drawPolygon(polygon) {
        if (!(polygon instanceof Polygon)) throw new TypeError("The polygon argument must be a type of polygon.");
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(polygon.vertices[0].x, polygon.vertices[0].y)
        for (var i = 1; i < polygon.vertices.length; i++) {
            this.canvas.context.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
        }
        this.canvas.context.closePath();
        this.canvas.context.stroke();
    }
}



//! Vector
/**
 * @extends {Array<number>}
 */
class Vector extends Array {
    /**
     * 
     * @param  {...Number} values 
     */
    constructor(...values) {
            super();
            if (values.length == 0) throw new Error("Vector must have at least one value.");
            if (values.length == 1) console.warn("You are trying to use a vector with just one value. Consider using the native number class for better performance.");
            this.push(...values);
        }
        /**
         * 
         * @param {Vector} vector 
         * @returns {Vector}
         */
    multiply(vector) {
            if (vector instanceof Number) {
                var v = [];
                for (var val of this) {
                    v.push(val * vector);
                }
                return new Vector(...v);
            }
            if (vector.length != this.length) throw new Error("Can not multiply vectors, that don't have the same length.");
            var v = [];
            for (var i = 0; i < vector.length; i++) {
                v.push(this[i] * vector[i]);
            }
            return new Vector(...v);
        }
        /**
         * 
         * @param {Vector} vector 
         * @returns {Vector}
         */
    divide(vector) {
            if (vector instanceof Number) {
                var v = [];
                for (var val of this) {
                    v.push(val / vector);
                }
                return new Vector(...v);
            }
            if (vector.length != this.length) throw new Error("Can not divide vectors, that don't have the same length.");
            var v = [];
            for (var i = 0; i < vector.length; i++) {
                v.push(this[i] / vector[i]);
            }
            return new Vector(...v);
        }
        /**
         * 
         * @param {Vector} vector 
         * @returns {Vector}
         */
    add(vector) {
            if (vector instanceof Number) {
                var v = [];
                for (var val of this) {
                    v.push(val + vector);
                }
                return new Vector(...v);
            }
            if (vector.length != this.length) throw new Error("Can not add vectors, that don't have the same length.");
            var v = [];
            for (var i = 0; i < vector.length; i++) {
                v.push(this[i] + vector[i]);
            }
            return new Vector(...v);
        }
        /**
         * 
         * @param {Vector} vector 
         * @returns {Vector}
         */
    minus(vector) {
            if (vector instanceof Number) {
                var v = [];
                for (var val of this) {
                    v.push(val - vector);
                }
                return new Vector(...v);
            }
            if (vector.length != this.length) throw new Error("Can not minus vectors, that don't have the same length.");
            var v = [];
            for (var i = 0; i < vector.length; i++) {
                v.push(this[i] - vector[i]);
            }
            return new Vector(...v);
        }
        /**
         * @returns {String}
         */
    toString() {
            return `Vector${this.length}D: [${this.join(", ")}]`;
        }
        /**
         * @returns {number}
         */
    magnitude() {
            return Math.pow(this.map(v => v * v).reduce((a, b) => a + b), 1 / 2);
        }
        /**
         * 
         * @param {Vector} vector 
         * @returns {number}
         */
    dotProduct(vector) {
            return this.map((v, i) => v * vector[i]).reduce((a, b) => a + b);
        }
        /**
         * @returns {Vector}
         */
    normalize() {
        return new Vector(...this.map(v => v / this.magnitude()));
    }
    map(callback) {
            var t = [];
            for (var tt of this) {
                t.push(callback(tt));
            }
            return t;
        }
        /**
         * 
         * @param {number} magnitude 
         * @returns {Vector}
         */
    setMagnitude(magnitude) {
            return new Vector(...this.map(v => v / (this.magnitude() / magnitude)));
        }
        /**
         * 
         * @param {number} limit
         * @returns {Vector} 
         */
    limitMagnitude(limit) {
            var v = this.setMagnitude(limit);
            if (v.magnitude() >= this.magnitude) return this;
            return v;
        }
        /**
         * @returns {number}
         */
    angle() {
            if (this.length != 2) throw new Error("This method is only defined for a two dimensional vector.");
            return Math.atan2(this[1], this[0]);
        }
        /**
         * 
         * @param {number} angle 
         * @param {number} magnitude 
         */
    static fromPolar(angle, magnitude = 1) {
        return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
}