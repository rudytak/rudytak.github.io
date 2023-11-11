// FORM DISPLAY
let form;
let page_id = 0;
function loadForm(form_b64) {
    // temporary
    form = decode_form(form_b64);

    // set form title and currency
    document.getElementById("FORM_TITLE").innerText = form.title;
    document.querySelector(':root').style.setProperty('--currency_symbol', `'${currency_map[form.currency]}'`);

    page_id = 0;
    check_arrows();

    displayPage();
}

function displayPage() {
    let page = form.pages[page_id];

    // set the name
    let properties_wrapper = document.getElementById("PROPERTIES");
    properties_wrapper.innerHTML = `<div id="PAGE_NAME" class="entry">${page.name}</div>`

    // add in all the property selections
    for (let pr = 0; pr < page.properties.length; pr++) {
        let prop = page.properties[pr];
        let selected = getSelected(page_id, pr);

        if (prop.type == "swatch") {
            properties_wrapper.innerHTML += `
                <div class="entry ${isCollapsed(page_id, pr) ? 'collapsed' : ''}">
                    <div class="row header">
                        <div class="title">${prop.name}</div>
                        <div class="selected_name">${selected.name}</div>
                        <div class="collapse_btn" onclick='collapse(${page_id}, ${pr});'></div>
                        <div class="price">${selected.price}</div>
                    </div>
                    <div class="row swatch">
                        ${prop.options.map((option, op) => `
                                <div class="option swatch
                                    ${isSelected(page_id, pr, op) ? 'selected' : ''}"
                                    onclick = 'selectOption(${page_id}, ${pr}, ${op});'
                                    style="--img-src: url('${option.swatch_img}');">
                                </div>`
            ).join("")
                }
                    </div>
                </div>
            `
        } else {
            properties_wrapper.innerHTML += `
                <div class="entry ${isCollapsed(page_id, pr) ? 'collapsed' : ''}">
                    <div class="row header">
                        <div class="title">${prop.name}</div>
                        <div class="selected_name">${selected.name}</div>
                        <div class="collapse_btn" onclick='collapse(${page_id}, ${pr});'></div>
                        <div class="price">${selected.price}</div>
                    </div>
                    <div class="row text">
                        ${prop.options.map((option, op) => `
                                <div class="option text
                                    ${isSelected(page_id, pr, op) ? 'selected' : ''}"
                                    onclick = 'selectOption(${page_id}, ${pr}, ${op});'>
                                    ${option.name}
                                    <p>${option.description}</p>
                                </div>`
            ).join("")
                }
                    </div>
                </div>
            `
        }
    }

    apply_constraints();
    redraw_canvas();
}

function apply_constraints() {
    // lift all restrictions
    document.querySelectorAll(".option.restricted").forEach(element => {
        element.classList.remove("restricted");
    });

    form.constraints.forEach((constraint, c) => {
        if (isSelected(
            constraint.control_state[0],
            constraint.control_state[1],
            constraint.control_state[2]
        )) {
            if (constraint.target_state[0] == page_id) {
                for (var o = 0; o < form.pages[constraint.target_state[0]].properties[constraint.target_state[1]].options.length; o++) {
                    if (o != constraint.target_state[2]) {
                        document.querySelectorAll(`#PROPERTIES > div.entry:nth-child(${constraint.target_state[1] + 2}) div.option:nth-child(${o + 1})`)[0].classList.add("restricted");
                    }
                }

                if (!isSelected(
                    constraint.target_state[0],
                    constraint.target_state[1],
                    constraint.target_state[2]
                )) {
                    selectOption(
                        constraint.target_state[0],
                        constraint.target_state[1],
                        constraint.target_state[2]
                    )
                }
            }
        }
    })
}

// PAGINATION
function check_arrows() {
    document.querySelector(".arrow.left").classList.remove("disabled");
    document.querySelector(".arrow.right").classList.remove("disabled");

    if (page_id == 0) {
        document.querySelector(".arrow.left").classList.add("disabled");
    }
    if (page_id == form.pages.length - 1) {
        document.querySelector(".arrow.right").classList.add("disabled");
    }
}
function page_right() {
    if (page_id < form.pages.length - 1) {
        page_id++;
        displayPage();
    }
    check_arrows();
}
function page_left() {
    if (page_id > 0) {
        page_id--;
        displayPage();
    }
    check_arrows();
}

// OPTION SELECTION
let selections = {};
function checkSelectionObjectInit(page_id, prop_id) {
    if (selections[page_id] == undefined) selections[page_id] = {};
    if (selections[page_id][prop_id] == undefined) selections[page_id][prop_id] = 0;
}
function selectOption(page_id, prop_id, option_id) {
    checkSelectionObjectInit(page_id, prop_id);
    selections[page_id][prop_id] = option_id;

    // update selection html
    document.querySelectorAll(".selected")[prop_id].classList.remove("selected");
    document.querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2}) div.option:nth-child(${option_id + 1})`)[0].classList.add("selected");
    document.querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2}) div.selected_name`)[0].innerText = getSelected(page_id, prop_id).name;
    document.querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2}) div.price`)[0].innerText = getSelected(page_id, prop_id).price;

    apply_constraints();

    // redraw the canvas look
    redraw_canvas();
}
function isSelected(page_id, prop_id, option_id) {
    checkSelectionObjectInit(page_id, prop_id);
    return selections[page_id][prop_id] == option_id;
}
function getSelected(page_id, prop_id) {
    checkSelectionObjectInit(page_id, prop_id);
    return form.pages[page_id].properties[prop_id].options[selections[page_id][prop_id]];
}

// options collapse
let collapsed = {};
function checkCollapseObjectInit(page_id, prop_id) {
    if (collapsed[page_id] == undefined) collapsed[page_id] = {};
    if (collapsed[page_id][prop_id] == undefined) collapsed[page_id][prop_id] = false;
}
function isCollapsed(page_id, prop_id) {
    checkCollapseObjectInit(page_id, prop_id);
    return collapsed[page_id][prop_id];
}
function collapse(page_id, prop_id) {
    checkCollapseObjectInit(page_id, prop_id);
    collapsed[page_id][prop_id] = !collapsed[page_id][prop_id];

    // update collapse html
    if (collapsed[page_id][prop_id]) {
        document.querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2})`)[0].classList.add("collapsed");
    } else {
        document.querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2})`)[0].classList.remove("collapsed");
    }
}


// CANVAS HELPER
let canv = document.getElementById("BG_IMG");
let ctx = canv.getContext("2d");
// width and height getters
Object.defineProperty(CanvasRenderingContext2D.prototype, "w", {
    get: function w() {
        return this.canvas.getBoundingClientRect().width;
    }
});
Object.defineProperty(CanvasRenderingContext2D.prototype, "h", {
    get: function h() {
        return this.canvas.getBoundingClientRect().height;
    }
});

// handling images
let imgs_cache = {};
async function loadImg(url) {
    return new Promise((res, rej) => {
        var img = new Image;
        img.src = url;
        imgs_cache[url] = img;
        img.onload = res;
    })
}
async function getImg(url) {
    if (imgs_cache[url] == undefined) {
        // load and cache the img
        await loadImg(url);
    }
    return imgs_cache[url];
}
function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// CANVAS
async function redraw_canvas() {
    // start the loading animation
    startLoading();
    // ctx.clearRect(0,0,canvas.width, canvas.height);

    if (!form) return;

    // make sure all the images are cached
    let bg = await getImg(form.pages[page_id].background)
    for (let pr = 0; pr < form.pages[page_id].properties.length; pr++) {
        await getImg(getSelected(page_id, pr).overlay_img);
    }

    // stop the loading animation
    stopLoading();

    // wait for a bit to finisht he last animation request
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    await sleep(resize_interval);

    // draw the background image for this page
    drawImageScaled(bg, ctx)
    // overlay all the selected images

    for (let pr = 0; pr < form.pages[page_id].properties.length; pr++) {
        drawImageScaled(await getImg(getSelected(page_id, pr).overlay_img), ctx);
    }
}

// Canvas loading animation
let isLoading = false;
var progress = 0;
function loading() {
    // ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "rgba(0,0,0,0)";

    progress += 0.0025;
    if (progress > 1) {
        progress = 0;
    }

    var bigCircle = {
        center: {
            x: ctx.w / 2,
            y: ctx.h / 2
        },
        radius: 50,
        speed: 4
    }

    var smallCircle = {
        center: {
            x: ctx.w / 2,
            y: ctx.h / 2
        },
        radius: 30,
        speed: 2
    }

    function accelerateInterpolator(x) {
        return x * x;
    }

    function decelerateInterpolator(x) {
        return 1 - ((1 - x) * (1 - x));
    }

    function drawCircle(circle, progress) {
        ctx.beginPath();
        var start = accelerateInterpolator(progress) * circle.speed;
        var end = decelerateInterpolator(progress) * circle.speed;
        ctx.arc(circle.center.x, circle.center.y, circle.radius, (start - 0.5) * Math.PI, (end - 0.5) * Math.PI);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fill();
        ctx.stroke();
    }

    drawCircle(bigCircle, progress);
    drawCircle(smallCircle, progress);

    if (isLoading) {
        requestAnimationFrame(loading);
    }
}

function startLoading() {
    if (isLoading) return;

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "rgba(0,0,0,0)";

    isLoading = true;
    progress = 0;
    loading();
}
function stopLoading() {
    isLoading = false;
}

// Canvas resizing
let attempting_resize = false;
let last_att_time = 0;
let interval_id = -1;
let resize_interval = 100;
function resizeCanvas(init = false) {
    canv.width = ctx.w;
    canv.height = ctx.h;

    if (!attempting_resize) {
        startLoading();

        interval_id = setInterval(
            () => {
                if (Date.now() - last_att_time > resize_interval) {
                    redraw_canvas();
                    attempting_resize = false
                    clearInterval(interval_id);
                    if (!init) stopLoading();
                }
            },
            10
        )
    }

    attempting_resize = true;
    last_att_time = Date.now();
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas(true);

// IFRAME COMMUNICATION

// COMMUNICATION PROTOCOL
// event.data = stringified JSON like this:
//
// {
//     action: "parse",
//     code: "B64 form code"
// }

window.addEventListener(
    "message",
    (event) => {
        try {
            let json = JSON.parse(event.data);

            if (!json.action) return;

            // determine which function to call from the action
            if (json.action == "parse") {
                loadForm(json.code);
            }
        } catch (error) {
            return;
        }
    },
    false,
);
