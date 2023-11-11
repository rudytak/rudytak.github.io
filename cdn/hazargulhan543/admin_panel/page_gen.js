let page_creator = document.getElementById("page_creator");
let contraint_setter = document.getElementById("contraint_setter");

// GENERAL FORM OBJECT LAYOUT
//
// {
//     title: "FORM_TITLE",
//     currency: "",
//     pages: [
//         {
//             name: "PAGE_NAME",
//             background: "PAGE_BG_URL",
//             properties: [
//                 {
//                     name: "PROPERTY_NAME",
//                     type: "PROPERTY_TYPE", // either "swatch" or "text"
//                     options: [
//                         {
//                             name: "OPTION_NAME",
//                             price: 0,
//                             overlay_img: "OPTION_OVERLAY_URL",
//                             swatch_img: "SOME_URL" // url of the swatch image or nothing, if it is a text based property
//                             description: "SOME_TEXT" // the full text might not be displayed
//                         }
//                     ]
//                 }
//             ]
//         }
//     ],
//     constraints: [
//        {
//            type: "if_then",
//            control_state: {p:page_id, pr:prop_id, op:option_id},
//            target_state: {p:page_id, pr:prop_id, op:option_id},
//        }
//     ]
// }

const default_form_b64 = encode_form({
  title: "FORM_TITLE",
  currency: "USD",
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

// ENCODING AND DECODING
function encode_form(form_json) {
  return btoa(encodeURIComponent(JSON.stringify(form_json)));
}

function decode_form(form_b64) {
  return JSON.parse(decodeURIComponent(atob(form_b64)));
}

// SAVING AND LOADING FROM LOCALSTORAGE
const localStorage_key = "FORM_B64";

function save_localStorage() {
  localStorage.setItem(localStorage_key, encode_form(current_form));
}

function load_localStorage() {
  let saved = localStorage.getItem(localStorage_key);

  if (saved == null) {
    resetCollapse();
    parse_form();
  } else {
    parse_form(saved);
  }
}

// USER INTERACTIONS

let current_form;

function user_parse() {
  alertify.set("notifier", "position", "bottom-left");
  try {
    resetCollapse();
    parse_form(document.getElementById("code_parser").value);

    alertify.notify(
      "The form was successfully parsed.",
      "success",
      3,
      () => { }
    );
  } catch (error) {
    alertify.notify("The form could not be parsed!", "error", 3, () => { });
  }
}

function user_upload(ev) {
  alertify.set("notifier", "position", "bottom-left");
  try {
    var file = document.getElementById("file_parser").files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (evt) {
        resetCollapse();
        parse_form(evt.target.result);
        document.getElementById("code_parser").value = evt.target.result;

        alertify.notify(
          "The form was successfully parsed from the file.",
          "success",
          3,
          () => { }
        );
      }
      reader.onerror = function (evt) {
        throw new Error("No file loaded!");
      }
    } else {
      throw new Error("No file loaded!");
    }


  } catch (error) {
    alertify.notify("The from could not be parsed from the file!", "error", 3, () => { });
  }
}
document.getElementById("file_parser").addEventListener("change", user_upload)

function user_copy() {
  alertify.set("notifier", "position", "bottom-left");
  try {
    // Copy the text inside the text field
    navigator.clipboard.writeText(localStorage.getItem(localStorage_key));

    alertify.notify(
      "The code was successfully copied to the clipboard.",
      "success",
      3,
      () => { }
    );
  } catch (error) {
    alertify.notify("The code could not be copied!", "error", 3, () => { });
  }
}

function user_download(filename = `Code_${current_form.title}_${Date.now()}.code`) {
  alertify.set("notifier", "position", "bottom-left");
  try {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem(localStorage_key)));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    alertify.notify(
      "The download started successfully.",
      "success",
      3,
      () => { }
    );
  } catch (error) {
    alertify.notify("The code could not be saved as a file!", "error", 3, () => { });
  }

}

function clear_form() {
  alertify.set("notifier", "position", "bottom-left");
  alertify.confirm(
    'Do you want to clear the form?',
    'Are you sure you want to clear the form? By pressing OK the form will be deleted and cannot be retrieved back.',
    function () {
      alertify.success('Form cleared correctly.');
      resetCollapse();
      parse_form();
    },
    function () {
      alertify.error('Form clearing canceled.')
    }
  );
}

// PARSING TO THE SCREEN

function parse_form(form_b64 = default_form_b64) {
  current_form = decode_form(form_b64);

  if (!current_form.pages) {
    throw new Error("The parsed form contains no page object.");
  }

  display_form(current_form);
}

function display_form(form_json = current_form) {
  // the new html of the page creator
  let html = "";

  // general form settings
  html += `
  <div class="block form">
  <label tooltip="This is the name of the whole form.">Form title: </label>
  <input id="title" type="text" value="${form_json.title}">
  <br>
  <label tooltip="This is the currency used for all the prices.">Currency: </label>
  <select id="currency"> 
    ${Object.keys(currency_map).map(
    (key) => `
      <option value="${key}" ${form_json.currency == key ? "selected" : ""}>${currency_map[key]
      } (${key})</option>
      `
  )}
    </select>
  `;

  // display all the pages
  for (let p = 0; p < form_json.pages.length; p++) {
    let page = form_json.pages[p];

    html += `
    <div class="block page ${isCollapsed(p) ? 'collapsed' : ''}" style='--el-count: "${page.properties.length}";' p="${p}">
    
    <i class="block_modifier left-tooltip" tooltip="Use the up arrow button, to move this element up in the hierarchy. Use the down arrow button, to move this element down in the hierarchy. Use the cross arrow button, to delete this element from the hierarchy. Use the eye button to hide/show the properties attached to this element."></i>
    
    <i class="fas fa-xmark block_modifier del" onclick="deletePage(${p});"></i>
    <i class="fas fa-arrow-down block_modifier down" onclick="movePage(1, ${p});"></i>
    <i class="fas fa-arrow-up block_modifier up" onclick="movePage(-1, ${p});"></i>

    <i class="fa-regular ${isCollapsed(p) ? 'fa-eye-slash' : 'fa-eye'} block_modifier toggle" onclick='collapsePage(${p});'></i>

    <label tooltip="This is the name of the specificed form page (e.g. Kitchen).">Page name: </label>
    <input id="name" type="text" value="${page.name}"> 
    <br>
    <label tooltip="This should be the URL of the background image for this form page.">Page background: </label>
    <input id="background" class="wide" type="text" value="${page.background}"> 
    <br>
    `;

    for (let pr = 0; pr < page.properties.length; pr++) {
      let prop = page.properties[pr];

      html += `
      <div class="block prop ${isCollapsed(p, pr) ? 'collapsed' : ''}" style='--el-count: "${prop.options.length}";' p="${p}" pr="${pr}">
      
      <i class="block_modifier left-tooltip" tooltip="Use the up arrow button, to move this element up in the hierarchy. Use the down arrow button, to move this element down in the hierarchy. Use the cross arrow button, to delete this element from the hierarchy. Use the eye button to hide/show the options attached to this element."></i>
      
      <i class="fas fa-xmark block_modifier del" onclick="deleteProp(${p}, ${pr});"></i>
      <i class="fas fa-arrow-down block_modifier down" onclick="moveProp(1, ${p}, ${pr});"></i>
      <i class="fas fa-arrow-up block_modifier up" onclick="moveProp(-1, ${p}, ${pr});"></i>

      <i class="fa-regular ${isCollapsed(p, pr) ? 'fa-eye-slash' : 'fa-eye'} block_modifier toggle" onclick='collapseProp(${p}, ${pr});'></i>

      <label tooltip="This is the name of one of the properties of the room (e.g. Countertop).">Property name: </label>
      <input id="name" type="text" value="${prop.name}"> 
      <br>
      <label tooltip="Property type text means, that the options will be displayed as text. Property type swatch means, that small icons will be used for each option (this is useful for specifying a material for instance).">Property type: </label>
      <select id="type"> 
        <option value="text" ${prop.type == "text" ? "selected" : ""
        } >Text</option>
        <option value="swatch" ${prop.type == "swatch" ? "selected" : ""
        } >Swatch</option>
      </select>
      <br>
      `;

      for (let op = 0; op < prop.options.length; op++) {
        let option = prop.options[op];

        html += `
        <div class="block option" p="${p}" pr="${pr}" op="${op}">

        <i class="block_modifier left-tooltip" tooltip="Use the up arrow button, to move this element up in the hierarchy. Use the down arrow button, to move this element down in the hierarchy. Use the cross arrow button, to delete this element from the hierarchy."></i>
        <i class="fas fa-xmark block_modifier del" onclick="deleteOption(${p}, ${pr}, ${op});"></i>
        <i class="fas fa-arrow-down block_modifier down" onclick="moveOption(1, ${p}, ${pr}, ${op});"></i>
        <i class="fas fa-arrow-up block_modifier up" onclick="moveOption(-1, ${p}, ${pr}, ${op});"></i>

        <label tooltip="This is the name the option, that can be selected (e.g. White marble).">Option name: </label>
        <input id="name" type="text" value="${option.name}"> 
        <br>
        <label tooltip="This is the price of this option in the currency selected up above.">Price: </label>
        <input id="price" type="number" min="0" value="${option.price}"> 
        <br>
        <label tooltip="This field is for the URL of an overlay image, that will be laid over the background image of the current page when this option is selected. This image should be transparent everywhere other than the object itself.">Overlay URL: </label>
        <input id="overlay_img" class="wide" type="text" value="${option.overlay_img}"> 
        <br>
        ${prop.type == "swatch"
            ? `
                <label tooltip="This is the URL to an image that will be used for the swatch. The recommended size is around 25 by 25 pixels.">Swatch url: </label>
                <input id="swatch_img" class="wide" type="text" value="${option.swatch_img}"> 
                <br>
            `
            : `
              <label tooltip="This is a short description of the option. Can be left blank. Overly long descriptions (cca 15+ words) get automatically shortened.">Item description: </label>
              <input id="description" class="semiwide" type="text" value="${option.description}"> 
              <br>
            `
          }
        </div>
        `;
      }

      // add an option addition button
      html += `
      <div tooltip="This button adds another empty option." class="option addition_btn" onclick="addOption(${p}, ${pr})">Add option </div>
      </div>
      `;
    }

    // add a property addition button
    html += `
    <div tooltip="This button adds another empty property." class="prop addition_btn" onclick="addProp(${p})">Add property </div>
    </div>
    `;
  }

  // add a page addition button
  html += `
  <div tooltip="This button adds another empty page." class="page addition_btn" onclick="addPage()">Add page </div>
  </div>
  `;

  page_creator.innerHTML = html;

  document
    .querySelectorAll("#page_creator input, #page_creator select")
    .forEach((el) => {
      el.addEventListener("change", function (ev) {
        let p = parseInt(this.parentElement.getAttribute("p"));
        let pr = parseInt(this.parentElement.getAttribute("pr"));
        let op = parseInt(this.parentElement.getAttribute("op"));

        let top = current_form;
        if (!isNaN(p)) {
          top = top.pages[p];
          if (!isNaN(pr)) {
            top = top.properties[pr];
            if (!isNaN(op)) {
              top = top.options[op];
            }
          }
        }

        top[this.id] = this.value;

        // when changing the property type, we have to redraw the html
        if (this.id == "type" && this.type == "select-one") {
          // open up options when changing the property type
          let block = document.querySelectorAll(`:nth-child(${p + 1} of .block.page) :nth-child(${pr + 1} of .block.prop)`)[0];
          if (block.classList.contains("collapsed")) {
            collapseProp(p, pr);
          }

          display_form();
        } else {
          listConstraints()
          save_localStorage();
          updateIframe();
        }
      });
    });

  listConstraints();

  save_localStorage();
  updateIframe();
}

function updateIframe() {
  // update preview iframe
  document.getElementsByTagName("iframe")[0].contentWindow.postMessage(
    JSON.stringify(
      {
        action: "parse",
        code: localStorage.getItem(localStorage_key)
      }
    )
  );
}

// ADDING FUNCTIONS

function addPage() {
  // add a page to the current form
  current_form.pages.push({
    name: "",
    background: "",
    properties: [],
  });

  // redraw the form
  display_form(current_form);
}

function addProp(page_id) {
  // add a property to the appropriate page of the current form
  current_form.pages[page_id].properties.push({
    name: "",
    type: "text",
    options: [],
  });

  // redraw the form
  display_form(current_form);
}

function addOption(page_id, prop_id) {
  // add an option to the appropriate property of the appropriate page in the current form
  current_form.pages[page_id].properties[prop_id].options.push({
    name: "",
    price: 0,
    overlay_img: "",
    swatch_img: "",
    description: "",
  });

  // redraw the form
  display_form(current_form);
}

// MOVEMENT FUNCTIONS

const swapElements = (array, index1, index2) => {
  index1 = Math.max(Math.min(index1, array.length - 1), 0);
  index2 = Math.max(Math.min(index2, array.length - 1), 0);

  let temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
};

function movePage(direction, page_id) {
  // let page = document.querySelector(`#page_creator :nth-child(${page_id+1} of .block.page)`);

  swapElements(current_form.pages, page_id + direction, page_id);
  display_form();
}

function moveProp(direction, page_id, prop_id) {
  // let prop = document.querySelector(`#page_creator :nth-child(${page_id+1} of .block.page) :nth-child(${prop_id+1} of .block.prop)`);

  swapElements(
    current_form.pages[page_id].properties,
    prop_id + direction,
    prop_id
  );
  display_form();
}

function moveOption(direction, page_id, prop_id, option_id) {
  // let option = document.querySelector(`#page_creator :nth-child(${page_id+1} of .block.page) :nth-child(${prop_id+1} of .block.prop) :nth-child(${option_id+1} of .block.option)`);

  swapElements(
    current_form.pages[page_id].properties[prop_id].options,
    option_id + direction,
    option_id
  );
  display_form();
}

// DELETION FUNCTIONS

function deletePage(page_id) {
  // let page = document.querySelector(`#page_creator :nth-child(${page_id+1} of .block.page)`);

  current_form.pages.splice(page_id, 1);
  display_form();
}

function deleteProp(page_id, prop_id) {
  // let prop = document.querySelector(`#page_creator :nth-child(${page_id+1} of .block.page) :nth-child(${prop_id+1} of .block.prop)`);

  current_form.pages[page_id].properties.splice(prop_id, 1);
  display_form();
}

function deleteOption(page_id, prop_id, option_id) {
  // let option = document.querySelector(`#page_creator :nth-child(${page_id+1} of .block.page) :nth-child(${prop_id+1} of .block.prop) :nth-child(${option_id+1} of .block.option)`);

  current_form.pages[page_id].properties[prop_id].options.splice(option_id, 1);
  display_form();
}

// COLLAPSE FUNCTIONS

const collapses_localStorage_key = "COLLAPSED_ADMIN_PAGE"
let collapses;
loadCollapseState();

function isCollapsed(page_id, prop_id = null) {
  return collapses[`${page_id}_${prop_id}`];
}
function collapsePage(page_id) {
  let block = document.querySelectorAll(`:nth-child(${page_id + 1} of .block.page)`)[0];
  let modif = document.querySelectorAll(`:nth-child(${page_id + 1} of .block.page) .block_modifier.toggle`)[0];

  if (block.classList.contains("collapsed")) {
    block.classList.remove("collapsed");

    modif.classList.remove("fa-eye-slash");
    modif.classList.add("fa-eye");

    collapses[`${page_id}_null`] = false;
  } else {
    block.classList.add("collapsed");

    modif.classList.add("fa-eye-slash");
    modif.classList.remove("fa-eye");

    collapses[`${page_id}_null`] = true;
  }

  saveCollapseState();
}
function collapseProp(page_id, prop_id) {
  let block = document.querySelectorAll(`:nth-child(${page_id + 1} of .block.page) :nth-child(${prop_id + 1} of .block.prop)`)[0];
  let modif = document.querySelectorAll(`:nth-child(${page_id + 1} of .block.page) :nth-child(${prop_id + 1} of .block.prop) .block_modifier.toggle`)[0];

  if (block.classList.contains("collapsed")) {
    block.classList.remove("collapsed");

    modif.classList.remove("fa-eye-slash");
    modif.classList.add("fa-eye");

    collapses[`${page_id}_${prop_id}`] = false;
  } else {
    block.classList.add("collapsed");

    modif.classList.add("fa-eye-slash");
    modif.classList.remove("fa-eye");

    collapses[`${page_id}_${prop_id}`] = true;
  }

  saveCollapseState();
}

function resetCollapse() {
  collapses = {}
  saveCollapseState();
}
function saveCollapseState() {
  localStorage.setItem(collapses_localStorage_key, JSON.stringify(collapses));
}
function loadCollapseState() {
  let saved = localStorage.getItem(collapses_localStorage_key);

  if (saved == null) {
    collapses = {};
  } else {
    collapses = JSON.parse(saved);
  }

  return collapses;
}

// CONSTRAINTS

function add_constraint() {
  current_form.constraints.push(
    {
      type: "if_then",
      control_state: { p: 0, pr: 0, op: 0 },
      target_state: { p: 0, pr: 0, op: 0 }
    }
  )

  save_localStorage();
  listConstraints();
  updateIframe();
}

function deleteConstraint(c_id){
  current_form.constraints.splice(c_id, 1);

  save_localStorage();
  listConstraints();
  updateIframe();
}

function listConstraints() {
  let html = "";

  function gen_page_select(id, field, is_control_state = true) {
    return `
      <select constraint-id="${id}" class="constraint page_select ${is_control_state ? 'control' : 'target'}">
        ${current_form.pages.map((page, p) => `<option value="${p}" ${p == field.p ? 'selected' : ''}>${page.name}</option>`)
      }
      </select>
    `
  }

  function gen_prop_select(id, field, is_control_state = true) {
    return `
      <select constraint-id="${id}" class="constraint prop_select ${is_control_state ? 'control' : 'target'}">
        ${current_form.pages[field.p].properties.map((prop, pr) => `<option value="${pr}" ${pr == field.pr ? 'selected' : ''}>${prop.name}</option>`)
      }
      </select>
    `
  }

  function gen_opt_select(id, field, is_control_state = true) {
    return `
      <select constraint-id="${id}" class="constraint opt_select ${is_control_state ? 'control' : 'target'}">
        ${current_form.pages[field.p].properties[field.pr].options.map((opt, op) => `<option value="${op}" ${op == field.op ? 'selected' : ''}>${opt.name}</option>`)
      }
      </select>
    `
  }

  for (let c = 0; c < current_form.constraints.length; c++) {
    constraint = current_form.constraints[c];
    if (constraint.type == "if_then") {
      html += `
          <div class="constraint_instance" constraint-type='${constraint.type}'>
            
            <i class="fas fa-xmark block_modifier del" style='margin-right: 1.5rem;' onclick="deleteConstraint(${c});"></i>

            <strong> If </strong> on page
            ${gen_page_select(c, constraint.control_state, true)}
            the property 
            ${gen_prop_select(c, constraint.control_state, true)}
            has the value 
            ${gen_opt_select(c, constraint.control_state, true)}
  
            <strong> then </strong>
  
            on page
            ${gen_page_select(c, constraint.target_state, false)}
            the property 
            ${gen_prop_select(c, constraint.target_state, false)}
            <strong> must </strong> have the value
            ${gen_opt_select(c, constraint.target_state, false)}
            .
          </div>
        `
    }
  }
  contraint_setter.innerHTML = html;

  document.querySelectorAll("#contraint_setter select.constraint").forEach(sel => {
    sel.addEventListener("change", function (ev) {
      let c_id = parseInt(this.getAttribute("constraint-id"));

      if (current_form.constraints[c_id].type == "if_then") {
        let indexes = Array.from(document.querySelectorAll(`#contraint_setter select.constraint[constraint-id='${c_id}']`)).map(e => parseInt(e.value));

        current_form.constraints[c_id].control_state = {
          p: indexes[0],
          pr: (this.classList.contains("control") && this.classList.contains("page_select")) ? 0 : indexes[1],
          op: (this.classList.contains("control") && (this.classList.contains("page_select") || this.classList.contains("prop_select"))) ? 0 : indexes[2]
        }
        current_form.constraints[c_id].target_state = {
          p: indexes[3],
          pr: (this.classList.contains("target") && this.classList.contains("page_select")) ? 0 : indexes[4],
          op: (this.classList.contains("target") && (this.classList.contains("page_select") || this.classList.contains("prop_select"))) ? 0 : indexes[5]
        }
      }

      save_localStorage();
      listConstraints();
      updateIframe();
    });
  })
}

load_localStorage();