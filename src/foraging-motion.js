/**
 * @title foraging-motion
 * @description This is an example how to achieve "random" object motion as in the
 * Tünnermann & Schubö (in prep.) experiments.
 *
 * @version 0.1
 *
 * @imageDir images/shapes
 */
import "../styles/jspsych-foraging-patch.scss";
import "jspsych/plugins/jspsych-fullscreen";
import "./plugins/jspsych-foraging-patch";
import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween, physics } from "popmotion";

/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) {
  // Initialize jsPsych timeline
  let timeline = [];

  // Switch to fullscreen
  timeline.push({
    type: "fullscreen",
    fullscreen_mode: true,
  });

  // This will define an object that will be used to
  // generate positions for targets and distractors
  var stim_positions = new JitteredGridCoordinates({
    columns: 10,
    rows: 8,
    hspacing: 90,
    vspacing: 90,
    hjitter: 40,
    vjitter: 40,
    hoffset: 45,
    voffset: 45,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });


  // Let's first define the elements in simple feature patches

  // Returns an array with x and y veleocity components in all possible (random) directiosn
  function generate_random_velocities(number_of_veleocities, speed, start_range=0, end_range=(Math.PI * 2)) {
    let array_of_random_angles = Array.from(
      { length: number_of_veleocities },
      () => start_range + Math.random() * (end_range - start_range)
    );
    let array_of_velocities = array_of_random_angles.map((r) => [
      Math.sin(r) * speed,
      Math.cos(r) * speed,
    ]);
    return array_of_velocities;
  }

  // Here we define callback function which we then pass to the stimulus sets.
  // The foraging plugin will call these fucntions when the disks hit the 
  // Screen borders. The functions then change the direction of movement to keep
  // the disks inside the screen:
  function left_border_touched(stim, pos) {
    let new_vel = generate_random_velocities(1, 30, 0, Math.PI)[0]
    stim.playback.setVelocity({x : new_vel[0], y : new_vel[1]})
  }
  function right_border_touched(stim, pos) {
    let new_vel = generate_random_velocities(1, 30, Math.PI, Math.PI * 2)[0]
    stim.playback.setVelocity({x : new_vel[0], y : new_vel[1]})
  }
  function top_border_touched(stim, pos) {
    let new_vel = generate_random_velocities(1, 30, Math.PI + Math.PI/2, Math.PI * 2 + Math.PI / 2)[0]
    stim.playback.setVelocity({x : new_vel[0], y : new_vel[1]})
  }
  function bottom_border_touched(stim, pos) {
    let new_vel = generate_random_velocities(1, 30, Math.PI/2, Math.PI + Math.PI / 2)[0]
    stim.playback.setVelocity({x : new_vel[0], y : new_vel[1]})
  }

  var simple_targets_1 = {
    type: "target",
    amount: 20,
    images: ["disk_red.svg"],
    positions: stim_positions,
    collectible: true,
    trial_ends_when_all_collected: true,
    // The line below assigns a list of animations (generated from random velocities) to the elements
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,
  };
  var simple_targets_2 = {
    type: "target",
    amount: 20,
    images: ["disk_blue.svg"],
    positions: stim_positions,
    collectible: true,
    trial_ends_when_all_collected: true,
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,

  };
  var simple_distractors_1 = {
    type: "distractor",
    amount: 20,
    images: ["disk_yellow.svg"],
    positions: stim_positions,
    collectible: true,
    trial_ends_when_one_collected: true,
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,

  };
  var simple_distractors_2 = {
    type: "distractor",
    amount: 20,
    images: ["disk_green.svg"],
    positions: stim_positions,
    collectible: true,
    trial_ends_when_one_collected: true,
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,

  };

  let display_simple = {
    elements: [
      simple_targets_1,
      simple_targets_2,
      simple_distractors_1,
      simple_distractors_2,
    ],
  };
  let trials_simple = jsPsych.randomization.repeat([display_simple], 2); // let's do only 2 patches of this type for testing

  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    background_color: "black",
    images_path: "media/images/shapes/", // path to image folder
    patch_size: [1024, 768], // in vitual pixels
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    travel_time: 1000,
    patch_leaving_animation: tween({
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 1000,
    }),
    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(
        document.getElementById("jspsych-foraging-container"),
        1024,
        768,
        0
      );
    },
  };

  // As usual in jsPsych: push the simple trials into the timeline
  timeline.push({
    timeline: [patch],
    timeline_variables: trials_simple,
  });

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
