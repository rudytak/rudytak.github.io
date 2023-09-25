(function () {
    (function (window, document, undefined) {
        function aa(a, b, c) {
            return a.call.apply(a.bind, arguments);
        }
        function ba(a, b, c) {
            if (!a) throw Error();
            if (2 < arguments.length) {
                var d = Array.prototype.slice.call(arguments, 2);
                return function () {
                    var c = Array.prototype.slice.call(arguments);
                    Array.prototype.unshift.apply(c, d);
                    return a.apply(b, c);
                };
            }
            return function () {
                return a.apply(b, arguments);
            };
        }
        function k(a, b, c) {
            k = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? aa : ba;
            return k.apply(null, arguments);
        }
        var n =
            Date.now ||
            function () {
                return +new Date();
            };
        function q(a, b) {
            this.K = a;
            this.w = b || a;
            this.G = this.w.document;
        }
        q.prototype.createElement = function (a, b, c) {
            a = this.G.createElement(a);
            if (b) for (var d in b) b.hasOwnProperty(d) && ("style" == d ? (a.style.cssText = b[d]) : a.setAttribute(d, b[d]));
            c && a.appendChild(this.G.createTextNode(c));
            return a;
        };
        function r(a, b, c) {
            a = a.G.getElementsByTagName(b)[0];
            a || (a = document.documentElement);
            a && a.lastChild && a.insertBefore(c, a.lastChild);
        }
        function ca(a, b) {
            function c() {
                a.G.body ? b() : setTimeout(c, 0);
            }
            c();
        }
        function s(a, b, c) {
            b = b || [];
            c = c || [];
            for (var d = a.className.split(/\s+/), e = 0; e < b.length; e += 1) {
                for (var f = !1, g = 0; g < d.length; g += 1)
                    if (b[e] === d[g]) {
                        f = !0;
                        break;
                    }
                f || d.push(b[e]);
            }
            b = [];
            for (e = 0; e < d.length; e += 1) {
                f = !1;
                for (g = 0; g < c.length; g += 1)
                    if (d[e] === c[g]) {
                        f = !0;
                        break;
                    }
                f || b.push(d[e]);
            }
            a.className = b
                .join(" ")
                .replace(/\s+/g, " ")
                .replace(/^\s+|\s+$/, "");
        }
        function t(a, b) {
            for (var c = a.className.split(/\s+/), d = 0, e = c.length; d < e; d++) if (c[d] == b) return !0;
            return !1;
        }
        function u(a) {
            if ("string" === typeof a.na) return a.na;
            var b = a.w.location.protocol;
            "about:" == b && (b = a.K.location.protocol);
            return "https:" == b ? "https:" : "http:";
        }
        function v(a, b) {
            var c = a.createElement("link", { rel: "stylesheet", href: b, media: "all" }),
                d = !1;
            c.onload = function () {
                d || (d = !0);
            };
            c.onerror = function () {
                d || (d = !0);
            };
            r(a, "head", c);
        }
        function w(a, b, c, d) {
            var e = a.G.getElementsByTagName("head")[0];
            if (e) {
                var f = a.createElement("script", { src: b }),
                    g = !1;
                f.onload = f.onreadystatechange = function () {
                    g || (this.readyState && "loaded" != this.readyState && "complete" != this.readyState) || ((g = !0), c && c(null), (f.onload = f.onreadystatechange = null), "HEAD" == f.parentNode.tagName && e.removeChild(f));
                };
                e.appendChild(f);
                window.setTimeout(function () {
                    g || ((g = !0), c && c(Error("Script load timeout")));
                }, d || 5e3);
                return f;
            }
            return null;
        }
        function x(a, b) {
            this.Y = a;
            this.ga = b;
        }
        function y(a, b, c, d) {
            this.c = null != a ? a : null;
            this.g = null != b ? b : null;
            this.D = null != c ? c : null;
            this.e = null != d ? d : null;
        }
        var da = /^([0-9]+)(?:[\._-]([0-9]+))?(?:[\._-]([0-9]+))?(?:[\._+-]?(.*))?$/;
        y.prototype.compare = function (a) {
            return this.c > a.c || (this.c === a.c && this.g > a.g) || (this.c === a.c && this.g === a.g && this.D > a.D) ? 1 : this.c < a.c || (this.c === a.c && this.g < a.g) || (this.c === a.c && this.g === a.g && this.D < a.D) ? -1 : 0;
        };
        y.prototype.toString = function () {
            return [this.c, this.g || "", this.D || "", this.e || ""].join("");
        };
        function z(a) {
            a = da.exec(a);
            var b = null,
                c = null,
                d = null,
                e = null;
            a &&
                (null !== a[1] && a[1] && (b = parseInt(a[1], 10)),
                    null !== a[2] && a[2] && (c = parseInt(a[2], 10)),
                    null !== a[3] && a[3] && (d = parseInt(a[3], 10)),
                    null !== a[4] && a[4] && (e = /^[0-9]+$/.test(a[4]) ? parseInt(a[4], 10) : a[4]));
            return new y(b, c, d, e);
        }
        function A(a, b, c, d, e, f, g, h) {
            this.N = a;
            this.k = h;
        }
        A.prototype.getName = function () {
            return this.N;
        };
        function B(a) {
            this.a = a;
        }
        var ea = new A("Unknown", 0, 0, 0, 0, 0, 0, new x(!1, !1));
        B.prototype.parse = function () {
            var a;
            if (-1 != this.a.indexOf("MSIE") || -1 != this.a.indexOf("Trident/")) {
                a = C(this);
                var b = z(D(this)),
                    c = null,
                    d = E(this.a, /Trident\/([\d\w\.]+)/, 1),
                    c = -1 != this.a.indexOf("MSIE") ? z(E(this.a, /MSIE ([\d\w\.]+)/, 1)) : z(E(this.a, /rv:([\d\w\.]+)/, 1));
                "" != d && z(d);
                a = new A("MSIE", 0, 0, 0, 0, 0, 0, new x(("Windows" == a && 6 <= c.c) || ("Windows Phone" == a && 8 <= b.c), !1));
            } else if (-1 != this.a.indexOf("Opera"))
                a: if (((a = z(E(this.a, /Presto\/([\d\w\.]+)/, 1))), z(D(this)), null !== a.c || z(E(this.a, /rv:([^\)]+)/, 1)), -1 != this.a.indexOf("Opera Mini/")))
                    (a = z(E(this.a, /Opera Mini\/([\d\.]+)/, 1))), (a = new A("OperaMini", 0, 0, 0, C(this), 0, 0, new x(!1, !1)));
                else {
                    if (-1 != this.a.indexOf("Version/") && ((a = z(E(this.a, /Version\/([\d\.]+)/, 1))), null !== a.c)) {
                        a = new A("Opera", 0, 0, 0, C(this), 0, 0, new x(10 <= a.c, !1));
                        break a;
                    }
                    a = z(E(this.a, /Opera[\/ ]([\d\.]+)/, 1));
                    a = null !== a.c ? new A("Opera", 0, 0, 0, C(this), 0, 0, new x(10 <= a.c, !1)) : new A("Opera", 0, 0, 0, C(this), 0, 0, new x(!1, !1));
                }
            else
                /OPR\/[\d.]+/.test(this.a)
                    ? (a = F(this))
                    : /AppleWeb(K|k)it/.test(this.a)
                        ? (a = F(this))
                        : -1 != this.a.indexOf("Gecko")
                            ? ((a = "Unknown"),
                                (b = new y()),
                                z(D(this)),
                                (b = !1),
                                -1 != this.a.indexOf("Firefox") ? ((a = "Firefox"), (b = z(E(this.a, /Firefox\/([\d\w\.]+)/, 1))), (b = 3 <= b.c && 5 <= b.g)) : -1 != this.a.indexOf("Mozilla") && (a = "Mozilla"),
                                (c = z(E(this.a, /rv:([^\)]+)/, 1))),
                                b || (b = 1 < c.c || (1 == c.c && 9 < c.g) || (1 == c.c && 9 == c.g && 2 <= c.D)),
                                (a = new A(a, 0, 0, 0, C(this), 0, 0, new x(b, !1))))
                            : (a = ea);
            return a;
        };
        function C(a) {
            var b = E(a.a, /(iPod|iPad|iPhone|Android|Windows Phone|BB\d{2}|BlackBerry)/, 1);
            if ("" != b) return /BB\d{2}/.test(b) && (b = "BlackBerry"), b;
            a = E(a.a, /(Linux|Mac_PowerPC|Macintosh|Windows|CrOS|PlayStation|CrKey)/, 1);
            return "" != a ? ("Mac_PowerPC" == a ? (a = "Macintosh") : "PlayStation" == a && (a = "Linux"), a) : "Unknown";
        }
        function D(a) {
            var b = E(a.a, /(OS X|Windows NT|Android) ([^;)]+)/, 2);
            if (b || (b = E(a.a, /Windows Phone( OS)? ([^;)]+)/, 2)) || (b = E(a.a, /(iPhone )?OS ([\d_]+)/, 2))) return b;
            if ((b = E(a.a, /(?:Linux|CrOS|CrKey) ([^;)]+)/, 1))) for (var b = b.split(/\s/), c = 0; c < b.length; c += 1) if (/^[\d\._]+$/.test(b[c])) return b[c];
            return (a = E(a.a, /(BB\d{2}|BlackBerry).*?Version\/([^\s]*)/, 2)) ? a : "Unknown";
        }
        function F(a) {
            var b = C(a),
                c = z(D(a)),
                d = z(E(a.a, /AppleWeb(?:K|k)it\/([\d\.\+]+)/, 1)),
                e = "Unknown",
                f = new y(),
                f = "Unknown",
                g = !1;
            /OPR\/[\d.]+/.test(a.a)
                ? (e = "Opera")
                : -1 != a.a.indexOf("Chrome") || -1 != a.a.indexOf("CrMo") || -1 != a.a.indexOf("CriOS")
                    ? (e = "Chrome")
                    : /Silk\/\d/.test(a.a)
                        ? (e = "Silk")
                        : "BlackBerry" == b || "Android" == b
                            ? (e = "BuiltinBrowser")
                            : -1 != a.a.indexOf("PhantomJS")
                                ? (e = "PhantomJS")
                                : -1 != a.a.indexOf("Safari")
                                    ? (e = "Safari")
                                    : -1 != a.a.indexOf("AdobeAIR")
                                        ? (e = "AdobeAIR")
                                        : -1 != a.a.indexOf("PlayStation") && (e = "BuiltinBrowser");
            "BuiltinBrowser" == e
                ? (f = "Unknown")
                : "Silk" == e
                    ? (f = E(a.a, /Silk\/([\d\._]+)/, 1))
                    : "Chrome" == e
                        ? (f = E(a.a, /(Chrome|CrMo|CriOS)\/([\d\.]+)/, 2))
                        : -1 != a.a.indexOf("Version/")
                            ? (f = E(a.a, /Version\/([\d\.\w]+)/, 1))
                            : "AdobeAIR" == e
                                ? (f = E(a.a, /AdobeAIR\/([\d\.]+)/, 1))
                                : "Opera" == e
                                    ? (f = E(a.a, /OPR\/([\d.]+)/, 1))
                                    : "PhantomJS" == e && (f = E(a.a, /PhantomJS\/([\d.]+)/, 1));
            f = z(f);
            g = "AdobeAIR" == e ? 2 < f.c || (2 == f.c && 5 <= f.g) : "BlackBerry" == b ? 10 <= c.c : "Android" == b ? 2 < c.c || (2 == c.c && 1 < c.g) : 526 <= d.c || (525 <= d.c && 13 <= d.g);
            return new A(e, 0, 0, 0, 0, 0, 0, new x(g, 536 > d.c || (536 == d.c && 11 > d.g)));
        }
        function E(a, b, c) {
            return (a = a.match(b)) && a[c] ? a[c] : "";
        }
        function G(a) {
            this.ma = a || "-";
        }
        G.prototype.e = function (a) {
            for (var b = [], c = 0; c < arguments.length; c++) b.push(arguments[c].replace(/[\W_]+/g, "").toLowerCase());
            return b.join(this.ma);
        };
        function H(a, b) {
            this.N = a;
            this.Z = 4;
            this.O = "n";
            var c = (b || "n4").match(/^([nio])([1-9])$/i);
            c && ((this.O = c[1]), (this.Z = parseInt(c[2], 10)));
        }
        H.prototype.getName = function () {
            return this.N;
        };
        function I(a) {
            return a.O + a.Z;
        }
        function ga(a) {
            var b = 4,
                c = "n",
                d = null;
            a &&
                ((d = a.match(/(normal|oblique|italic)/i)) && d[1] && (c = d[1].substr(0, 1).toLowerCase()),
                    (d = a.match(/([1-9]00|normal|bold)/i)) && d[1] && (/bold/i.test(d[1]) ? (b = 7) : /[1-9]00/.test(d[1]) && (b = parseInt(d[1].substr(0, 1), 10))));
            return c + b;
        }
        function ha(a, b) {
            this.d = a;
            this.q = a.w.document.documentElement;
            this.Q = b;
            this.j = "wf";
            this.h = new G("-");
            this.ha = !1 !== b.events;
            this.F = !1 !== b.classes;
        }
        function J(a) {
            if (a.F) {
                var b = t(a.q, a.h.e(a.j, "active")),
                    c = [],
                    d = [a.h.e(a.j, "loading")];
                b || c.push(a.h.e(a.j, "inactive"));
                s(a.q, c, d);
            }
            K(a, "inactive");
        }
        function K(a, b, c) {
            if (a.ha && a.Q[b])
                if (c) a.Q[b](c.getName(), I(c));
                else a.Q[b]();
        }
        function ia() {
            this.C = {};
        }
        function L(a, b) {
            this.d = a;
            this.I = b;
            this.o = this.d.createElement("span", { "aria-hidden": "true" }, this.I);
        }
        function M(a, b) {
            var c = a.o,
                d;
            d = [];
            for (var e = b.N.split(/,\s*/), f = 0; f < e.length; f++) {
                var g = e[f].replace(/['"]/g, "");
                -1 == g.indexOf(" ") ? d.push(g) : d.push("'" + g + "'");
            }
            d = d.join(",");
            e = "normal";
            "o" === b.O ? (e = "oblique") : "i" === b.O && (e = "italic");
            c.style.cssText =
                "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" +
                d +
                ";" +
                ("font-style:" + e + ";font-weight:" + (b.Z + "00") + ";");
        }
        function N(a) {
            r(a.d, "body", a.o);
        }
        L.prototype.remove = function () {
            var a = this.o;
            a.parentNode && a.parentNode.removeChild(a);
        };
        function O(a, b, c, d, e, f, g, h) {
            this.$ = a;
            this.ka = b;
            this.d = c;
            this.m = d;
            this.k = e;
            this.I = h || "BESbswy";
            this.v = {};
            this.X = f || 3e3;
            this.ca = g || null;
            this.H = this.u = this.t = null;
            this.t = new L(this.d, this.I);
            this.u = new L(this.d, this.I);
            this.H = new L(this.d, this.I);
            M(this.t, new H("serif", I(this.m)));
            M(this.u, new H("sans-serif", I(this.m)));
            M(this.H, new H("monospace", I(this.m)));
            N(this.t);
            N(this.u);
            N(this.H);
            this.v.serif = this.t.o.offsetWidth;
            this.v["sans-serif"] = this.u.o.offsetWidth;
            this.v.monospace = this.H.o.offsetWidth;
        }
        var P = { sa: "serif", ra: "sans-serif", qa: "monospace" };
        O.prototype.start = function () {
            this.oa = n();
            M(this.t, new H(this.m.getName() + ",serif", I(this.m)));
            M(this.u, new H(this.m.getName() + ",sans-serif", I(this.m)));
            Q(this);
        };
        function R(a, b, c) {
            for (var d in P) if (P.hasOwnProperty(d) && b === a.v[P[d]] && c === a.v[P[d]]) return !0;
            return !1;
        }
        function Q(a) {
            var b = a.t.o.offsetWidth,
                c = a.u.o.offsetWidth;
            (b === a.v.serif && c === a.v["sans-serif"]) || (a.k.ga && R(a, b, c)) ? (n() - a.oa >= a.X ? (a.k.ga && R(a, b, c) && (null === a.ca || a.ca.hasOwnProperty(a.m.getName())) ? S(a, a.$) : S(a, a.ka)) : ja(a)) : S(a, a.$);
        }
        function ja(a) {
            setTimeout(
                k(function () {
                    Q(this);
                }, a),
                50
            );
        }
        function S(a, b) {
            a.t.remove();
            a.u.remove();
            a.H.remove();
            b(a.m);
        }
        function T(a, b, c, d) {
            this.d = b;
            this.A = c;
            this.S = 0;
            this.ea = this.ba = !1;
            this.X = d;
            this.k = a.k;
        }
        function ka(a, b, c, d, e) {
            c = c || {};
            if (0 === b.length && e) J(a.A);
            else
                for (a.S += b.length, e && (a.ba = e), e = 0; e < b.length; e++) {
                    var f = b[e],
                        g = c[f.getName()],
                        h = a.A,
                        m = f;
                    h.F && s(h.q, [h.h.e(h.j, m.getName(), I(m).toString(), "loading")]);
                    K(h, "fontloading", m);
                    h = null;
                    h = new O(k(a.ia, a), k(a.ja, a), a.d, f, a.k, a.X, d, g);
                    h.start();
                }
        }
        T.prototype.ia = function (a) {
            var b = this.A;
            b.F && s(b.q, [b.h.e(b.j, a.getName(), I(a).toString(), "active")], [b.h.e(b.j, a.getName(), I(a).toString(), "loading"), b.h.e(b.j, a.getName(), I(a).toString(), "inactive")]);
            K(b, "fontactive", a);
            this.ea = !0;
            la(this);
        };
        T.prototype.ja = function (a) {
            var b = this.A;
            if (b.F) {
                var c = t(b.q, b.h.e(b.j, a.getName(), I(a).toString(), "active")),
                    d = [],
                    e = [b.h.e(b.j, a.getName(), I(a).toString(), "loading")];
                c || d.push(b.h.e(b.j, a.getName(), I(a).toString(), "inactive"));
                s(b.q, d, e);
            }
            K(b, "fontinactive", a);
            la(this);
        };
        function la(a) {
            0 == --a.S && a.ba && (a.ea ? ((a = a.A), a.F && s(a.q, [a.h.e(a.j, "active")], [a.h.e(a.j, "loading"), a.h.e(a.j, "inactive")]), K(a, "active")) : J(a.A));
        }
        function U(a) {
            this.K = a;
            this.B = new ia();
            this.pa = new B(a.navigator.userAgent);
            this.a = this.pa.parse();
            this.U = this.V = 0;
            this.R = this.T = !0;
        }
        U.prototype.load = function (a) {
            this.d = new q(this.K, a.context || this.K);
            this.T = !1 !== a.events;
            this.R = !1 !== a.classes;
            var b = new ha(this.d, a),
                c = [],
                d = a.timeout;
            b.F && s(b.q, [b.h.e(b.j, "loading")]);
            K(b, "loading");
            var c = this.B,
                e = this.d,
                f = [],
                g;
            for (g in a)
                if (a.hasOwnProperty(g)) {
                    var h = c.C[g];
                    h && f.push(h(a[g], e));
                }
            c = f;
            this.U = this.V = c.length;
            a = new T(this.a, this.d, b, d);
            d = 0;
            for (g = c.length; d < g; d++) (e = c[d]), e.L(this.a, k(this.la, this, e, b, a));
        };
        U.prototype.la = function (a, b, c, d) {
            var e = this;
            d
                ? a.load(function (a, b, d) {
                    ma(e, c, a, b, d);
                })
                : ((a = 0 == --this.V), this.U--, a && 0 == this.U ? J(b) : (this.R || this.T) && ka(c, [], {}, null, a));
        };
        function ma(a, b, c, d, e) {
            var f = 0 == --a.V;
            (a.R || a.T) &&
                setTimeout(function () {
                    ka(b, c, d || null, e || null, f);
                }, 0);
        }
        function na(a, b, c) {
            this.P = a ? a : b + oa;
            this.s = [];
            this.W = [];
            this.fa = c || "";
        }
        var oa = "//fonts.googleapis.com/css";
        na.prototype.e = function () {
            if (0 == this.s.length) throw Error("No fonts to load!");
            if (-1 != this.P.indexOf("kit=")) return this.P;
            for (var a = this.s.length, b = [], c = 0; c < a; c++) b.push(this.s[c].replace(/ /g, "+"));
            a = this.P + "?family=" + b.join("%7C");
            0 < this.W.length && (a += "&subset=" + this.W.join(","));
            0 < this.fa.length && (a += "&text=" + encodeURIComponent(this.fa));
            return a;
        };
        function pa(a) {
            this.s = a;
            this.da = [];
            this.M = {};
        }
        var qa = { latin: "BESbswy", cyrillic: "&#1081;&#1103;&#1046;", greek: "&#945;&#946;&#931;", khmer: "&#x1780;&#x1781;&#x1782;", Hanuman: "&#x1780;&#x1781;&#x1782;" },
            ra = {
                thin: "1",
                extralight: "2",
                "extra-light": "2",
                ultralight: "2",
                "ultra-light": "2",
                light: "3",
                regular: "4",
                book: "4",
                medium: "5",
                "semi-bold": "6",
                semibold: "6",
                "demi-bold": "6",
                demibold: "6",
                bold: "7",
                "extra-bold": "8",
                extrabold: "8",
                "ultra-bold": "8",
                ultrabold: "8",
                black: "9",
                heavy: "9",
                l: "3",
                r: "4",
                b: "7",
            },
            sa = { i: "i", italic: "i", n: "n", normal: "n" },
            ta = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
        pa.prototype.parse = function () {
            for (var a = this.s.length, b = 0; b < a; b++) {
                var c = this.s[b].split(":"),
                    d = c[0].replace(/\+/g, " "),
                    e = ["n4"];
                if (2 <= c.length) {
                    var f;
                    var g = c[1];
                    f = [];
                    if (g)
                        for (var g = g.split(","), h = g.length, m = 0; m < h; m++) {
                            var l;
                            l = g[m];
                            if (l.match(/^[\w-]+$/)) {
                                l = ta.exec(l.toLowerCase());
                                var p = void 0;
                                if (null == l) p = "";
                                else {
                                    p = void 0;
                                    p = l[1];
                                    if (null == p || "" == p) p = "4";
                                    else
                                        var fa = ra[p],
                                            p = fa ? fa : isNaN(p) ? "4" : p.substr(0, 1);
                                    l = l[2];
                                    p = [null == l || "" == l ? "n" : sa[l], p].join("");
                                }
                                l = p;
                            } else l = "";
                            l && f.push(l);
                        }
                    0 < f.length && (e = f);
                    3 == c.length && ((c = c[2]), (f = []), (c = c ? c.split(",") : f), 0 < c.length && (c = qa[c[0]]) && (this.M[d] = c));
                }
                this.M[d] || ((c = qa[d]) && (this.M[d] = c));
                for (c = 0; c < e.length; c += 1) this.da.push(new H(d, e[c]));
            }
        };
        function V(a, b) {
            this.a = new B(navigator.userAgent).parse();
            this.d = a;
            this.f = b;
        }
        var ua = { Arimo: !0, Cousine: !0, Tinos: !0 };
        V.prototype.L = function (a, b) {
            b(a.k.Y);
        };
        V.prototype.load = function (a) {
            var b = this.d;
            "MSIE" == this.a.getName() && 1 != this.f.blocking ? ca(b, k(this.aa, this, a)) : this.aa(a);
        };
        V.prototype.aa = function (a) {
            for (var b = this.d, c = new na(this.f.api, u(b), this.f.text), d = this.f.families, e = d.length, f = 0; f < e; f++) {
                var g = d[f].split(":");
                3 == g.length && c.W.push(g.pop());
                var h = "";
                2 == g.length && "" != g[1] && (h = ":");
                c.s.push(g.join(h));
            }
            d = new pa(d);
            d.parse();
            v(b, c.e());
            a(d.da, d.M, ua);
        };
        function W(a, b) {
            this.d = a;
            this.f = b;
            this.p = [];
        }
        W.prototype.J = function (a) {
            var b = this.d;
            return u(this.d) + (this.f.api || "//f.fontdeck.com/s/css/js/") + (b.w.location.hostname || b.K.location.hostname) + "/" + a + ".js";
        };
        W.prototype.L = function (a, b) {
            var c = this.f.id,
                d = this.d.w,
                e = this;
            c
                ? (d.__webfontfontdeckmodule__ || (d.__webfontfontdeckmodule__ = {}),
                    (d.__webfontfontdeckmodule__[c] = function (a, c) {
                        for (var d = 0, m = c.fonts.length; d < m; ++d) {
                            var l = c.fonts[d];
                            e.p.push(new H(l.name, ga("font-weight:" + l.weight + ";font-style:" + l.style)));
                        }
                        b(a);
                    }),
                    w(this.d, this.J(c), function (a) {
                        a && b(!1);
                    }))
                : b(!1);
        };
        W.prototype.load = function (a) {
            a(this.p);
        };
        function X(a, b) {
            this.d = a;
            this.f = b;
            this.p = [];
        }
        X.prototype.J = function (a) {
            var b = u(this.d);
            return (this.f.api || b + "//use.typekit.net") + "/" + a + ".js";
        };
        X.prototype.L = function (a, b) {
            var c = this.f.id,
                d = this.d.w,
                e = this;
            c
                ? w(
                    this.d,
                    this.J(c),
                    function (a) {
                        if (a) b(!1);
                        else {
                            if (d.Typekit && d.Typekit.config && d.Typekit.config.fn) {
                                a = d.Typekit.config.fn;
                                for (var c = 0; c < a.length; c += 2) for (var h = a[c], m = a[c + 1], l = 0; l < m.length; l++) e.p.push(new H(h, m[l]));
                                try {
                                    d.Typekit.load({ events: !1, classes: !1 });
                                } catch (p) { }
                            }
                            b(!0);
                        }
                    },
                    2e3
                )
                : b(!1);
        };
        X.prototype.load = function (a) {
            a(this.p);
        };
        function Y(a, b) {
            this.d = a;
            this.f = b;
            this.p = [];
        }
        Y.prototype.L = function (a, b) {
            var c = this,
                d = c.f.projectId,
                e = c.f.version;
            if (d) {
                var f = c.d.w;
                w(this.d, c.J(d, e), function (e) {
                    if (e) b(!1);
                    else {
                        if (f["__mti_fntLst" + d] && (e = f["__mti_fntLst" + d]())) for (var h = 0; h < e.length; h++) c.p.push(new H(e[h].fontfamily));
                        b(a.k.Y);
                    }
                }).id = "__MonotypeAPIScript__" + d;
            } else b(!1);
        };
        Y.prototype.J = function (a, b) {
            var c = u(this.d),
                d = (this.f.api || "fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/, "");
            return c + "//" + d + "/" + a + ".js" + (b ? "?v=" + b : "");
        };
        Y.prototype.load = function (a) {
            a(this.p);
        };
        function Z(a, b) {
            this.d = a;
            this.f = b;
        }
        Z.prototype.load = function (a) {
            var b,
                c,
                d = this.f.urls || [],
                e = this.f.families || [],
                f = this.f.testStrings || {};
            b = 0;
            for (c = d.length; b < c; b++) v(this.d, d[b]);
            d = [];
            b = 0;
            for (c = e.length; b < c; b++) {
                var g = e[b].split(":");
                if (g[1]) for (var h = g[1].split(","), m = 0; m < h.length; m += 1) d.push(new H(g[0], h[m]));
                else d.push(new H(g[0]));
            }
            a(d, f);
        };
        Z.prototype.L = function (a, b) {
            return b(a.k.Y);
        };
        var $ = new U(this);
        $.B.C.custom = function (a, b) {
            return new Z(b, a);
        };
        $.B.C.fontdeck = function (a, b) {
            return new W(b, a);
        };
        $.B.C.monotype = function (a, b) {
            return new Y(b, a);
        };
        $.B.C.typekit = function (a, b) {
            return new X(b, a);
        };
        $.B.C.google = function (a, b) {
            return new V(b, a);
        };
        this.WebFont || ((this.WebFont = {}), (this.WebFont.load = k($.load, $)), this.WebFontConfig && $.load(this.WebFontConfig));
    })(this, document);
    ("use strict");
    var countDownTimer = void 0;
    function typingMarkup(e) {
        return (
            (e.parentCubeBorderWidth = toInt(e.parentCubeBorderWidth)),
            (e.circleBorderWidth = toInt(e.circleBorderWidth)),
            (e.smallCircleRadius = toInt(e.smallCircleRadius)),
            (e.countSmallCircles = toInt(e.countSmallCircles)),
            (e.smallLinesHeight = toInt(e.smallLinesHeight)),
            (e.countSmallLines = toInt(e.countSmallLines)),
            (e.timeFontSize = toInt(e.timeFontSize)),
            (e.widthFrame = toInt(e.widthFrame)),
            (e.heightFrame = toInt(e.heightFrame)),
            (e.timeFontTopPadding = toInt(e.timeFontTopPadding)),
            (e.timeFontRightPadding = toInt(e.timeFontRightPadding)),
            (e.timeFontBottomPadding = toInt(e.timeFontBottomPadding)),
            (e.timeFontLeftPadding = toInt(e.timeFontLeftPadding)),
            (e.timeSpace = toInt(e.timeSpace)),
            (e.labelFontSize = toInt(e.labelFontSize)),
            (e.labelFontTopPadding = toInt(e.labelFontTopPadding)),
            (e.labelFontRightPadding = toInt(e.labelFontRightPadding)),
            (e.labelFontBottomPadding = toInt(e.labelFontBottomPadding)),
            (e.labelFontLeftPadding = toInt(e.labelFontLeftPadding)),
            (e.spaceFontSize = toInt(e.spaceFontSize)),
            (e.spaceFontTopPadding = toInt(e.spaceFontTopPadding)),
            (e.spaceFontRightPadding = toInt(e.spaceFontRightPadding)),
            (e.spaceFontLeftPadding = toInt(e.spaceFontLeftPadding)),
            (e.spaceFontBottomPadding = toInt(e.spaceFontBottomPadding)),
            (e.smallCubeBorderWidth = toInt(e.smallCubeBorderWidth)),
            (e.cubeTopPadding = toInt(e.cubeTopPadding)),
            (e.cubeRightPadding = toInt(e.cubeRightPadding)),
            (e.cubeBottomPadding = toInt(e.cubeBottomPadding)),
            (e.cubeLeftPadding = toInt(e.cubeLeftPadding)),
            (e.parentCubeTopPadding = toInt(e.parentCubeTopPadding)),
            (e.parentCubeRightPadding = toInt(e.parentCubeRightPadding)),
            (e.parentCubeBottomPadding = toInt(e.parentCubeBottomPadding)),
            (e.parentCubeLeftPadding = toInt(e.parentCubeLeftPadding)),
            (e.circleBorderWidth = toInt(e.circleBorderWidth)),
            (e.circleRadius = toInt(e.circleRadius)),
            (e.smallCircleRadius = toInt(e.smallCircleRadius)),
            (e.countSmallCircles = toInt(e.countSmallCircles)),
            (e.smallLinesWidth = toInt(e.smallLinesWidth)),
            e
        );
    }
    function toInt(e) {
        return "" != e && null != e && "auto" != e && (e = parseInt(e)), e;
    }
    function counterCube(e, t) {
        void 0 !== t && (countDownTimer = t.id);
        var n = Object.assign({}, e);
        function o(e, t) {
            (e = e.toLowerCase()), (t = t.toLowerCase());
            var n = {
                en: { d: "d", h: "h", m: "m", s: "s", days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
                ru: { d: "д", h: "ч", m: "м", s: "с", days: "дни", hours: "часы", minutes: "минуты", seconds: "секунды" },
                af: { days: "dae", hours: "ure", minutes: "minute", seconds: "sekondes" },
                ar: { days: "أيام", hours: "ساعات", minutes: "الدقائق", seconds: "ثواني" },
                bg: { d: "д", h: "ч", m: "м", s: "с", days: "дни", hours: "часа", minutes: "минути", seconds: "секунди" },
                bn: { d: "ঘ", h: "জ", m: "মি", s: "গুলি", days: "দিন", hours: "ঘন্টার", minutes: "মিনিট", seconds: "সেকেন্ড" },
                ca: { days: "dies", hours: "hores", minutes: "minuts", seconds: "segons" },
                cs: { days: "dnů", hours: "hodin", minutes: "minut", seconds: "sekundy" },
                cy: { days: "dyddiau", hours: "oriau", minutes: "cofnodion", seconds: "eiliad" },
                da: { days: "dage", hours: "timer", minutes: "minutter", seconds: "sekunder" },
                de: { days: "tage", hours: "Stunden", minutes: "Minuten", seconds: "Sekunden" },
                el: { days: "ημέρες", hours: "ώρες", minutes: "λεπτά", seconds: "δευτερολέπτων" },
                es: { days: "dias", hours: "horas", minutes: "minutos", seconds: "segundos" },
                et: { days: "päeva", hours: "tundi", minutes: "minutit", seconds: "sekundit" },
                eu: { days: "egun", hours: "ordu", minutes: "minutu", seconds: "segundutan" },
                fa: { days: "روزها", hours: "ساعت ها", minutes: "دقایق", seconds: "ثانیه" },
                fi: { days: "päivää", hours: "tuntia", minutes: "minuutit", seconds: "sekuntia" },
                fr: { days: "journées", hours: "heures", minutes: "minutes", seconds: "secondes" },
                ga: { days: "lá", hours: "uaireanta", minutes: "nóiméad", seconds: "soicind" },
                gu: { days: "દિવસ", hours: "કલાક", minutes: "મિનિટ", seconds: "સેકંડ" },
                he: { days: "ימים", hours: "שעות", minutes: "דקות", seconds: "שניות" },
                hi: { days: "दिन", hours: "घंटे", minutes: "मिनट", seconds: "सेकंड" },
                hr: { days: "dana", hours: "sati", minutes: "minuta", seconds: "sekundi" },
                hu: { days: "napok", hours: "órák", minutes: "percek", seconds: "másodperc" },
                hy: { d: "դ", h: "h", m: "մ", s: "բ", days: "օրեր", hours: "ժամեր", minutes: "րոպե", seconds: "վայրկյան" },
                id: { days: "hari", hours: "jam", minutes: "menit", seconds: "detik" },
                is: { days: "daga", hours: "stundir", minutes: "mínútur", seconds: "sekúndur" },
                it: { days: "giorni", hours: "ore", minutes: "minuti", seconds: "secondi" },
                ja: { days: "日々", hours: "時間", minutes: "分", seconds: "秒" },
                km: { days: "ថ្ងៃ", hours: "ម៉ោង", minutes: "នាទី", seconds: "វិនាទី" },
                ko: { days: "일", hours: "시간", minutes: "의사록", seconds: "초" },
                la: { days: "diebus", hours: "horis", minutes: "minutes", seconds: "seconds" },
                lt: { days: "dienos", hours: "valandos", minutes: "minutės", seconds: "sekundes" },
                lv: { days: "dienas", hours: "stundas", minutes: "minūtes", seconds: "sekundes" },
                mi: { days: "ra", hours: "haora", minutes: "meneti", seconds: "hēkona" },
                mk: { days: "дена", hours: "часа", minutes: "минути", seconds: "секунди" },
                ml: { days: "ദിവസങ്ങളിൽ", hours: "മണിക്കൂറുകൾ", minutes: "മിനിറ്റ്", seconds: "സെക്കൻഡ്" },
                mn: { days: "өдөр", hours: "цаг", minutes: "минут", seconds: "секунд" },
                mr: { days: "दिवस", hours: "तास", minutes: "मिनिटे", seconds: "सेकंद" },
                ms: { days: "hari", hours: "jam", minutes: "minit", seconds: "detik" },
                mt: { days: "jiem", hours: "sigħat", minutes: "minuti", seconds: "sekondi" },
                ne: { days: "दिन", hours: "घण्टा", minutes: "मिनेट", seconds: "सेकेन्ड" },
                nl: { days: "dagen", hours: "uren", minutes: "minuten", seconds: "seconden" },
                no: { days: "dager", hours: "timer", minutes: "minutter", seconds: "sekunder" },
                pa: { days: "ਦਿਨ", hours: "ਘੰਟੇ", minutes: "ਮਿੰਟ", seconds: "ਸਕਿੰਟ" },
                pl: { days: "dni", hours: "godziny", minutes: "minuty", seconds: "sekundy" },
                pt: { days: "dias", hours: "horas", minutes: "minutos", seconds: "segundos" },
                ro: { days: "zi", hours: "ore", minutes: "minute", seconds: "secunde" },
                sk: { days: "dni", hours: "hodiny", minutes: "minúty", seconds: "sekundy" },
                sl: { days: "dnevi", hours: "ure", minutes: "minut", seconds: "sekund" },
                sm: { days: "aso", hours: "itula", minutes: "minute", seconds: "sekone" },
                sq: { days: "ditë", hours: "orë", minutes: "minuta", seconds: "sekonda" },
                sr: { days: "дана", hours: "сати", minutes: "минута", seconds: "секунде" },
                sv: { days: "dagar", hours: "timmar", minutes: "minuter", seconds: "sekunder" },
                sw: { days: "siku", hours: "masaa", minutes: "dakika", seconds: "sekunde" },
                ta: { days: "நாட்களில்", hours: "மணி", minutes: "நிமிடங்கள்", seconds: "விநாடிகள்" },
                th: { days: "วัน", hours: "ชั่วโมง", minutes: "นาที", seconds: "วินาที" },
                tr: { days: "günler", hours: "saatler", minutes: "dakika", seconds: "saniye" },
                uk: { d: "д", h: "ч", m: "м", s: "х", days: "дні", hours: "годин", minutes: "хвилин", seconds: "секунд" },
                ur: { days: "دن", hours: "گھنٹے", minutes: "منٹ", seconds: "سیکنڈ" },
                uz: { days: "kunlar", hours: "soat", minutes: "daqiqa", seconds: "soniya" },
                vi: { days: "ngày", hours: "giờ", minutes: "phút", seconds: "giây" },
                xh: { days: "iintsuku", hours: "iiyure", minutes: "imizuzu", seconds: "imizuzwana" },
                zh: { days: "天", hours: "小时", minutes: "分钟", seconds: "秒" },
                jw: { days: "dina", hours: "jam", minutes: "menit", seconds: "detik" },
            };
            if (n[e]) {
                if (n[e][t]) return n[e][t];
                if (n.en[t]) return n.en[t];
            }
            return t;
        }
        ((n = typingMarkup(n)).labelSec = o(e.lang, e.labelSec)),
            (n.labelDay = o(e.lang, e.labelDay)),
            (n.labelMin = o(e.lang, e.labelMin)),
            (n.labelHour = o(e.lang, e.labelHour)),
            (function () {
                null == n.textColor && (n.textColor = "#000000");
                if (1 === n.typeTimer || 7 === n.typeTimer) {
                    7 === n.typeTimer &&
                        (null == n.lableFontColor && (n.lableFontColor = n.textColor),
                            null == n.spaceFontColor && (n.spaceFontColor = n.textColor),
                            null == n.cubeTopPadding && (n.cubeTopPadding = 3),
                            null == n.cubeBottomPadding && (n.cubeBottomPadding = 0),
                            null == n.cubeLeftPadding && (n.cubeLeftPadding = 0),
                            null == n.cubeRightPadding && (n.cubeRightPadding = 0),
                            null == n.labelFontTopPadding && (n.labelFontTopPadding = n.timeFontSize / 6),
                            null == n.labelFontSize && (n.labelFontSize = n.timeFontSize / 3.8)),
                        null === n.timeSpace && (n.timeSpace = 4),
                        null == n.timeFontColor && (n.timeFontColor = n.textColor),
                        null == n.lableFontColor && (n.lableFontColor = n.figureColor),
                        null == n.spaceFontColor && (n.spaceFontColor = n.figureColor),
                        (null != n.labelFontStyle && 100 != n.labelFontStyle) || (n.labelFontStyle = n.timeFontStyle),
                        null == n.smallCubeColor && (n.smallCubeColor = n.figureColor),
                        null == n.cubeTopPadding && (n.cubeTopPadding = n.timeFontSize / 5),
                        null == n.cubeBottomPadding && (n.cubeBottomPadding = n.timeFontSize / 5),
                        null == n.cubeLeftPadding && (n.cubeLeftPadding = n.timeFontSize / 15),
                        null == n.cubeRightPadding && (n.cubeRightPadding = n.timeFontSize / 15),
                        null == n.labelFontSize && (n.labelFontSize = Math.round(n.timeFontSize / 3.4)),
                        null == n.spaceFontSize && (n.spaceFontSize = Math.round(n.timeFontSize / 1.1));
                    var e = Ne(parseInt(n.timeFontStyle));
                    "Montserrat" === n.timeFontFamily && "function" == typeof aPaddingMontserrat && aPaddingMontserrat(n, e),
                        "Roboto" === n.timeFontFamily && "function" == typeof aPaddingRoboto && aPaddingRoboto(n, e),
                        "Roboto Condensed" === n.timeFontFamily && "function" == typeof aPaddingRobotoCondensed && aPaddingRobotoCondensed(n, e),
                        "Open Sans" === n.timeFontFamily && "function" == typeof aPaddingOpenSans && aPaddingOpenSans(n, e),
                        "Lato" === n.timeFontFamily && "function" == typeof aPaddingLato && aPaddingLato(n, e),
                        "PT Sans" === n.timeFontFamily && "function" == typeof aPaddingPTSans && aPaddingPTSans(n, e),
                        "Source Sans Pro" === n.timeFontFamily && "function" == typeof aPaddingSourceSansPro && aPaddingSourceSansPro(n, e);
                } else
                    4 === n.typeTimer
                        ? (null == n.timeFontSize && (n.timeFontSize = 0),
                            null == n.labelFontSize && (n.labelFontSize = Math.round(n.timeFontSize / 3.4)),
                            null == n.spaceFontSize && (n.spaceFontSize = 0),
                            null == n.timeFontColor && (n.timeFontColor = n.textColor),
                            null == n.lableFontColor && (n.lableFontColor = n.textColor),
                            null == n.spaceFontColor && (n.spaceFontColor = n.textColor),
                            (null != n.labelFontStyle && 100 != n.labelFontStyle) || (n.labelFontStyle = n.timeFontStyle),
                            null == n.parentCubeBorderWidth &&
                            ((n.parentCubeBorderWidth = Math.round(n.timeFontSize / 15)), n.parentCubeBorderWidth % 2 != 0 && (n.parentCubeBorderWidth += 1), 0 === n.parentCubeBorderWidth && (n.parentCubeBorderWidth = 1)),
                            null == n.parentCubeColor && (n.parentCubeColor = n.figureColor),
                            null == n.parentCubeLeftPadding && (n.parentCubeLeftPadding = Math.round(n.timeFontSize / 2.5)),
                            null == n.parentCubeRightPadding && (n.parentCubeRightPadding = Math.round(n.timeFontSize / 2.5)),
                            null == n.parentCubeTopPadding && (n.parentCubeTopPadding = Math.round(n.timeFontSize / 3.3)),
                            null == n.parentCubeBottomPadding && (n.parentCubeBottomPadding = Math.round(n.timeFontSize / 5)),
                            null == n.spaceFontLeftPadding && (n.spaceFontLeftPadding = Math.round(n.timeFontSize / 5)),
                            null == n.spaceFontRightPadding && (n.spaceFontRightPadding = Math.round(n.timeFontSize / 5)),
                            null == n.labelFontTopPadding && (n.labelFontTopPadding = Math.round(n.timeFontSize / 5)))
                        : (null === n.timeSpace && (n.timeSpace = 2),
                            null == n.labelFontSize && (n.labelFontSize = Math.round(n.timeFontSize / 3.4)),
                            null == n.spaceFontSize && (n.spaceFontSize = 0),
                            null == n.timeFontColor && (n.timeFontColor = n.textColor),
                            null == n.lableFontColor && (n.lableFontColor = n.textColor),
                            null == n.spaceFontColor && (n.spaceFontColor = n.textColor),
                            (null != n.labelFontStyle && 100 != n.labelFontStyle) || (n.labelFontStyle = n.timeFontStyle),
                            null == n.parentCubeColor && (n.parentCubeColor = n.figureColor),
                            null == n.spaceFontLeftPadding && (n.spaceFontLeftPadding = Math.round(n.timeFontSize / 5)),
                            null == n.spaceFontRightPadding && (n.spaceFontRightPadding = Math.round(n.timeFontSize / 5)),
                            null == n.parentCubeLeftPadding && (n.parentCubeLeftPadding = Math.round(n.timeFontSize / 2.5)),
                            null == n.parentCubeRightPadding && (n.parentCubeRightPadding = Math.round(n.timeFontSize / 2.5)),
                            null == n.parentCubeTopPadding && (n.parentCubeTopPadding = Math.round(n.timeFontSize / 3.3)),
                            null == n.parentCubeBottomPadding && (n.parentCubeBottomPadding = Math.round(n.timeFontSize / 3.3)));
                null === n.labelFontTopPadding && (n.labelFontTopPadding = 5);
                null === n.smallCubeBorderColor && (n.smallCubeBorderColor = "#000000");
                null === n.parentCubeBorderColor && (n.parentCubeBorderColor = "#000000");
                var t = Ne(Ee(n.timeFontStyle));
                "Arial" != n.timeFontFamily && "italic " == t && (n.cubeRightPadding = Ee(n.cubeRightPadding) + Ee(n.timeFontSize / 6));
            })(),
            (Object.size = function (e) {
                var t,
                    n = 0;
                for (t in e) e.hasOwnProperty(t) && n++;
                return n;
            }),
            clearInterval(countDownTimer),
            (function () {
                null == n.timeFontSize && (n.timeFontSize = 0);
                null == n.textColor && (n.textColor = "#000000");
            })();
        var i = t;
        void 0 === t && (i = document.getElementById("countDownTimer"));
        var a = i.nextElementSibling || i.nextSibling;
        if (a && void 0 !== a.getAttribute) {
            var d = a.getAttribute("data-stop-redraw");
            d && "true" == d && (n.stopRedraw = !0);
        }
        "undefined" != typeof stopGlobalRedraw && stopGlobalRedraw && (n.stopRedraw = !0), (i.width = 100);
        var r = (1.5 * Math.max(Ee(n.timeFontSize), Ee(n.labelFontSize), Ee(n.spaceFontSize))).toFixed(0);
        (i.height = r), (i.style.opacity = 0);
        var s = i.getContext("2d"),
            l = new Date(),
            u = 0;
        Qe(n).getTime() > l.getTime() && (u = Math.abs(Qe(n).getTime() - l.getTime()));
        var m = Math.ceil(u / 1e3),
            g = Ae(),
            c = 0,
            h = 0,
            b = 0,
            p = 0,
            F = 0,
            C = Ee(n.widthFrame),
            y = Ee(n.heightFrame),
            f = {},
            P = 0,
            S = 0,
            B = 0,
            L = 0,
            R = 0,
            v = 0,
            z = 0,
            W = 0,
            T = 0,
            x = 0,
            w = 0,
            k = 0,
            M = 0,
            I = 0,
            D = 0,
            j = 0,
            O = 0,
            N = 0,
            H = {},
            A = {},
            Z = 0,
            U = 0,
            q = 0,
            E = 0,
            G = 0,
            J = 0,
            K = 0,
            Q = 0,
            V = 0,
            X = 0,
            Y = 0,
            $ = 0,
            _ = 0,
            ee = 0,
            te = 0,
            ne = 0,
            oe = 0,
            ie = 0,
            ae = 0,
            de = 0,
            re = 0,
            se = 0,
            le = 0,
            ue = 0,
            me = 0,
            ge = 0,
            ce = 0,
            he = 0,
            be = 0,
            pe = 0,
            Fe = 0,
            Ce = 10,
            ye = "Powered by PromoFeatures.com",
            fe = 0,
            Pe = 0,
            Se = !1;
        n.disableWM && (Se = !1);
        var Be = 0;
        if (
            (n.transparent
                ? ((i.style.backgroundColor = ""), (i.style.background = ""))
                : n.frameColor &&
                (n.frameColor2 ? ((i.style.backgroundColor = ""), (i.style.background = "linear-gradient(to right, " + n.frameColor + "," + n.frameColor2 + ")")) : ((i.style.background = ""), (i.style.backgroundColor = n.frameColor))),
                Le(),
                ve(),
                n.stopRedraw)
        )
            return !0;
        function Le() {
            Ze("days"),
                Ue("days", n.labelDay),
                qe(n.spaceType),
                (M = Je(Math.max(v + Ee(n.timeSpace) * (k - 1), W) + Ee(n.parentCubeBorderWidth) + Ee(n.smallCubeBorderWidth) * k + Ee(n.parentCubeLeftPadding) + Ee(n.parentCubeRightPadding))),
                (O += Je(f.space.width + Ee(n.spaceFontLeftPadding) + Ee(n.spaceFontRightPadding))),
                (v = 0),
                (W = 0),
                Ze("hours"),
                Ue("hours", n.labelHour),
                qe(n.spaceType),
                (I = Je(Math.max(v + Ee(n.timeSpace), W) + Ee(n.parentCubeBorderWidth) + 2 * Ee(n.smallCubeBorderWidth) + Ee(n.parentCubeLeftPadding) + Ee(n.parentCubeRightPadding))),
                (O += Je(f.space.width + Ee(n.spaceFontLeftPadding) + Ee(n.spaceFontRightPadding))),
                (v = 0),
                (W = 0),
                Ze("minutes"),
                Ue("minutes", n.labelMin),
                qe(n.spaceType),
                (D = Je(Math.max(v + Ee(n.timeSpace), W) + Ee(n.parentCubeBorderWidth) + 2 * Ee(n.smallCubeBorderWidth) + Ee(n.parentCubeLeftPadding) + Ee(n.parentCubeRightPadding))),
                (O += Je(f.space.width + Ee(n.spaceFontLeftPadding) + Ee(n.spaceFontRightPadding))),
                (v = 0),
                (W = 0),
                Ze("seconds"),
                Ue("seconds", n.labelSec),
                (j = Je(Math.max(v + Ee(n.timeSpace), W) + Ee(n.parentCubeBorderWidth) + 2 * Ee(n.smallCubeBorderWidth) + Ee(n.parentCubeLeftPadding) + Ee(n.parentCubeRightPadding))),
                (h = Je(R + z + Ee(n.parentCubeBorderWidth) + Ee(n.smallCubeBorderWidth) + Ee(n.parentCubeTopPadding) + Ee(n.parentCubeBottomPadding) + Ee(n.timeFontBottomPadding) + Ee(n.timeFontTopPadding))),
                (O += 3 * Ee(n.parentCubeBorderWidth)),
                n.fixedCube && ((M = Re()), (I = Re()), (D = Re()), (j = Re())),
                (c = Je(M + I + D + j + O)),
                n.disableDays && (c -= M + O / 3),
                (P = Math.max(P, c)),
                (function () {
                    B = C > 10 ? C : c;
                    y > 10 && y > h ? ((L = y), !0) : (L = h + 2);
                    L < 10 && (L = 10);
                    B < 10 && (B = 10);
                    (B += Ee(n.parentCubeBorderWidth)),
                        (L += Ee(n.parentCubeBorderWidth)),
                        (function () {
                            if (!Se) return;
                            fe = n.timeFontSize / 10;
                            var e = n.timeFontFamily,
                                t = n.timeFontSize / 4,
                                o = parseInt(n.timeFontStyle),
                                a = Oe(o),
                                d = Ne(o);
                            (Ce =
                                d +
                                a +
                                (function () {
                                    var e = 0;
                                    return (e = n.timeFontSize < 25 ? Math.round(n.timeFontSize / 2.5) : n.timeFontSize < 40 ? n.timeFontSize / 3 : n.timeFontSize / 4) < 6 && (e = 6), e > 15 && (e = 15), e;
                                })() +
                                "px " +
                                e),
                                (s.font = Ce),
                                0 == Be && t > 0 && (Be = Ge(i, Ce, ye));
                            L += Be + fe + 6;
                        })(),
                        (i.width = B),
                        (i.height = L);
                })(),
                (i.style.opacity = 1),
                (he = Je((L - h) / 2) - Be),
                (be = Je(he + Ee(n.smallCubeBorderWidth) / 2 + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.parentCubeTopPadding) + Ee(n.timeFontTopPadding))),
                n.reverseLable && (be += z),
                (pe = Je(be + b + Ee(n.cubeTopPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                (Fe = Je(be + R + z - T - Ee(n.labelFontBottomPadding) + Ee(n.smallCubeBorderWidth) / 2 + Ee(n.timeFontBottomPadding))),
                n.reverseLable && (Fe -= Je(R + z + Ee(n.smallCubeBorderWidth))),
                (N = Je(be + w / 2 + Ee(n.smallCubeBorderWidth) / 2 + F / 2 + Ee(n.spaceFontTopPadding) - Ee(n.spaceFontBottomPadding))),
                (function () {
                    if (n.disableDays) return (Q = Je((B - c) / 2)), void (Pe = Q);
                    (U = Je((B - c) / 2)), (Pe = U);
                    var e = 0,
                        t = Object.size(f.days.digit);
                    for (var o in f.days.digit)
                        0 === e
                            ? ((q = Je(U + M / 2 + Ee(n.smallCubeBorderWidth) / 2 - (x * t + Ee(n.smallCubeBorderWidth) * t + Ee(n.timeSpace) * (t - 1)) / 2) + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2),
                                (E = q),
                                (E += Je(Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding))))
                            : (E = Je(E + x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace))),
                            (H[e] = {}),
                            (H[e] = { digit: f.days.digit[o].type, x: E }),
                            e++;
                    for (var i in ((e = 0), H))
                        0 == e
                            ? ((G = Je(q + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)), (J = G), (J += Je(Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding))))
                            : (J = Je(H[i].x + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                            (A[e] = {}),
                            (A[e] = { digit: f.days.digit[i].type, x: J }),
                            e++;
                    (K = Je(U + M / 2 - f.days.label.width / 2 + Ee(n.labelFontLeftPadding) - Ee(n.labelFontRightPadding))),
                        (Z = Je(U + M + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.spaceFontLeftPadding))),
                        (Q = Je(Z + f.space.width + Ee(n.spaceFontRightPadding) + Ee(n.parentCubeBorderWidth) / 2));
                })(),
                (V = Je(Q + I / 2 - (2 * x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace)) / 2 + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2 + Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding))),
                (X = Je(V + x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace))),
                (Y = Je(V + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth / 2))),
                ($ = Je(X + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                (_ = Je(Q + I / 2 - f.hours.label.width / 2 + Ee(n.labelFontLeftPadding) - Ee(n.labelFontRightPadding))),
                (ee = Je(Q + I + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.spaceFontLeftPadding))),
                (te = Je(ee + f.space.width + Ee(n.spaceFontRightPadding) + Ee(n.parentCubeBorderWidth) / 2)),
                (ne = Je(te + D / 2 - (2 * x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace)) / 2 + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2 + Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding))),
                (oe = Je(ne + x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace))),
                (ie = Je(ne + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                (ae = Je(oe + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                (de = Je(te + D / 2 - f.minutes.label.width / 2 + Ee(n.labelFontLeftPadding) - Ee(n.labelFontRightPadding))),
                (re = Je(te + D + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.spaceFontLeftPadding))),
                (se = Je(re + f.space.width + Ee(n.spaceFontRightPadding) + Ee(n.parentCubeBorderWidth) / 2)),
                (le = Je(se + j / 2 - (2 * x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace)) / 2 + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2 + Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding))),
                (ue = Je(le + x + Ee(n.smallCubeBorderWidth) + Ee(n.timeSpace))),
                (me = Je(le + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                (ge = Je(ue + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                (ce = Je(se + j / 2 - f.seconds.label.width / 2 + Ee(n.labelFontLeftPadding) - Ee(n.labelFontRightPadding)));
        }
        function Re() {
            return Ee(n.disableDays) && (M = 0), Math.max(j, Math.max(D, Math.max(M, I)));
        }
        function ve() {
            if ((!0, s.clearRect(0, 0, P, S), !n.disableDays)) {
                if ((ke(U, he, M, h), xe(U, he, M, h), null != n.smallCubeColor)) for (var e in ((s.fillStyle = n.smallCubeColor), H)) s.fillRect(H[e].x, be, x, w);
                if (n.smallCubeBorderWidth > 0) for (var t in ((s.lineWidth = n.smallCubeBorderWidth), (s.strokeStyle = n.smallCubeBorderColor), H)) s.strokeRect(H[t].x, be, x, w);
                for (var o in A) je(n.timeFontSize, n.timeFontFamily, n.timeFontColor, n.timeFontStyle), ze(A[o].digit, A[o].x, pe, f.days.digit[o].width, "days", o);
                Ie(n.labelFontSize, n.labelFontFamily, n.lableFontColor, n.labelFontStyle), Me(n.labelDay, K, Fe), De(n.spaceFontSize, n.spaceFontFamily, n.spaceFontColor, 0), s.fillText(n.spaceType, Z, N);
            }
            if (
                (ke(Q, he, I, h),
                    xe(Q, he, I, h),
                    void 0 === f.hours.digit[1]
                        ? ((V = Q + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2 + Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding)),
                            (V += Je(I / 2 - Ee(n.parentCubeBorderWidth) / 2 - x / 2)),
                            (Y = Je(V + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                            Te(V, null, be),
                            We(V, null, be),
                            we(f.hours.digit[0].type, null, Y, $, pe, f.hours.digit[0].width, null, "hours"))
                        : (Te(V, X, be), We(V, X, be), we(f.hours.digit[0].type, f.hours.digit[1].type, Y, $, pe, f.hours.digit[0].width, f.hours.digit[1].width, "hours")),
                    Ie(n.labelFontSize, n.labelFontFamily, n.lableFontColor, n.labelFontStyle),
                    Me(n.labelHour, _, Fe),
                    De(n.spaceFontSize, n.spaceFontFamily, n.spaceFontColor, 0),
                    s.fillText(n.spaceType, ee, N),
                    ke(te, he, D, h),
                    xe(te, he, D, h),
                    void 0 === f.minutes.digit[1]
                        ? ((ne = te + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2 + Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding)),
                            (ne += Je(D / 2 - Ee(n.parentCubeBorderWidth) / 2 - x / 2)),
                            (ie = Je(ne + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                            Te(ne, null, be),
                            We(ne, null, be),
                            we(f.minutes.digit[0].type, null, ie, ae, pe, f.minutes.digit[0].width, null, "minutes"))
                        : (Te(ne, oe, be), We(ne, oe, be), we(f.minutes.digit[0].type, f.minutes.digit[1].type, ie, ae, pe, f.minutes.digit[0].width, f.minutes.digit[1].width, "minutes")),
                    Ie(n.labelFontSize, n.labelFontFamily, n.lableFontColor, n.labelFontStyle),
                    Me(n.labelMin, de, Fe),
                    De(n.spaceFontSize, n.spaceFontFamily, n.spaceFontColor, 0),
                    s.fillText(n.spaceType, re, N),
                    ke(se, he, j, h),
                    xe(se, he, j, h),
                    void 0 === f.seconds.digit[1]
                        ? ((le = se + Ee(n.parentCubeBorderWidth) / 2 + Ee(n.parentCubeLeftPadding) / 2 - Ee(n.parentCubeRightPadding) / 2 + Ee(n.timeFontLeftPadding) - Ee(n.timeFontRightPadding)),
                            (le += Je(j / 2 - Ee(n.parentCubeBorderWidth) / 2 - x / 2)),
                            (me = Je(le + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth) / 2)),
                            Te(le, null, be),
                            We(le, null, be),
                            we(f.seconds.digit[0].type, null, me, 0, pe, f.seconds.digit[0].width, null, "seconds"))
                        : (Te(le, ue, be), We(le, ue, be), we(f.seconds.digit[0].type, f.seconds.digit[1].type, me, ge, pe, f.seconds.digit[0].width, f.seconds.digit[1].width, "seconds")),
                    Ie(n.labelFontSize, n.labelFontFamily, n.lableFontColor, n.labelFontStyle),
                    Me(n.labelSec, ce, Fe),
                    Se)
            ) {
                (s.font = Ce), (s.fillStyle = n.figureColor), n.figureColor === n.frameColor && (s.fillStyle = n.timeFontColor);
                var i = he + h + Be + fe + Ee(n.parentCubeBorderWidth);
                i > L && (i = L - 3), s.fillText(ye, Pe, i);
            }
        }
        function ze(e, t, o, i, a, d) {
            var r = 0,
                l = g[a].split(""),
                u = Ne(parseInt(n.timeFontStyle)),
                m = Oe(parseInt(n.timeFontStyle)),
                c = parseInt(d);
            "Montserrat" === n.timeFontFamily && "function" == typeof dStringMontserrat && (r = dStringMontserrat(e, i, l, u, c, n, m)),
                "Roboto" === n.timeFontFamily && "function" == typeof dStringRoboto && (r = dStringRoboto(e, i, l, u, c, n, m)),
                "Roboto Condensed" === n.timeFontFamily && "function" == typeof dStringRobotoCondensed && (r = dStringRobotoCondensed(e, i, l, u, c, n, m)),
                "Open Sans" === n.timeFontFamily && "function" == typeof dStringOpenSans && (r = dStringOpenSans(e, i, l, u, c, n, m)),
                "Lato" === n.timeFontFamily && "function" == typeof dStringLato && (r = dStringLato(e, i, l, u, c, n, m)),
                "PT Sans" === n.timeFontFamily && "function" == typeof dStringPTSans && (r = dStringPTSans(e, i, l, u, c, n, m)),
                "Source Sans Pro" === n.timeFontFamily && "function" == typeof dStringSourceSansPro && (r = dStringSourceSansPro(e, i, l, u, c, n, m)),
                s.fillText(e, t + r, o);
        }
        function We(e, t, o) {
            n.smallCubeBorderWidth > 0 && ((s.lineWidth = n.smallCubeBorderWidth), (s.strokeStyle = n.smallCubeBorderColor), s.strokeRect(e, o, x, w), null != t && s.strokeRect(t, o, x, w));
        }
        function Te(e, t, o) {
            null != n.smallCubeColor && ((s.fillStyle = n.smallCubeColor), s.fillRect(e, o, x, w), null != t && s.fillRect(t, o, x, w));
        }
        function xe(e, t, o, i) {
            n.parentCubeBorderWidth > 0 && ((s.lineWidth = n.parentCubeBorderWidth), (s.strokeStyle = n.parentCubeBorderColor), s.strokeRect(e, t, o, i));
        }
        function we(e, t, o, i, a, d, r, s) {
            je(n.timeFontSize, n.timeFontFamily, n.timeFontColor, n.timeFontStyle), null != t ? (ze(e, o, a, d, s, 0), ze(t, i, a, r, s, 1)) : ze(e, o, a, d, s, 0);
        }
        function ke(e, t, o, i) {
            null != n.parentCubeColor && (n.parentCubeColor2, (s.fillStyle = n.parentCubeColor), s.fillRect(e, t, o, i));
        }
        function Me(e, t, o) {
            n.registerLetter && "0" != n.registerLetter ? ("1" === n.registerLetter ? (e = e.toLowerCase()) : "2" === n.registerLetter && (e = Ke(e))) : (e = e.toUpperCase()), s.fillText(e, t, o);
        }
        function Ie(e, t, n, o) {
            He(e, t, n, o, 1);
        }
        function De(e, t, n, o) {
            He(e, t, n, o, 2);
        }
        function je(e, t, n, o) {
            He(e, t, n, o, 0);
        }
        function Oe(e) {
            var t = "normal ";
            return (1 !== e && 3 !== e && 8 !== e && 9 !== e) || (t = "bold "), t;
        }
        function Ne(e) {
            var t = "normal ";
            return (2 !== e && 3 !== e && 5 !== e && 7 !== e && 9 !== e) || (t = "italic "), t;
        }
        function He(e, t, o, i, a) {
            (i = parseInt(i)),
                (isNaN(i) || 100 === i) && (i = Ee(n.timeFontStyle)),
                (t && "0" !== t) || (t = n.timeFontFamily),
                1 === a ? null == e && (e = (n.timeFontSize / 2).toFixed()) : 2 === a && null == e && (e = (n.timeFontSize / 1.1).toFixed());
            var d = Oe(i),
                r = Ne(i);
            (s.font = r + d + e + "px " + t), o || (o = n.textColor), (s.fillStyle = o);
        }
        function Ae() {
            var e = {};
            return (
                m < 0 && (m = 0),
                (e.days = Math.floor(m / 60 / 60 / 24).toString()),
                (e.hours = (Math.floor(m / 60 / 60) % 24).toString()),
                (e.minutes = (Math.floor(m / 60) % 60).toString()),
                (e.seconds = (Math.floor(m) % 60).toString()),
                (e.days = 1 != e.days.length || n.removeDZero ? e.days : "0" + e.days),
                (e.hours = 1 != e.hours.length || n.removeHZero ? e.hours : "0" + e.hours),
                (e.minutes = 1 != e.minutes.length || n.removeMZero ? e.minutes : "0" + e.minutes),
                (e.seconds = 1 != e.seconds.length || n.removeSZero ? e.seconds : "0" + e.seconds),
                (m -= 1),
                e
            );
        }
        function Ze(e) {
            if ("days" !== e || !n.disableDays) {
                var t = g[e].toString().split(""),
                    o = n.timeFontStyle,
                    a = Oe(o),
                    d = Ne(o) + a + n.timeFontSize + "px " + n.timeFontFamily;
                (s.font = d), (f[e] = {});
                var r = 0;
                for (var l in t)
                    if (!isNaN(parseInt(l))) {
                        var u = t[l];
                        void 0 === f[e].digit && (f[e].digit = {}), (f[e].digit[r] = {});
                        var m = u.toString();
                        "Montserrat" === n.timeFontFamily && (m = "0");
                        var c = s.measureText(m).width;
                        (f[e].digit[r].width = s.measureText(u.toString()).width), (f[e].digit[r].type = u), 0 == b && n.timeFontSize > 0 && (b = Ge(i, d, u));
                        var h = Ee(n.cubeRightPadding) + c + Ee(n.cubeLeftPadding) + Ee(n.smallCubeBorderWidth);
                        (f[e].digit[r].lWidth = h),
                            (x = Math.max(x, h)),
                            (v += Ee(n.timeFontLeftPadding) + x + Ee(n.timeFontRightPadding)),
                            (R = Math.max(R, Ee(n.cubeTopPadding) + b + Ee(n.cubeBottomPadding) + Ee(n.smallCubeBorderWidth))),
                            0,
                            (w = R),
                            r++;
                    }
                return (k = r), f;
            }
        }
        function Ue(e, t) {
            if ("days" !== e || !n.disableDays) {
                n.registerLetter && "0" !== n.registerLetter ? ("1" === n.registerLetter ? (t = t.toLowerCase()) : "2" === n.registerLetter && (t = Ke(t))) : (t = t.toUpperCase());
                var o = n.labelFontFamily,
                    a = n.labelFontSize;
                (o && "0" !== o) || (o = n.timeFontFamily), null == a && (a = (Ee(n.timeFontSize) / 2).toFixed());
                var d = parseInt(n.labelFontStyle);
                (isNaN(d) || 100 === d) && (d = Ee(n.timeFontStyle));
                var r = Oe(d),
                    l = Ne(d) + r + a + "px " + o;
                (s.font = l), (f[e].label = {});
                var u = s.measureText(t).width;
                return (f[e].label.width = u), 0 == p && a > 0 && "" != t && null != t && (p = Ge(i, l, t)), (z = Math.max(z, p + Ee(n.labelFontTopPadding) + Ee(n.labelFontBottomPadding))), (T = 0), (W += u), f;
            }
        }
        function qe(e) {
            var t = n.spaceFontFamily,
                o = n.spaceFontSize;
            (t && "0" !== t) || (t = n.timeFontFamily), null == o && (o = (Ee(n.timeFontSize) / 1.1).toFixed());
            var a = "normal normal " + o + "px " + t;
            (s.font = a), (f.space = {});
            var d = s.measureText(e).width;
            return (f.space.width = d), 0 == F && o > 0 && (F = Ge(i, a, e)), f;
        }
        function Ee(e) {
            return (e = parseInt(e)), isNaN(e) && (e = 0), e;
        }
        function Ge(e, t, n) {
            var o = e.getContext("2d"),
                i = e.width,
                a = e.height;
            (o.font = t), (o.textAlign = "left"), (o.textBaseline = "top"), o.fillText(n, 25, 5);
            var d = o.getImageData(0, 0, i, a).data;
            o.clearRect(0, 0, i, a);
            for (var r = -1, s = -1, l = 0; l < a; l++) {
                for (var u = 0; u < i; u++) {
                    if (d[4 * (i * l + u) + 3] > 0) {
                        r = l;
                        break;
                    }
                }
                if (r >= 0) break;
            }
            for (l = a; l > 0; l--) {
                for (u = 0; u < i; u++) {
                    if (d[4 * (i * l + u) + 3] > 0) {
                        s = l;
                        break;
                    }
                }
                if (s >= 0) break;
            }
            return s - r;
        }
        function Je(e) {
            return Math.floor(e);
        }
        function Ke(e) {
            return e.charAt(0).toUpperCase() + e.slice(1);
        }
        function Qe(e) {
            var t = void 0,
                n = void 0,
                o = void 0,
                i = void 0,
                a = void 0,
                d = void 0,
                r = void 0;
            try {
                var s = e.endDate.split("/");
                (t = s[2]), (n = s[0] - 1), (o = s[1]);
            } catch (e) {
                (t = 0), (n = 0), (o = 0);
            }
            try {
                var l = e.endTime.split(":");
                (i = Ee(l[0])), (a = Ee(l[1]));
            } catch (e) {
                (i = 0), (a = 0);
            }
            try {
                var u = e.timeZoneCode.split(":");
                (d = Ee(u[0])), (r = Ee(u[1]));
            } catch (e) {
                (d = 0), (r = 0);
            }
            return new Date(Date.UTC(t, n, o, i - d, a - r, 0));
        }
        countDownTimer = setInterval(function () {
            (g = Ae()), (c = 0), (H = {}), (A = {}), (v = 0), (W = 0), (x = 0), (O = 0), Le(), ve();
        }, 1e3);
    }
    Object.assign ||
        Object.defineProperty(Object, "assign", {
            enumerable: !1,
            configurable: !0,
            writable: !0,
            value: function (e, t) {
                if (null == e) throw new TypeError("Cannot convert first argument to object");
                for (var n = Object(e), o = 1; o < arguments.length; o++) {
                    var i = arguments[o];
                    if (null != i)
                        for (var a = Object.keys(Object(i)), d = 0, r = a.length; d < r; d++) {
                            var s = a[d],
                                l = Object.getOwnPropertyDescriptor(i, s);
                            void 0 !== l && l.enumerable && (n[s] = i[s]);
                        }
                }
                return n;
            },
        });
    for (var h = "20e582b49b722d3d24816f8eef9f5bbd", e = document.getElementsByClassName(h), i = 0; i < e.length; i++) {
        var n = e[i],
            id = h + "_" + i;
        // if (!document.querySelector('script[src*="https://w.promofeatures.com/js/timer/20e582b49b722d3d24816f8eef9f5bbd"]') && window.location.href.indexOf("https://promofeatures.com") === -1) return;
        if (null === document.getElementById(id)) {
            var s = document.createElement("canvas");
            (s.id = id),
                (s.style.opacity = 0),
                (s.width = 0),
                (s.height = 0),
                n.parentNode.insertBefore(s, n),
                counterCube(
                    localStorage.getItem("counterSettings") == null ?
                    {
                        typeTimer: 7,
                        fontUrl: null,
                        frameColor: "#000000",
                        textColor: "#ffffff",
                        figureColor: "transparent",
                        parentCubeBorderColor: null,
                        parentCubeBorderWidth: null,
                        circleFillColor3: null,
                        circleBorderColorTop: null,
                        circleBorderColorBottom: null,
                        circleBorderWidth: null,
                        smallCircleRadius: null,
                        smallCircleFillColor: null,
                        smallCircleFillColor2: null,
                        countSmallCircles: null,
                        smallLinesHeight: null,
                        smallLineFillColor: null,
                        smallLineFillColor2: null,
                        countSmallLines: null,
                        timeFontSize: "18",
                        timeFontFamily: "Arial",
                        timeFontStyle: "0",
                        registerLetter: "0",
                        timerName: null,
                        endDate: "10/20/2023",
                        endTime: "20:00",
                        timeZone: "Czech Republic",
                        timeZoneCode: "+02:00",
                        lang: "EN",
                        widthFrame: "120",
                        heightFrame: "27",
                        frameColor2: null,
                        timeFontColor: null,
                        timeFontTopPadding: "7",
                        timeFontRightPadding: null,
                        timeFontBottomPadding: null,
                        timeFontLeftPadding: "3",
                        timeSpace: null,
                        labelFontSize: null,
                        labelFontFamily: "0",
                        lableFontColor: "transparent",
                        labelFontTopPadding: null,
                        labelFontRightPadding: null,
                        labelFontBottomPadding: null,
                        labelFontLeftPadding: null,
                        labelFontStyle: "100",
                        labelDay: "DAYS",
                        labelHour: "HOURS",
                        labelMin: "MINUTES",
                        labelSec: "SECONDS",
                        spaceFontSize: null,
                        spaceFontFamily: "0",
                        spaceFontColor: null,
                        spaceFontTopPadding: "3",
                        spaceFontRightPadding: null,
                        spaceFontBottomPadding: null,
                        spaceFontLeftPadding: null,
                        spaceType: ":",
                        smallCubeBorderWidth: "0",
                        smallCubeBorderColor: null,
                        smallCubeColor: null,
                        cubeTopPadding: null,
                        cubeRightPadding: null,
                        cubeBottomPadding: null,
                        cubeLeftPadding: null,
                        parentCubeColor: null,
                        parentCubeColor2: null,
                        parentCubeTopPadding: null,
                        parentCubeRightPadding: null,
                        parentCubeBottomPadding: null,
                        parentCubeLeftPadding: null,
                        circleRadius: null,
                        circleFillColor: null,
                        circleFillColor2: null,
                        smallLinesWidth: null,
                        fixedBar: false,
                        fixedCube: "true",
                        wmr: 0,
                        disableDays: false,
                        disableMilliseconds: false,
                        disableHours: false,
                        disableMinutes: false,
                        disableSeconds: false,
                        transparent: false,
                        reverseLable: false,
                        removeDZero: false,
                        removeHZero: false,
                        removeMZero: false,
                        removeSZero: false,
                        centeredImage: false,
                        uid: "20e582b49b722d3d24816f8eef9f5bbd",
                        disableWM: false,
                    } : JSON.parse(localStorage.getItem("counterSettings")),
                    s
                );
        }
    }
})();