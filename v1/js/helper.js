function addStylesheetRules(rules) {
    var styleEl = document.createElement('style');

    // Append <style> element to <head>
    document.head.appendChild(styleEl);

    // Grab style element's sheet
    var styleSheet = styleEl.sheet;

    for (var i = 0; i < rules.length; i++) {
        var j = 1,
            rule = rules[i],
            selector = rule[0],
            propStr = '';
        // If the second argument of a rule is an array of arrays, correct our variables.
        if (Array.isArray(rule[1][0])) {
            rule = rule[1];
            j = 0;
        }

        for (var pl = rule.length; j < pl; j++) {
            var prop = rule[j];
            propStr += prop[0] + ': ' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
        }

        // Insert CSS Rule
        styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
    }

    return styleEl;
}

function capitalize(text) {
    return text[0].toUpperCase() + text.toLowerCase().slice(1)
}

function concetanate_tech(arr) {
    return "#" + arr.join("# #") + "#"
}

function list_out(o) {
    return Object.keys(o).map(k => `<div class="collapsed">${capitalize(k)}: ${o[k]}</div>`).reduce((a, b) => a + "\n" + b)
}

function linkify(link, p = { name: "project here" }) {
    if (link.includes("http")) {
        return `<a href="${link}" target="_blank">${link}</a>`
    } else {
        return `<a href="${link}" target="_blank">${p.name}</a>`
    }
}