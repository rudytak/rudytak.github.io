void 0 === window.tickcounter &&
    ((window.tickcounter = function () {
        function o(t) {
            t.style.pointerEvents = "auto";
        }
        var t = function (t, e) {
                (t.style.cssText = "pointer-events: auto !important; border: none; margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%;"),
                    "relative" === window.getComputedStyle(e).getPropertyValue("position") && (t.style.cssText += "position: absolute; top: 0; bottom: 0; left: 0; right: 0;"),
                    window.addEventListener("load", function () {
                        o(t),
                            setTimeout(function () {
                                o(t);
                            }, 1e3),
                            setTimeout(function () {
                                o(t);
                            }, 2e3),
                            setTimeout(function () {
                                o(t);
                            }, 5e3);
                    });
            },
            e = [],
            e = Array.prototype.concat.apply(e, document.getElementsByClassName("tcw"));
        e = Array.prototype.concat.apply(e, document.getElementsByClassName("tickcounter"));
        for (var n = 0; n < e.length; ++n) {
            var i = e[n];
            if (!i.hasAttribute("data-loaded")) {
                var a = (a = i).href ? a.host : !(0 === (a = a.getElementsByTagName("a")).length || !a[0].href) && a[0].host;
                if (a) {
                    u = p = c = s = l = d = void 0;
                    var r = i,
                        d = ((r.innerHTML = ""), document.createElement("iframe"));
                    if (r.hasAttribute("data-id")) {
                        var s,
                            c,
                            l = r.getAttribute("data-id"),
                            l =
                                (r.hasAttribute("data-type")
                                    ? ((s = r.getAttribute("data-type")), (c = l), t(d, r))
                                    : ((s = (l = l.split("-"))[0].toLowerCase()),
                                      (c = l[1]),
                                      (d.style.cssText = "pointer-events: auto !important; border: none; margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; display: inline-block;"),
                                      (d.style.cssText += "position: absolute; top: 0; bottom: 0; left: 0; right: 0;")),
                                "//" + a + "/widget/" + s + "/" + c);
                        r.hasAttribute("data-target-override") && (l += "?target-override=" + encodeURIComponent(r.getAttribute("data-target-override"))), (d.title = "TickCounter " + s + " widget"), (d.src = l);
                    } else {
                        t(d, r);
                        var u,
                            p = [];
                        for (u in r.dataset) r.dataset.hasOwnProperty(u) && p.push(u + "=" + encodeURIComponent(r.dataset[u]));
                        d.src = "//" + a + "/widget/?" + p.join("&");
                    }
                    (d.scrolling = "no"), r.appendChild(d), r.setAttribute("data-loaded", "true"), (r.style.pointerEvents = "none");
                } else i.innerHTML = "Please do not remove our link from your embed code.";
            }
        }
    }),
    "loading" === document.readyState
        ? document.addEventListener(
              "DOMContentLoaded",
              function () {
                  window.tickcounter();
              },
              !1
          )
        : window.tickcounter());
