const gui = new dat.GUI();
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
  // dt
  sim_params_folder.add({"dt_exponent":4}, "dt_exponent", 1, 9, 1).setValue(4).onChange(function () {
    sim_params.dt = Math.pow(10, -this.getValue()).toFixed(12)
  }).name("Time resolution")
  // start time
  sim_params_folder.add(sim_params, "start_time", 0, 1000, 0.001).name("Start time").onChange(
    function(){
        sim_params.end_time = Math.max(sim_params.end_time, this.getValue())
        gui.updateDisplay();
    }
  )
  // end time
  sim_params_folder.add(sim_params, "end_time", 0, 1000, 0.001).name("End time").onChange(
    function(){
        sim_params.start_time = Math.min(sim_params.start_time, this.getValue())
        gui.updateDisplay();
    }
  )
  // output path
  //
  // exports
  let sim_exports = sim_params_folder.addFolder("Simulation exports").onChange(()=>{
    
  })


  let sim_defaults_folder = gui.addFolder("Spinner defaults");

  gui.add({Start: start}, "Start").name("Start simulation")
  gui.show();
}

let started = false;
function start(){
  si = new sim_instance(
    sim_params,
    RK_matrix.RK4,
    sim_defaults
  );
  si.add_spinner(v(0, 0, 0), Math.PI / 6, -9.86);
  si.add_spinner(v(0, 0.08, 0), 0, 9.86, true);

  si.prerunWeb();

  started = true;
}

function setup() {
  createCanvas(800, 800);
  background("black");
}

function draw() {
  if (!libs_loaded) return;
  if (!started) return;

  let is_done = si.runWebFrame();
  console.log(is_done)
}
