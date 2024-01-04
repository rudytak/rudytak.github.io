let W = 600;
let H = 600;

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

    let _m_0 = sim_defaults_folder.add(sim_defaults, "m_0").name("m_0 (readonly) [A*m^2]").onFinishChange(() => {
      sim_defaults_folder.updateDisplay();
    });
    _m_0.__precision = 8;

    let _n = sim_defaults_folder.add(sim_defaults, "magnet_count").name("Magnet count - n [arb.]").step(1).min(0).setValue(sim_defaults.magnet_count);

    let _magnet_orientation = sim_defaults_folder.add(sim_defaults, "magnet_orientation").options(["vertical", "radial", "tangent"]).name("Magnet orientation");

    let _r = sim_defaults_folder.add(sim_defaults, "r").name("Spinner radius - r [m]").step(1e-4);
    _r.__precision = 6;

    let _alpha = sim_defaults_folder.add(sim_defaults, "α").name("Spinner const. drag coef. - α [rad*s^(-2)]").step(1e-4);
    _alpha.__precision = 6;

    let _beta = sim_defaults_folder.add(sim_defaults, "β").name("Spinner lin. drag coef. - β [s^(-1)]").step(1e-4);
    _beta.__precision = 6;

    let _gamma = sim_defaults_folder.add(sim_defaults, "γ").name("Spinner quad. drag coef. - γ [rad^(-1)]").step(1e-4);
    _gamma.__precision = 6;

    sim_defaults_folder.updateDisplay();
  }

  gui.add({
    create_si: () => {
      create_si();
      afterSiCreation();
    }
  }, "create_si").name("Create simulation instance")

  let sim_spinners;
  function afterSiCreation() {
    {
      let run_sim;
      function create_spinners() {
        sim_spinners = gui.addFolder("Spinners")
        sim_spinners.open();

        sim_spinners.add({
          add_spinner: () => {
            si.spinner_params.push([
              v(0, 0, 0),
              0,
              0,
              sim_defaults.magnet_count,
              sim_defaults.r,
              sim_defaults.I,
              sim_defaults.m_0,
              sim_defaults.magnet_orientation,
              sim_defaults.α,
              sim_defaults.β,
              sim_defaults.γ,
              false
            ]);
            update_spinners();
          }
        }, "add_spinner").name("Add a spinner")
        sim_spinners.add({
          remove_spinner: () => {
            if (si.spinner_params.length > 1) {
              si.spinner_params.splice(sim_params.exports.length - 1, 1)
            }
            update_spinners();
          }
        }, "remove_spinner").name("Remove a spinner")

        for (let i = 0; i < si.spinner_params.length; i++) {
          const ii = i;

          let folder = sim_spinners.addFolder(`Spinner ${i}`)

          let S_folder = folder.addFolder("S")
          S_folder.add(si.spinner_params[ii][0], "x").name("x [m]").step(0.001);
          S_folder.add(si.spinner_params[ii][0], "y").name("y [m]").step(0.001);

          let temp;
          temp = folder.add(si.spinner_params[ii], 1).name("φ_0 [rad]").step(0.001)
          temp.__precision = 5;
          temp = folder.add(si.spinner_params[ii], 2).name("ω_0 [rad/s]").step(0.001)
          temp.__precision = 5;

          temp = folder.add(si.spinner_params[ii], 3).name("n [arb.]").step(1).min(0).setValue(si.spinner_params[ii][3]);
          temp.__precision = 0;
          temp = folder.add(si.spinner_params[ii], 4).name("r [m]").step(1e-4);
          temp.__precision = 6;
          temp = folder.add(si.spinner_params[ii], 5).step(1e-7).name("I [kg*m^2]")
          temp.__precision = 8;
          temp = folder.add(si.spinner_params[ii], 6).name("m_0 [A*m^2]")
          temp.__precision = 8;
          folder.add(si.spinner_params[ii], 7).options(["vertical", "radial", "tangent"]).name("Magnet orientation")

          temp = folder.add(si.spinner_params[ii], 8).name("α [rad*s^(-2)]").step(1e-4);
          temp.__precision = 6;
          temp = folder.add(si.spinner_params[ii], 9).name("β [s^(-1)]").step(1e-4);
          temp.__precision = 6;
          temp = folder.add(si.spinner_params[ii], 10).name("γ [rad^(-1)]").step(1e-4);
          temp.__precision = 6;

          temp = folder.add(si.spinner_params[ii], 11).name("Constant ω");
        }

        run_sim = gui.add({ start: start }, "start").name("Run simulation")
      }

      function update_spinners() {
        gui.removeFolder(sim_spinners)
        gui.remove(run_sim)
        create_spinners();
      }
    }
    create_spinners();
  }

  gui.show();
}

let instance_created = false;
function create_si() {
  si = new sim_instance(
    sim_params,
    RK_matrix.RK4,
    sim_defaults
  );

  si.add_spinner(v(0, 0, 0), 0, 0);

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

let finished = false;
let save_added = false;
let zoom = 1;
let zoom_speed = 1.1;
let c_x = W / 2;
let c_y = H / 2;
function draw() {
  background(0);
  if (!libs_loaded) return;
  if (!instance_created) return;

  push();
  translate(c_x, c_y);
  let rs = 1000 * zoom;

  let _z = (Math.floor(Math.log10(zoom)))

  // draw grid
  push();
  strokeWeight(1);
  textSize(10)
  stroke(128, 128);
  let stp = 0.05 * rs;
  for (let x = 0; x < Math.abs(c_x) + W / zoom; x += stp) {
    line(x, -H, x, H);
    text(`${(x * 100/ rs).toFixed(1)} cm`, x + 5, H - c_y - 5)
    line(-x, -H, -x, H);
    text(`${(-x * 100/ rs).toFixed(1)} cm`, -x + 5, H - c_y - 5)
  }
  for (let y = 0; y < Math.abs(c_y) + H / zoom; y += stp) {
    line(-W, y, W, y);
    text(`${(y * 100/ rs).toFixed(1)} cm`, - c_x + 5, y - 5)

    line(-W, -y, W, -y);
    text(`${(-y * 100/ rs).toFixed(1)} cm`, - c_x + 5, -y - 5)
  }
  pop();

  scale(rs);



  let tot_frames = Math.ceil((si.sim_run_params.end_time - si.sim_run_params.start_time) / si.sim_run_params.dt);

  if (!started) {
    si.reset_spinners();
    for (let s of si.spinners) {
      s.draw();
    }

    pop();

    fill("white")
    text(`Time: ${si.sim_run_params.start_time}`, 69, 20)
    text(`Frame: ${0}/${tot_frames}`, 69, 40)
    text("NOT STARTED!", 69, 60)
    return;
  }

  if (!finished) {
    finished = si.runWebFrame();
  } else {
    for (let s of si.spinners) {
      s.draw();
    }

    if (!save_added) {
      gui.add({
        save: () => {
          saveFile(
            si.sim_run_params.out_path,
            fs._cache[si.sim_run_params.out_path]
          )
        }
      }, "save").name("Save output");
    }
    save_added = true;
  }

  pop();
  fill("white")
  text(`Time: ${si.t}`, 69, 20)
  text(`Frame: ${si.frame}/${tot_frames}`, 69, 40)
}

function mouseDragged(event) {
  if (event.which == 1 && event.target.id == "defaultCanvas0") {
    c_x += event.movementX;
    c_y += event.movementY;
  }
}

function mouseWheel(event) {
  if (event.target.id == "defaultCanvas0") {
    zoom *= Math.pow(zoom_speed, -Math.sign(event.delta))
  }
}

function saveFile(filename, data) {
  const blob = new Blob([data], { type: 'text/csv' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  }
  else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}
