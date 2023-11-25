// both UPPER and lower, you choose
var JSONH, jsonh = JSONH = function (Array, JSON) {
    "use strict"; // if you want

    /**
     * Copyright (C) 2011 by Andrea Giammarchi, @WebReflection
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */

    // transforms [{a:"A"},{a:"B"}] to [1,"a","A","B"]
    function hpack(list) {
        for (var
            length = list.length,
            // defined properties (out of one object is enough)
            keys = Object_keys(length ? list[0] : {}),
            klength = keys.length,
            // static length stack of JS values
            result = Array(length * klength),
            i = 0,
            j = 0,
            ki, o;
            i < length; ++i
        ) {
            for (
                o = list[i], ki = 0;
                ki < klength;
                result[j++] = o[keys[ki++]]
            );
        }
        // keys.length, keys, result
        return concat.call([klength], keys, result);
    }

    // transforms [1,"a","A","B"] to [{a:"A"},{a:"B"}]
    function hunpack(hlist) {
        for (var
            length = hlist.length,
            klength = hlist[0],
            result = Array(((length - klength - 1) / klength) || 0),
            i = 1 + klength,
            j = 0,
            ki, o;
            i < length;
        ) {
            for (
                result[j++] = (o = {}), ki = 0;
                ki < klength;
                o[hlist[++ki]] = hlist[i++]
            );
        }
        return result;
    }

    // recursive: called via map per each item h(pack|unpack)ing each entry through the schema
    function iteratingWith(method) {
        return function iterate(item) {
            for (var
                path = this,
                current = item,
                i = 0, length = path.length,
                j, k, tmp;
                i < length; ++i
            ) {
                if (isArray(tmp = current[k = path[i]])) {
                    j = i + 1;
                    current[k] = j < length ?
                        map.call(tmp, method, path.slice(j)) :
                        method(tmp)
                        ;
                }
                current = current[k];
            }
            return item;
        };
    }

    // called per each schema (pack|unpack)ing each schema
    function packOrUnpack(method) {
        return function parse(o, schema) {
            for (var
                wasArray = isArray(o),
                result = concat.call(arr, o),
                path = concat.call(arr, schema),
                i = 0, length = path.length;
                i < length; ++i
            ) {
                result = map.call(result, method, path[i].split("."));
            }
            return wasArray ? result : result[0];
        };
    }

    // JSONH.pack
    function pack(list, schema) {
        return schema ? packSchema(list, schema) : hpack(list);
    }

    // JSONH unpack
    function unpack(hlist, schema) {
        return schema ? unpackSchema(hlist, schema) : hunpack(hlist);
    }

    // JSON.stringify after JSONH.pack
    function stringify(list, replacer, space, schema) {
        return JSON_stringify(pack(list, schema), replacer, space);
    }

    // JSONH.unpack after JSON.parse
    function parse(hlist, reviver, schema) {
        return unpack(JSON_parse(hlist, reviver), schema);
    }

    var
        // recycled for different operations
        arr = [],
        // trapped once reused forever
        concat = arr.concat,
        // addressed cross platform Object.keys shim
        Object_keys = Object.keys || function (o) {
            var keys = [], key;
            for (key in o) o.hasOwnProperty(key) && keys.push(key);
            return keys;
        },
        // addressed cross platform Array.isArray shim
        isArray = Array.isArray || (function (toString, arrayToString) {
            arrayToString = toString.call(arr);
            return function isArray(o) {
                return toString.call(o) == arrayToString;
            };
        }({}.toString)),
        // fast and partial Array#map shim
        map = arr.map || function (callback, context) {
            for (var
                self = this, i = self.length, result = Array(i);
                i--;
                result[i] = callback.call(context, self[i], i, self)
            );
            return result;
        },
        // schema related (pack|unpack)ing operations
        packSchema = packOrUnpack(iteratingWith(hpack)),
        unpackSchema = packOrUnpack(iteratingWith(hunpack)),
        // JSON object shortcuts
        JSON_stringify = JSON.stringify,
        JSON_parse = JSON.parse
        ;

    return {
        pack: pack,
        parse: parse,
        stringify: stringify,
        unpack: unpack
    };

}(Array, JSON);

var jsscompress = jsscompress || {};
(function (jss) {
    jss.exchange = function (a, i, j) {
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    };

    var HauffNode = function (config) {
        var config = config || {};
        if (!config.left) {
            config.left = null;
        }
        if (!config.right) {
            config.right = null;
        }
        if (!config.freq) {
            config.freq = 0;
        }
        if (!config.key) {
            config.key = 0;
        }
        this.left = config.left;
        this.right = config.right;
        this.freq = config.freq;
        this.key = config.key;
    };

    HauffNode.prototype.isLeaf = function () {
        return this.left == null && this.right == null;
    };

    jss.HauffNode = HauffNode;
    var Hauffman = function () {
        this.root = null;
    };

    var QueueNode = function (item) {
        this.value = item;
        this.next = null;
    };

    jss.QueueNode = QueueNode;

    var Queue = function () {
        this.first = null;
        this.last = null;
        this.N = 0;
    };

    Queue.prototype.enqueue = function (item) {
        var oldLast = this.last;
        this.last = new jss.QueueNode(item);
        if (oldLast != null) {
            oldLast.next = this.last;
        }
        if (this.first == null) {
            this.first = this.last;
        }
        this.N++;
    };

    Queue.prototype.dequeue = function () {
        var oldFirst = this.first;
        if (oldFirst == null) {
            return undefined;
        }
        var item = oldFirst.value;
        this.first = oldFirst.next;
        if (this.first == null) {
            this.last = null;
        }
        this.N--;
        return item;
    };

    Queue.prototype.size = function () {
        return this.N;
    };

    Queue.prototype.isEmpty = function () {
        return this.N == 0;
    };

    jss.Queue = Queue;

    var MinPQ = function (compare) {
        this.s = [];
        this.N = 0;
        if (!compare) {
            compare = function (a1, a2) {
                return a1 - a2;
            };
        }
        this.compare = compare;
    };

    MinPQ.prototype.enqueue = function (item) {
        if (this.N + 1 >= this.s.length) {
            this.resize(this.s.length * 2);
        }
        this.s[++this.N] = item;
        this.swim(this.N);
    };

    MinPQ.prototype.delMin = function () {
        if (this.N == 0) {
            return undefined;
        }
        var item = this.s[1];
        jss.exchange(this.s, 1, this.N--);
        this.sink(1);
        if (this.N == Math.floor(this.s.length / 4)) {
            this.resize(Math.floor(this.s.length / 2));
        }
        return item;
    };

    MinPQ.prototype.sink = function (k) {
        while (k * 2 <= this.N) {
            var child = k * 2;
            if (child < this.N && this.compare(this.s[child + 1], this.s[child]) < 0) {
                child += 1;
            }
            if (this.compare(this.s[child], this.s[k]) < 0) {
                jss.exchange(this.s, child, k);
                k = child;
            } else {
                break;
            }
        }
    };

    MinPQ.prototype.size = function () {
        return this.N;
    };

    MinPQ.prototype.isEmpty = function () {
        return this.N == 0;
    };

    MinPQ.prototype.resize = function (len) {
        var temp = [];
        for (var i = 0; i < len; ++i) {
            if (i < this.s.length) {
                temp.push(this.s[i]);
            } else {
                temp.push(0);
            }
        }
        this.s = temp;
    };

    MinPQ.prototype.swim = function (k) {
        while (k > 1) {
            parent = Math.floor(k / 2);
            if (this.compare(this.s[k], this.s[parent]) < 0) {
                jss.exchange(this.s, k, parent);
                k = parent;
            } else {
                break;
            }
        }
    };
    jss.MinPQ = MinPQ;

    Hauffman.prototype.readTrie = function (bitStream) {
        var bit = bitStream.dequeue();
        if (bit == 1) {
            return new jss.HauffNode({
                key: this.readChar(bitStream)
            });
        }
        var left = this.readTrie(bitStream);
        var right = this.readTrie(bitStream);
        return new jss.HauffNode({
            left: left,
            right: right
        });
    };

    Hauffman.prototype.readChar = function (bitStream) {

        var cc = 0;
        for (var i = 0; i < 8; ++i) {
            var bit = 0;
            if (!bitStream.isEmpty()) {
                bit = bitStream.dequeue();
            }
            cc = cc * 2 + bit;
        }
        return cc;
    };

    Hauffman.prototype.writeChar = function (cc, bitStream) {
        var temp = [];
        for (var i = 0; i < 8; ++i) {
            var bit = cc % 2;
            temp.push(bit);
            cc = Math.floor(cc / 2);
        }

        for (var i = temp.length - 1; i >= 0; --i) {
            var bit = temp[i];
            bitStream.enqueue(bit);
        }
    };

    Hauffman.prototype.writeTrie = function (x, bitStream) {
        if (x.isLeaf()) {
            bitStream.enqueue(1);
            this.writeChar(x.key, bitStream);
            return;
        }
        bitStream.enqueue(0);
        this.writeTrie(x.left, bitStream);
        this.writeTrie(x.right, bitStream);
    };

    Hauffman.prototype.buildTrie = function (text) {
        var freq = {};
        for (var i = 0; i < text.length; ++i) {
            var cc = text.charCodeAt(i);
            if (cc in freq) {
                freq[cc] += 1;
            } else {
                freq[cc] = 1;
            }
        }

        var pq = new jss.MinPQ(function (node1, node2) {
            return node1.freq - node2.freq;
        });
        for (var cc in freq) {
            var count = freq[cc];
            var node = new jss.HauffNode({
                freq: count,
                key: cc
            });
            pq.enqueue(node);
        }

        while (pq.size() > 1) {
            var node1 = pq.delMin();
            var node2 = pq.delMin();
            var new_node = new jss.HauffNode({
                left: node1,
                right: node2,
                freq: node1.freq + node2.freq
            });
            pq.enqueue(new_node);
        }
        return pq.delMin();
    };

    Hauffman.prototype.buildCode = function (x, s, code) {
        if (x == null) {
            return;
        }

        if (x.isLeaf()) {
            code[x.key] = s;
            return;
        }
        this.buildCode(x.left, s + "0", code);
        this.buildCode(x.right, s + "1", code);
    };

    Hauffman.prototype.compressToBinary = function (text) {
        var trie = this.buildTrie(text);
        var code = {};
        this.buildCode(trie, "", code);
        var bitStream = new jss.Queue();
        this.writeTrie(trie, bitStream);
        for (var i = 0; i < text.length; ++i) {
            var s = text.charCodeAt(i);
            var cc = code[s];
            for (var j = 0; j < cc.length; ++j) {
                var bit = cc.charAt(j) == "0" ? 0 : 1;
                bitStream.enqueue(bit);
            }
        }

        return bitStream;
    };

    Hauffman.prototype.compress = function (text) {
        var bitStream = this.compressToBinary(text);
        var result = "";
        while (!bitStream.isEmpty()) {
            var cc = this.readChar(bitStream);
            result = result + String.fromCharCode(cc);
        }
        return result;
    };

    Hauffman.prototype.decompressFromBinary = function (bitStream) {
        var trie = this.readTrie(bitStream);
        var code = {};
        this.buildCode(trie, "", code);
        var rcode = {};
        for (var cc in code) {
            rcode[code[cc]] = cc;
        }
        var text = "";
        var key = "";
        while (!bitStream.isEmpty()) {
            var bit = bitStream.dequeue();
            if (bit == 0) {
                key = key + "0";
            } else {
                key = key + "1";
            }
            if (key in rcode) {
                text = text + String.fromCharCode(rcode[key]);
                key = "";
            }
        }
        return text;
    };

    Hauffman.prototype.decompress = function (compressed) {
        var bitStream = new jss.Queue();
        for (var i = 0; i < compressed.length; ++i) {
            var cc = compressed.charCodeAt(i);
            this.writeChar(cc, bitStream);
        }
        return this.decompressFromBinary(bitStream);
    }

    jss.Hauffman = Hauffman;

})(jsscompress);

// export for node.js
if (typeof module != 'undefined' && module.exports) {
    module.exports = jsonh;
    module.exports = jsscompress;
}

// ENCODING AND DECODING
function smart_JSON_stringify(form) {
    return JSON.stringify({
        t: form.title,
        u: form.currency,
        b: form.base_price,
        p: JSONH.stringify(
            form.pages.map(pa => {
                return {
                    n: pa.name,
                    b: pa.background,
                    p: pa.properties.map(pr => {
                        return {
                            n: pr.name,
                            t: pr.type,
                            o: pr.options.map(op => {
                                if (pr.type == "swatch") {
                                    return {
                                        n: op.name,
                                        p: op.price,
                                        o: op.overlay_img,
                                        s: op.swatch_img,
                                    }
                                } else {
                                    return {
                                        n: op.name,
                                        p: op.price,
                                        o: op.overlay_img,
                                        d: op.description
                                    }
                                }
                            })
                        }
                    })
                }
            })
        ),
        c: JSONH.stringify(form.constraints)
    })
}
function smart_JSON_parse(str) {
    let o = JSON.parse(str)
    return {
        title: o.t,
        currency: o.u,
        base_price: parseFloat(o.b),
        pages: JSONH.parse(o.p).map(pa => {
            return {
                name: pa.n,
                background: pa.b,
                properties: pa.p.map(pr => {
                    return {
                        name: pr.n,
                        type: pr.t,
                        options: pr.o.map(op => {
                            if (pr.t == "swatch") {
                                return {
                                    name: op.n,
                                    price: parseFloat(op.p),
                                    overlay_img: op.o,
                                    swatch_img: op.s
                                }
                            } else {
                                return {
                                    name: op.n,
                                    price: parseFloat(op.p),
                                    overlay_img: op.o,
                                    description: op.d
                                }
                            }
                        })
                    }
                }),
            }
        }),
        constraints: JSONH.parse(o.c)
    }
}

function encode_form(form_json) {
    return encodeURIComponent(btoa(smart_JSON_stringify(form_json)));
}

function decode_form(form_b64) {
    return smart_JSON_parse(atob(decodeURIComponent(form_b64)));
}

const WIDGET_URL = "https://rudytak.github.io/cdn/hazargulhan543/widget/";
const KV_ENDPOINT = "https://wix-widget-kv.hazar-b92.workers.dev";
const default_form_b64 = encode_form({
    title: "FORM_TITLE",
    currency: "USD",
    base_price: 0,
    pages: [],
    constraints: []
});
const currency_map = {
    USD: "$",
    EUR: "€",
    JPY: "¥",
    GBP: "£",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
};

const localStorage_key = "FORM_B64";