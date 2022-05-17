function main(){
    document.documentElement.style.setProperty('--text-col', settings.settings.palette[3]);

    //render_text();
    init_collapsibility();
}

function init_collapsibility(){
    var collapsibles = Array.from(document.getElementsByClassName("collapsible"));
    print(collapsibles)

    for(var c of collapsibles){
        c.onclick = (ev)=>{
            var collapsible = ev.target;
            var collapser = collapsible.parentNode;
            var collapsed = Array.from(collapser.childNodes).filter((x)=>x.classList?.contains("collapsed"));

            console.log(collapsible, collapsible.collapsed, collapser, collapsed)


            if (collapsible.collapsed == "true"){
                collapsible.collapsed = "false"

                for(var ch of collapsed){
                    ch.classList.add("active")
                }
            }else{
                collapsible.collapsed = "true"

                for(var ch of collapsed){
                    ch.classList.remove("active")
                }
            }
        }
        c.collapsed = "true";
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