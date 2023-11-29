// FORM DISPLAY
let form;
let page_id = 0;
function loadForm(form_b64) {
  // temporary
  form = decode_form(form_b64);

  // set form title and currency
  document.getElementById("FORM_TITLE").innerText = form.title;
  document
    .querySelector(":root")
    .style.setProperty("--currency_symbol", `'${currency_map[form.currency]}'`);

  page_id = 0;
  check_arrows();

  displayPage();
}

let URL_KEY = "unknown";
async function tryLoadFromURL() {
  let u = new URL(window.location);
  let key = u.searchParams.get("key");

  if (key == null) return;
  URL_KEY = key;
  console.log(URL_KEY);

  let res = await fetch(`${KV_ENDPOINT}/get?key=${key}`).then((res) =>
    res.json()
  );

  if (res.type != "KEY_VAL_PAIR") return;

  loadForm(res.res.value);
}

async function place_order() {
  document.getElementById("place_order_idle_indicator").style.display = "none";
  document.getElementById("place_order_loading_indicator").style.display = "";

  try {
    let res = await fetch(`${KV_ENDPOINT}/place_order`, {
      method: "POST",
      body:
        getSummary() +
        `
PERSONAL INFORMATION:
First name: ${document.getElementById("contact_first_name").value}
Last name: ${document.getElementById("contact_last_name").value}
Email: ${document.getElementById("contact_email").value}
Phone number: ${document.getElementById("contact_phone").value}

Address:
First line: ${document.getElementById("address_first_line").value}
Second line: ${document.getElementById("address_second_line").value}
State/Province: ${document.getElementById("address_state_province").value}
City: ${document.getElementById("address_city").value}
ZIP code: ${document.getElementById("address_zip").value}
Country: ${document.getElementById("address_country").value}
`,
    }).then((response) => response.json());

    if (res.type == "PLACED_ORDER") {
      // SUCCESS
      document.getElementById("contacts").style.display = "none";
      document.getElementById("TOTAL_PRICE").style.opacity = 0;
      document.getElementById("finish_btn").style.opacity = 0;

      document.getElementById(
        "order_number"
      ).innerText = `Your order number is: ${res.res.order_number}`;
    } else {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error(
        "An error ocurred during the order. Please contact customer support or try again later."
      );
    }
  } catch (error) {
    alertify.set("notifier", "position", "bottom-left");
    alertify.error(
      "An error ocurred during the order. Please contact customer support or try again later."
    );
  }

  document.getElementById("place_order_idle_indicator").style.display = "";
  document.getElementById("place_order_loading_indicator").style.display =
    "none";
}

function check_contact_inputs() {
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ) != null;
  };

  const validatePhone = (phone) => {
    return phone.length >= 9
  }

  let requiredAreFilled = Array.from(document.querySelectorAll(".contact_input input[required]")).every(el=>el.value != "");
  let emailValid = validateEmail(document.getElementById("contact_email").value);
  let phoneValid = validatePhone(document.getElementById("contact_phone").value);

  if(requiredAreFilled && emailValid && phoneValid){
    document.getElementById("place_order").classList.remove("disabled");

    document.getElementById("place_order_disabled_indicator").style.display = "none";
    document.getElementById("place_order_idle_indicator").style.display = "";
  }else{
    document.getElementById("place_order").classList.add("disabled");

    document.getElementById("place_order_disabled_indicator").style.display = "";
    document.getElementById("place_order_idle_indicator").style.display = "none";
  }
}

function force_phone_numbers(){
  document.getElementById("contact_phone").value = String("0" + document.getElementById("contact_phone").value).match(/\+|\d+/g).join("").slice(1)
}

function selectedPrice() {
  return form.pages
    .map((p_ob, p) =>
      p_ob.properties.map((pr_ob, pr) =>
        pr_ob.options.filter((op_ob, op) => isSelected(p, pr, op))
      )
    )
    .flat(2)
    .map((op) => op.price)
    .reduce((a, b) => a + b);
}

function numberWithCommas(x, decimal_digits = 2) {
  x =
    Math.round(Math.pow(10, decimal_digits) * x) / Math.pow(10, decimal_digits);
  return x
    .toFixed(decimal_digits)
    .toString()
    .replace(/\B(?=(\d{3})+\D)/g, ",");
}

function updateHeaderValues() {
  document.getElementById("PAGE_NAME").innerText = form.pages[page_id].name;
  document.getElementById("TOTAL_PRICE").innerText = `${numberWithCommas(
    form.base_price + selectedPrice()
  )} ${currency_map[form.currency]}`;
}

function displayPage() {
  let page = form.pages[page_id];

  // set the name
  let properties_wrapper = document.getElementById("PROPERTIES");
  // properties_wrapper.innerHTML = `<div id="PAGE_NAME" class="entry">${page.name}</div>`;
  properties_wrapper.innerHTML = `<div class="entry" style="display:none; height: 0; padding: 0; margin: 0;"></div>`;

  updateHeaderValues();

  // add in all the property selections
  for (let pr = 0; pr < page.properties.length; pr++) {
    let prop = page.properties[pr];
    let selected = getSelected(page_id, pr);

    if (prop.type == "swatch") {
      properties_wrapper.innerHTML += `
                <div class="entry ${
                  isCollapsed(page_id, pr) ? "collapsed" : ""
                }">
                    <div class="row header header_swatch">
                        <div class="title">${prop.name}</div>
                        <div class="selected_name">${selected.name}</div>
                        <div class="collapse_btn" onclick='collapse(${page_id}, ${pr});'></div>
                        <div class="price">${numberWithCommas(
                          selected.price
                        )}</div>
                    </div>
                    <div class="row swatch">
                        ${prop.options
                          .map(
                            (option, op) => `
                                <div class="option swatch
                                    ${
                                      isSelected(page_id, pr, op)
                                        ? "selected"
                                        : ""
                                    }"
                                    onclick = 'selectOption(${page_id}, ${pr}, ${op});'
                                    style="--img-src: url('${
                                      option.swatch_img
                                    }');">
                                </div>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
    } else {
      properties_wrapper.innerHTML += `
                <div class="entry ${
                  isCollapsed(page_id, pr) ? "collapsed" : ""
                }">
                    <div class="row header header_text">
                        <div class="title">${prop.name}</div>
                        <div class="selected_name">${selected.name}</div>
                        <div class="collapse_btn" onclick='collapse(${page_id}, ${pr});'></div>
                        <div class="price">${numberWithCommas(
                          selected.price
                        )}</div>
                    </div>
                    <div class="row text">
                        ${prop.options
                          .map(
                            (option, op) => `
                                <div class="option text
                                    ${
                                      isSelected(page_id, pr, op)
                                        ? "selected"
                                        : ""
                                    }"
                                    onclick = 'selectOption(${page_id}, ${pr}, ${op});'>
                                    <div class="option_title"> ${
                                      option.name
                                    } </div>
                                    <p>${option.description}</p>
                                </div>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }
  }

  apply_constraints();
  redraw_canvas();
}

function apply_constraints() {
  // lift all restrictions
  document.querySelectorAll(".option.restricted").forEach((element) => {
    element.classList.remove("restricted");
  });

  form.constraints.forEach((constraint, c) => {
    if (
      isSelected(
        constraint.control_state[0],
        constraint.control_state[1],
        constraint.control_state[2]
      )
    ) {
      if (constraint.target_state[0] == page_id) {
        for (
          var o = 0;
          o <
          form.pages[constraint.target_state[0]].properties[
            constraint.target_state[1]
          ].options.length;
          o++
        ) {
          if (o != constraint.target_state[2]) {
            document
              .querySelectorAll(
                `#PROPERTIES > div.entry:nth-child(${
                  constraint.target_state[1] + 2
                }) div.option:nth-child(${o + 1})`
              )[0]
              .classList.add("restricted");
          }
        }

        if (
          !isSelected(
            constraint.target_state[0],
            constraint.target_state[1],
            constraint.target_state[2]
          )
        ) {
          selectOption(
            constraint.target_state[0],
            constraint.target_state[1],
            constraint.target_state[2],
            false
          );
        }
      }
    }
  });
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
    previously_selected_imgs = undefined;
    currently_selected_imgs = undefined;

    updateHeaderValues();
    displayPage();
  }
  check_arrows();
}
function page_left() {
  if (page_id > 0) {
    page_id--;
    previously_selected_imgs = undefined;
    currently_selected_imgs = undefined;

    updateHeaderValues();
    displayPage();
  }
  check_arrows();
}

// OPTION SELECTION
let selections = {};
function checkSelectionObjectInit(page_id, prop_id) {
  if (selections[page_id] == undefined) selections[page_id] = {};
  if (selections[page_id][prop_id] == undefined)
    selections[page_id][prop_id] = 0;
}
function selectOption(page_id, prop_id, option_id, change_sel_imgs = true) {
  checkSelectionObjectInit(page_id, prop_id);
  selections[page_id][prop_id] = option_id;

  // update selection html
  document.querySelectorAll(".selected")[prop_id].classList.remove("selected");
  document
    .querySelectorAll(
      `#PROPERTIES > div.entry:nth-child(${prop_id + 2}) div.option:nth-child(${
        option_id + 1
      })`
    )[0]
    .classList.add("selected");
  document.querySelectorAll(
    `#PROPERTIES > div.entry:nth-child(${prop_id + 2}) div.selected_name`
  )[0].innerText = getSelected(page_id, prop_id).name;
  document.querySelectorAll(
    `#PROPERTIES > div.entry:nth-child(${prop_id + 2}) div.price`
  )[0].innerText = numberWithCommas(getSelected(page_id, prop_id).price);

  apply_constraints();

  if (change_sel_imgs) {
    previously_selected_imgs = currently_selected_imgs;
    currently_selected_imgs = form.pages[page_id].properties.map(
      (el, pr) => getSelected(page_id, pr).overlay_img
    );
  }

  // redraw the canvas look
  updateHeaderValues();
  redraw_canvas();
}
function isSelected(page_id, prop_id, option_id) {
  checkSelectionObjectInit(page_id, prop_id);
  return selections[page_id][prop_id] == option_id;
}
function getSelected(page_id, prop_id) {
  checkSelectionObjectInit(page_id, prop_id);
  return form.pages[page_id].properties[prop_id].options[
    selections[page_id][prop_id]
  ];
}

// options collapse
let collapsed = {};
function checkCollapseObjectInit(page_id, prop_id) {
  if (collapsed[page_id] == undefined) collapsed[page_id] = {};
  if (collapsed[page_id][prop_id] == undefined)
    collapsed[page_id][prop_id] = false;
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
    document
      .querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2})`)[0]
      .classList.add("collapsed");
  } else {
    document
      .querySelectorAll(`#PROPERTIES > div.entry:nth-child(${prop_id + 2})`)[0]
      .classList.remove("collapsed");
  }
}

// CANVAS HELPER
let p5canv;
let canv;
let ctx;
// width and height getters
Object.defineProperty(CanvasRenderingContext2D.prototype, "w", {
  get: function w() {
    return this.canvas.getBoundingClientRect().width;
  },
});
Object.defineProperty(CanvasRenderingContext2D.prototype, "h", {
  get: function h() {
    return this.canvas.getBoundingClientRect().height;
  },
});

// handling images
let imgs_cache = {};
async function loadImg(url) {
  return new Promise((res, rej) => {
    var img = new Image();
    img.src = url;
    imgs_cache[url] = img;
    img.onload = res;
  });
}
async function getImg(url) {
  if (imgs_cache[url] == undefined) {
    // load and cache the img
    await loadImg(url);
  }
  return imgs_cache[url];
}

function getImgSync(url) {
  if (imgs_cache[url] == undefined) {
    // load and cache the img
    loadImg(url);
    return undefined;
  }
  return imgs_cache[url];
}

function drawImageScaled(img, ctx, alpha = 1) {
  var canvas = ctx.canvas;
  var hRatio = canvas.width / img.width;
  var vRatio = canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);
  var centerShift_x = (canvas.width - img.width * ratio) / 2;
  var centerShift_y = (canvas.height - img.height * ratio) / 2;

  ctx.globalAlpha = alpha;
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centerShift_x,
    centerShift_y,
    img.width * ratio,
    img.height * ratio
  );
  ctx.globalAlpha = 1;
}

let previously_selected_imgs = undefined;
let currently_selected_imgs = undefined;
let bg;

// CANVAS
let fps = 30;
function setup() {
  let wrapper = document
    .getElementById("BG_IMG_WRAPPER")
    .getBoundingClientRect();

  p5cavn = createCanvas(wrapper.width, wrapper.height);
  p5cavn.parent("BG_IMG_WRAPPER");
  frameRate(fps);
  // pixelDensity(2)

  canv = p5cavn.elt;
  ctx = canv.getContext("2d");

  resizeCanvas2(true);
}
function draw() {
  if (isLoading) {
    // draw the loading animation
    loading();
    return;
  }

  background("white");

  if (!form) return;
  if (!bg) return;
  if (
    previously_selected_imgs == undefined ||
    currently_selected_imgs == undefined
  ) {
    redraw_canvas();
    return;
  }

  // draw the background image for this page
  drawImageScaled(bg, ctx);

  if (fading) {
    // overlay all the old images
    for (let over_img of previously_selected_imgs) {
      drawImageScaled(getImgSync(over_img), ctx, 1 - fading_prog);
    }

    // overlay all the selected images
    for (let over_img of currently_selected_imgs) {
      drawImageScaled(getImgSync(over_img), ctx, fading_prog);
    }

    // animation increment
    fading_prog += 1 / fps;
    fading_prog = constrain(fading_prog, 0, 1);

    if (fading_prog >= 1) {
      fading = false;
      fading_prog = 0;
    }
  } else {
    // overlay all the selected images
    for (let over_img of currently_selected_imgs) {
      drawImageScaled(getImgSync(over_img), ctx, 1);
    }
  }

  let pad = 0.0075;
  if (
    mouseX > width * pad &&
    mouseX < width * (1 - pad) &&
    mouseY > height * pad &&
    mouseY < height * (1 - pad)
  ) {
    let s = min(width, height) * 0.075;
    let sc = 2;
    let unzoomed = get(mouseX - s, mouseY - s, 2 * s, 2 * s);

    image(unzoomed, mouseX - s * sc, mouseY - s * sc, 2 * s * sc, 2 * s * sc);

    noFill();
    stroke("black");
    strokeWeight(1);
    rect(mouseX - s * sc, mouseY - s * sc, 2 * s * sc, 2 * s * sc);
  }
}

async function redraw_canvas() {
  // start the loading animation
  startLoading();
  // ctx.clearRect(0,0,canvas.width, canvas.height);
  if (!form) return;

  if (
    previously_selected_imgs == undefined ||
    currently_selected_imgs == undefined
  ) {
    previously_selected_imgs = form.pages[page_id].properties.map(
      (el, pr) => getSelected(page_id, pr).overlay_img
    );
    currently_selected_imgs = previously_selected_imgs;
  }

  // make sure all the images are cached
  bg = await getImg(form.pages[page_id].background);
  for (let over_img of previously_selected_imgs) {
    await getImg(over_img);
  }
  for (let over_img of currently_selected_imgs) {
    await getImg(over_img);
  }

  // stop the loading animation
  stopLoading();

  // wait for a bit to finish the last animation request
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(resize_interval);
}

// Canvas loading animation
let isLoading = false;
var progress = 0;
let fading = false;
let fading_prog = 0;
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
      y: ctx.h / 2,
    },
    radius: 50,
    speed: 4,
  };

  var smallCircle = {
    center: {
      x: ctx.w / 2,
      y: ctx.h / 2,
    },
    radius: 30,
    speed: 2,
  };

  function accelerateInterpolator(x) {
    return x * x;
  }

  function decelerateInterpolator(x) {
    return 1 - (1 - x) * (1 - x);
  }

  function drawCircle(circle, progress) {
    ctx.beginPath();
    var start = accelerateInterpolator(progress) * circle.speed;
    var end = decelerateInterpolator(progress) * circle.speed;
    ctx.arc(
      circle.center.x,
      circle.center.y,
      circle.radius,
      (start - 0.5) * Math.PI,
      (end - 0.5) * Math.PI
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.fill();
    ctx.stroke();
  }

  drawCircle(bigCircle, progress);
  drawCircle(smallCircle, progress);

  // if (isLoading) {
  //   requestAnimationFrame(loading);
  // }
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

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, 0, canv.width, canv.height);
  ctx.fillStyle = "rgba(0,0,0,0)";

  fading = true;
  fading_prog = 0;
}

// Canvas resizing
let attempting_resize = false;
let last_att_time = 0;
let interval_id = -1;
let resize_interval = 100;
function resizeCanvas2(init = false) {
  let wrapper = document
    .getElementById("BG_IMG_WRAPPER")
    .getBoundingClientRect();
  resizeCanvas(wrapper.width - 10, wrapper.height);

  if (!attempting_resize) {
    startLoading();

    interval_id = setInterval(() => {
      if (Date.now() - last_att_time > resize_interval) {
        redraw_canvas();
        attempting_resize = false;
        clearInterval(interval_id);
        if (!init) stopLoading();
      }
    }, 10);
  }

  attempting_resize = true;
  last_att_time = Date.now();
}
window.addEventListener("resize", resizeCanvas2, false);

// CONTACT INFORMATION

function toggle_contact_info() {
  let cur_disp = document.querySelector("main#widget").style.display;
  if (cur_disp != "none") {
    document.querySelector("main#widget").style.display = "none";

    document.querySelector("#PAGE_NAME").style.display = "none";
    document.querySelector(".arrow.left").style.display = "none";
    document.querySelector("#finish_btn").innerText = "BACK";

    displaySummary();
  } else {
    document.querySelector("main#widget").style.display = "";

    document.querySelector("#PAGE_NAME").style.display = "";
    document.querySelector(".arrow.left").style.display = "";
    document.querySelector("#finish_btn").innerText = "FINISH";
  }
}

function getSummary() {
  let summary = `FORM KEY: ${URL_KEY}
FORM TITLE: ${form.title}

ITEM SUMMARY: \n`;

  let rows = [["Item", "Selected option", "Description", "Price"]];
  form.pages.forEach((page, p) => {
    page.properties.forEach((prop, pr) => {
      let selected_option = prop.options.filter((op_ob, op) =>
        isSelected(p, pr, op)
      )[0];

      rows.push([
        `${page.name} - ${prop.name}`,
        selected_option.name,
        selected_option.description,
        `${numberWithCommas(selected_option.price)} ${
          currency_map[form.currency]
        }`,
      ]);
    });
  });

  rows.forEach((row) => {
    row.forEach((col, i) => {
      let max_width = rows
        .map((r) => r[i])
        .reduce((a, b) => Math.max(a, b.length), 0);

      summary += (col + " ".repeat(max_width)).slice(0, max_width) + " \t";
    });
    summary += `\n`;
  });

  summary += `\nBaseline price: ${numberWithCommas(form.base_price)} ${
    currency_map[form.currency]
  }  \n`;
  summary += `Total price: ${numberWithCommas(
    form.base_price + selectedPrice()
  )} ${currency_map[form.currency]}  \n`;

  return summary;
}

function displaySummary() {
  let summary = document.querySelector("#SUMMARY");

  html = `<table class="table table-bordered table-striped table-responsive-stack">
  <thead class="thead-dark">
    <tr>
      <th>Item</th>
      <th>Selected option</th>
      <th>Description</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>`;

  form.pages.forEach((page, p) => {
    page.properties.forEach((prop, pr) => {
      let selected_option = prop.options.filter((op_ob, op) =>
        isSelected(p, pr, op)
      )[0];

      html += `
      <tr>
        <td>${page.name} - ${prop.name}</td>
        <td><strong>${selected_option.name}</strong></td>
        <td>${selected_option.description}</td>
        <td>${numberWithCommas(selected_option.price)} ${
        currency_map[form.currency]
      }</td>
      </tr>`;
    });
  });

  html += `
  <tr>
    <td>Baseline price</td>
    <td></td>
    <td></td>
    <td>${numberWithCommas(form.base_price)} ${currency_map[form.currency]}</td>
  </tr>
  </tbody>
  </table>
  
  <div id="summary_total">
    <strong>Total price: &nbsp; ${numberWithCommas(
      form.base_price + selectedPrice()
    )} ${currency_map[form.currency]}</strong>
  </div>`;
  summary.innerHTML = html;
}

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
        check_contact_inputs();
      }
    } catch (error) {
      return;
    }
  },
  false
);

window.addEventListener("load", (event) => {
  tryLoadFromURL();
  check_contact_inputs();
});
