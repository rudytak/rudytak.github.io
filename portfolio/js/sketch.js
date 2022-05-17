function main() {
    document.documentElement.style.setProperty('--primary-col', settings.settings.palette[0]);
    document.documentElement.style.setProperty('--secondary-col', settings.settings.palette[1]);
    document.documentElement.style.setProperty('--accent-col-1', settings.settings.palette[2]);
    document.documentElement.style.setProperty('--accent-col-2', settings.settings.palette[3]);
    document.documentElement.style.setProperty('--accent-col-3', settings.settings.palette[4]);

    document.documentElement.style.setProperty('--text-col', settings.settings.palette[5]);

    render_text();
    init_collapsibility();
}

function init_collapsibility() {
    var collapsibles = Array.from(document.getElementsByClassName("collapsible"));

    for (var c of collapsibles) {
        c.onclick = (ev) => {
            var collapsible = ev.target;
            var collapser = collapsible.parentNode;
            var collapsed = Array.from(collapser.childNodes).filter((x) => {
                if (x.classList) {
                    return x.classList.contains("collapsed")
                }
                return false
            });

            if (collapsible.collapsed == "true") {
                collapsible.collapsed = "false"

                c.open_styleEl = addStylesheetRules([
                    [`#${collapsible.id}::after`, ["animation-name", "recollapse_tri"]]
                ])

                if (c.close_styleEl) {
                    if (c.close_styleEl.sheet != null) c.close_styleEl.sheet.deleteRule(0);
                    if (c.close_styleEl.parentNode != null) c.close_styleEl.parentNode.removeChild(c.close_styleEl);
                }

                for (var ch of collapsed) {
                    ch.style.animationName = "decollapse";
                    ch.classList.add("active")
                }
            } else {
                collapsible.collapsed = "true"

                c.close_styleEl = addStylesheetRules([
                    [`#${collapsible.id}::after`, ["animation-name", "decollapse_tri"]]
                ])

                if (c.open_styleEl) {
                    if (c.open_styleEl.sheet != null) c.open_styleEl.sheet.deleteRule(0);
                    if (c.open_styleEl.parentNode != null) c.open_styleEl.parentNode.removeChild(c.open_styleEl);
                }

                for (const ch of collapsed) {
                    ch.style.animationName = "recollapse";
                    setTimeout(() => {
                        ch.classList.remove("active")
                    }, 500)
                }
            }

        }

        c.collapsed = "true";
        c.id = "collapsible_" + collapsibles.indexOf(c).toString();
    }
}

function render_text() {
    const c = document.getElementById("content");
    c.innerHTML = `
        <div class="fs-70px">${settings.personal_info.title} ${settings.personal_info.name}</div>
        <div class="inset">
            <div class="collapser">
                <div class="collapsible">${settings.personal_info.self_definition}</div>
                <div class="collapsed">Experience: ${settings.personal_info.experience}</div>
                <div class="collapsed tech_icons">Fields: ${concetanate_tech(settings.personal_info.fields)}</div>
            </div>
        </div>

        <br>

        <div class="collapser">
            <div class="collapsible">Contacts</div>
            <div class="collapsed">Email: <a href="mailto: ${settings.contacts.email}" target="_blank">${settings.contacts.email}</a></div>
            <div class="collapsed">Github: ${linkify(settings.contacts.github)}</div>
        </div>

        <br>

        ${render_category(settings.projects)}
    `;
}

function render_category(c, also_collapsed = false) {
    return `
        <div class="collapser${also_collapsed?" collapsed":""}">
            <div class="collapsible">${c.category_name}</div>
            ${
                (()=>{
                    if (c.projects && c.projects.length > 0) return c.projects.map((a)=>render_project(a)).reduce((a,b) => a+b)
                    else return ""
                })()
            }
            ${
                (()=>{
                    if (c.sub_categories && c.sub_categories.length > 0) return c.sub_categories.map((a)=>render_category(a, true)).reduce((a,b) => a+b)
                    else return ""
                })()
            }
        </div>
    `
}

function render_project(p) {
    return p.active == "false" ? "" : `
        <div class="collapser collapsed">
            <div class="collapsible">${p.name}</div>
            <div class="collapsed">${p.description + "<br><br>"}</div>
            <div class="collapsed">
                ${p.link?linkify(p.link, p):""}
                <div class="inset">
                    ${
                        (()=>{
                            if (p.secondary_links && p.secondary_links.length > 0) return p.secondary_links.map((a)=>linkify(a)).reduce((a,b) => a+"\n"+b)
                            else return ""
                        })()
                    }
                </div>
            </div>

            <div class="collapsed">
                ${p.source_code?linkify(p.source_code, {name: "Source code"}):""}
            </div>

            <div class="collapsed tech_icons">Technologies: 
                ${concetanate_tech(p.tech)}
            </div>

            ${
                p.secret?
                `<div class="collapser collapsed">
                    <div class="collapsible">Secret info</div>
                    ${list_out(p.secret)}
                </div>`:""
            }
            
            <div class="collapsed"><br></div>
        </div>
    `
}