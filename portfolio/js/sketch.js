function main(){
    document.documentElement.style.setProperty('--text-col', settings.settings.palette[3]);

    //render_text();
    init_collapsibility();
}

function init_collapsibility(){
    var collapsibles = Array.from(document.getElementsByClassName("collapsible"));

    for(var c of collapsibles){

        c.onclick = (ev)=>{
            var collapsible = ev.target;
            var collapser = collapsible.parentNode;
            var collapsed = Array.from(collapser.childNodes).filter((x)=>x.classList?.contains("collapsed"));

            if (collapsible.collapsed == "true"){
                collapsible.collapsed = "false"

                c.open_styleEl = addStylesheetRules([
                    [`#${collapsible.id}::after`,["animation-name", "recollapse_tri"]]
                ])

                if (c.close_styleEl){
                    if (c.close_styleEl.sheet != null) c.close_styleEl.sheet.deleteRule(0);
                    if (c.close_styleEl.parentNode != null) c.close_styleEl.parentNode.removeChild(c.close_styleEl);
                }

                for(var ch of collapsed){
                    ch.style.animationName = "decollapse";
                    ch.classList.add("active")
                }
            }else{
                collapsible.collapsed = "true"

                c.close_styleEl = addStylesheetRules([
                    [`#${collapsible.id}::after`,["animation-name", "decollapse_tri"]]
                ])

                if (c.open_styleEl){
                    if (c.open_styleEl.sheet != null) c.open_styleEl.sheet.deleteRule(0);
                    if (c.open_styleEl.parentNode != null) c.open_styleEl.parentNode.removeChild(c.open_styleEl);
                }

                for(const ch of collapsed){
                    ch.style.animationName = "recollapse";
                    setTimeout(()=>{
                        ch.classList.remove("active")
                    }, 500)
                }
            }

        }

        c.collapsed = "true";
        c.id = "collapsible_" + collapsibles.indexOf(c).toString();
    }
}

function render_text(indent = 2){
    const c = document.getElementById("content");
    c.innerHTML = "";


}

function render_category(category, depth = 0, indent = 2){
    const c = document.getElementById("content");

    var _h = depth + 1;

    c.innerHTML += `
    `

}

function addStylesheetRules (rules) {
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