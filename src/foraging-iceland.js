/**
 * @title foraging-iceland
 * @description This is a minimal exasmple to create foraging experiments with displays as in
 * Kristjánsson, Á., Jóhannesson, Ó. I., & Thornton, I. M. (2014). Common attentional constraints
 * in visual foraging. PloS one, 9(6).
 * Note that for simplicity, randomization of blocks and target identities is not included.
 * Moreover, instruction screens, feedback, etc. is ommited to keep the exampel concise.
 * For those things see other examples and the jsPsych documentation.
 * 
 * @version 0.2-prolific-test
 *
 * @imageDir images/shapes
 */
import "../styles/jspsych-foraging-patch.scss"
import "jspsych/plugins/jspsych-fullscreen";
import "./plugins/jspsych-foraging-patch";
import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween } from "popmotion"


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
  var simple_targets_1 = {
    type: "target",
    amount: 20,
    images: ["disk_red.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_all_collected : true,
  };
  var simple_targets_2 = {
    type: "target",
    amount: 20,
    images: ["disk_blue.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_all_collected : true,
  };
  var simple_distractors_1 = {
    type: "distractor",
    amount: 20,
    images: ["disk_yellow.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_one_collected  : true,
  };
  var simple_distractors_2 = {
    type: "distractor",
    amount: 20,
    images: ["disk_green.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_one_collected : true,
  };

  let display_simple = {elements : [simple_targets_1, simple_targets_2, simple_distractors_1, simple_distractors_2]};
  let trials_simple = jsPsych.randomization.repeat([display_simple], 2); // let's do only 2 patches of this type for testing


  // Now  we turn to the conjunction patches
  var conjunction_targets_1 = {
    type: "target",
    amount: 20,
    images: ["disk_green.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_all_collected : true,
  };
  var conjunction_targets_2 = {
    type: "target",
    amount: 20,
    images: ["square_red.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_all_collected : true,
  };
  var conjunction_distractors_1 = {
    type: "distractor",
    amount: 20,
    images: ["disk_red.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_one_collected : true,
  };
  var conjunction_distractors_2 = {
    type: "distractor",
    amount: 20,
    images: ["square_green.svg"],
    positions: stim_positions, 
    collectible: true,
    trial_ends_when_one_collected : true,
  };
  let display_conjunction = {elements : [conjunction_targets_1, conjunction_targets_2, conjunction_distractors_1, conjunction_distractors_2]};
  let trials_conjunction = jsPsych.randomization.repeat([display_conjunction], 2); // let's do only 2 patches of this type for testing



  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    background_color : 'black',
    images_path : "media/images/shapes/", // path to image folder
    patch_size : [1024, 768], // in vitual pixels
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    travel_time : 1000,
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 1024, 768, 0);
    },
  };

  // As usual in jsPsych: push the simple trials into the timeline
  timeline.push({
    timeline: [patch],
    timeline_variables: trials_simple,
  });
  // As usual in jsPsych: push the conjunction trials into the timeline
  timeline.push({
    timeline: [patch],
    timeline_variables: trials_conjunction,
  });
  

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
