let W = 800;
let H = 800;

let _NumberController = Object.assign(Object.create(Object.getPrototypeOf(dat.controllers.NumberControllerBox)), dat.controllers.NumberControllerBox);
dat.controllers.NumberControllerBox.prototype.updateDisplay = function updateDisplay() {
  this.__input.value = this.__truncationSuspended ? this.getValue() : round(this.getValue(), this.__precision).toFixed(this.__precision);
  return _NumberController.prototype.updateDisplay.call(this);
};
const defaultPreset = {
  "preset": "Default",
  "closed": false,
  "folders": {
    "Simulation parameters": {
      "preset": "Default",
      "closed": true,
      "folders": {
        "Simulation exports": {
          "preset": "Default",
          "closed": false,
          "folders": {}
        }
      }
    },
    "Spinner defaults": {
      "preset": "Default",
      "closed": true,
      "folders": {}
    }
  }
}
const gui = new dat.GUI({
  name: "Settings",
  useLocalStorage: true,
  width: 600,
  preset: "Default",
  load: defaultPreset
});

let sim_params = {};
let sim_defaults = {};
let v3, v, sim_instance, RK_matrix;

let si;
async function main() {
  ({ v3, v } = require("vec.js"));
  ({ sim_instance, RK_matrix } = require("sim_RK.js"));

  sim_params = sim_instance.default_run_params;
  sim_defaults = sim_instance.default_defaults;

  let sim_params_folder = gui.addFolder("Simulation parameters");
  sim_params_folder.open();
  {
    // dt
    sim_params_folder.add({ "dt_exponent": 4 }, "dt_exponent", 1, 9, 1).setValue(4).onChange(function () {
      sim_params.dt = parseFloat(Math.pow(10, -this.getValue()).toFixed(12))
    }).name("Time resolution")
    // start time
    sim_params_folder.add(sim_params, "start_time", 0, 1000, 0.001).name("Start time [s]").onChange(
      function () {
        sim_params.end_time = Math.max(sim_params.end_time, this.getValue())
        gui.updateDisplay();
      }
    )
    // end time
    sim_params_folder.add(sim_params, "end_time", 0, 1000, 0.001).name("End time [s]").onChange(
      function () {
        sim_params.start_time = Math.min(sim_params.start_time, this.getValue())
        gui.updateDisplay();
      }
    )
    // output path
    sim_params_folder.add(sim_params, "out_path").name("Output file name")
    // exports
    let sim_exports;
    function create_exports() {
      sim_exports = sim_params_folder.addFolder("Simulation exports")
      sim_exports.add({
        add_export: () => {
          sim_params.exports.push("s[0].omega");
          update_exports();
        }
      }, "add_export").name("Add an export column")
      sim_exports.add({
        remove_export: () => {
          sim_params.exports.splice(sim_params.exports.length - 1, 1)
          update_exports();
        }
      }, "remove_export").name("Remove an export column")

      for (var i = 0; i < sim_params.exports.length; i++) {
        sim_exports.add(sim_params.exports, i)
      }

      sim_exports.open();
    }

    function update_exports() {
      sim_params_folder.removeFolder(sim_exports)
      create_exports();
    }
    create_exports();
  }

  let sim_defaults_folder = gui.addFolder("Spinner defaults");
  sim_defaults_folder.open();
  {
    let _I = sim_defaults_folder.add(sim_defaults, "I").step(1e-7).name("Moment of inertia - I [kg*m^2]");
    _I.__precision = 8;

    let _B_r = sim_defaults_folder.add(sim_defaults, "B_r").step(1e-4).name("Remanence - B_r [T]")
    _B_r.__precision = 6;
    _B_r.onChange(() => {
      sim_defaults.m_0 = 1 / sim_instance.constants.μ_0 * sim_defaults.V * sim_defaults.B_r;
      gui.updateDisplay();
    });

    let _V = sim_defaults_folder.add(sim_defaults, "V").step(1e-10).name("Volume - V [m^3]");
    _V.__precision = 12;
    _V.onChange(() => {
      sim_defaults.m_0 = 1 / sim_instance.constants.μ_0 * sim_defaults.V * sim_defaults.B_r;
      gui.updateDisplay();
    });

    let _m_0 = sim_defaults_folder.add(sim_defaults, "m_0").name("m_0 (readonly)").onFinishChange(() => {
      sim_defaults_folder.updateDisplay();
    });
    _m_0.__precision = 8;

    let _n = sim_defaults_folder.add(sim_defaults, "magnet_count").name("Magnet count - n [arb.]").step(1).setValue(sim_defaults.magnet_count);

    let _magnet_orientation = sim_defaults_folder.add(sim_defaults, "magnet_orientation").name("Magnet orientation").options(["vertical", "radial", "tangent"]);

    let _r = sim_defaults_folder.add(sim_defaults, "r").name("Spinner radius - r [m]").step(1e-4);
    _r.__precision = 6;

    sim_defaults_folder.updateDisplay();
  }

  gui.add({ create_si: create_si }, "create_si").name("Create simulation instance")
  gui.add({ start: start }, "start").name("Run simulation")
  gui.show();
}

let instance_created = false;
function create_si(){
  si = new sim_instance(
    sim_params,
    RK_matrix.RK4,
    sim_defaults
  );

  si.add_spinner(v(0, 0, 0), Math.PI / 6, -9.86);
  si.add_spinner(v(0, 0.08, 0), 0, 9.86, true);

  instance_created = true;
}

let started = false;
function start() {
  si.prerunWeb();

  started = true;
}

function setup() {
  createCanvas(W, H);
  background("black");
}

let zoom = 1;
let zoom_speed = 1.1;
let c_x = W/2;
let c_y = H/2;
function draw() {
  background(0);
  if (!libs_loaded) return;
  if (!instance_created) return;

  push();
  translate(c_x,c_y);
  scale(1000 * zoom);

  if (!started) {
    si.reset_spinners();
    for(let s of si.spinners){
      s.draw();
    }

    pop();

    fill("white")
    text("Not started", 10, 20)
    return;
  }

  let is_done = si.runWebFrame();
  console.log(is_done)

  pop();
  fill("white")
  text(`Time: ${si.t}`, 10, 20)
  text(`Frame: ${si.frame}`, 10, 40)
}

function mouseDragged(event) {
  if(event.which == 1 && event.target.id == "defaultCanvas0"){
    c_x += event.movementX;
    c_y += event.movementY;
  }
}

function mouseWheel(event) {
  zoom *= Math.pow(zoom_speed, -Math.sign(event.delta))
}
