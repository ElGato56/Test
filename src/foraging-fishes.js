/**
 * @title foraging-fishes
 * @description Experiment for SH's bachelor thesis 
 * 
 * @version 2.0-prolific-final
 *
 * @imageDir images/foraging-fishes
 */
import "../styles/jspsych-foraging-patch.scss";
import "../styles/main.scss"
import "../styles/foraging-fishes.scss"

import "jspsych/plugins/jspsych-call-function";
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-survey-text";
import "jspsych/plugins/jspsych-survey-multi-choice";
import "jspsych/plugins/jspsych-image-keyboard-response";
import "jspsych/plugins/jspsych-image-button-response";

import "./plugins/jspsych-foraging-patch";

const pbl = require('prompt-boxes')

import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { getDoNotReloadToastNode } from "./util/JsPsychNodeLib";
import { tween, physics } from "popmotion";

let debug = false; 

/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) {
  if (typeof jatos !== 'undefined') {
    var pid = jatos.urlQueryParameters['PROLIFIC_PID'];
  }
  const pb = new pbl({
    attrPrefix: 'pb',
    toasts: {
      direction: 'top',    // Wo kommen die Toasts?      
      max: 1,              // Wie viele können gleichzeitig da sein?   
      allowClose: false,   // Können Leute die schließen?
    }
  });

  // Initialize jsPsych timeline
  let timeline = [];

  let count_sc1; // Anzahl Subkategorie 1 (es fehlt: target3_right_speed1)
  let count_sc2; // Anzahl Subkategorie 2 (es fehlt: target3_right_speed2)
  let count_sc3; // Anzahl Subkategorie 3 (es fehlt: target3_left_speed1)
  let count_sc4; // Anzahl Subkategorie 4 (es fehlt: target3_left_speed2)
  let next_sc;   // Subkategorie für nächsten Patch (1-4, gleichverteilt)
  let random_sc;  // random next subcategory

  let random_sale; // random next offer
  let count_a1; // Anzahl Patches mit a1
  let count_a2; // Anzahl Patches mit a2
  let diff; // Differenz zwischen Anzahl a1 und a2 Patches 
  let next_sale; // 1 = Angebot a1; 2 = Angebot a2
  let block_points;  // Anzahl Punkte im aktuellen Block

  let first_tt; // travel time of first random block
  let second_tt; // travel time of second random block
  let third_tt;  // travel time of third random block
  
  let max_points = 8000;  //auf 8000 setzen; im ersten Block müssen 8000 Punkte gesammelt werden
  let max_block_points = 8000; // auf 8000 setzen; Anzahl Punkte, die in einem Block gesammelt werden müssen

  let velo_slow = 30; // slow speed of items
  let velo_fast = 55; // fast speed of items 

  let points_a1 = 18; // points a1 offer
  let points_a2 = 22;  // points a2 offer 
  let toast_a1 = '<b>Im nächsten Becken ' + points_a1 + ' Punkte!</b> ';
  let toast_a2 = '<b>Im nächsten Becken ' + points_a2 + ' Punkte!</b> ';

  /* This part is related to keeping track of the points. We register these functions with the plugin and
    the plugin calls them as the participant forages. However, this is going to change to a nicer solution at some point */

  function readout_point_counter() {
    return point_counter;
  }
  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_block_points() {
    return block_points;
  }

  function get_next_sale() {
    diff = count_a1 - count_a2;
    if (diff > 1) {
      count_a2++;
      return (2);
    }
    else if (diff < -1) {
      count_a1++;
      return (1);
    }
    else {
      random_sale = Math.floor(Math.random() * 2) + 1
      switch (random_sale) {
        case 1:
          count_a1++;
          return (1);
        case 2:
          count_a2++;
          return (2);
      }
    }
  }

  function get_next_sc() {
    if (count_sc1 - count_sc2 < -1 ||
      count_sc1 - count_sc3 < -1 ||
      count_sc1 - count_sc4 < -1) {
      count_sc1++;
      return (1);
    }
    else if (count_sc2 - count_sc1 < -1 ||
      count_sc2 - count_sc3 < -1 ||
      count_sc2 - count_sc4 < -1) {
      count_sc2++;
      return (2);
    }
    else if (count_sc3 - count_sc1 < -1 ||
      count_sc3 - count_sc2 < -1 ||
      count_sc3 - count_sc4 < -1) {
      count_sc3++;
      return (3);
    }
    else if (count_sc4 - count_sc1 < -1 ||
      count_sc4 - count_sc2 < -1 ||
      count_sc4 - count_sc3 < -1) {
      count_sc4++;
      return (4);
    }
    else {
      random_sc = Math.floor(Math.random() * 4) + 1
      switch (random_sc) {
        case 1:
          count_sc1++;
          return (1);
        case 2:
          count_sc2++;
          return (2);
        case 3:
          count_sc3++;
          return (3);
        case 4:
          count_sc4++;
          return (4);
      }
    }
  }

  // This will define an object that will be used to generate positions for targets and distractors
  var stim_positions = new JitteredGridCoordinates({
    columns: 10,
    rows: 8,
    hspacing: 170,
    vspacing: 90,
    hjitter: 40,
    vjitter: 40,
    hoffset: 0,
    voffset: 0,
    on_used_up: "reset",
    on_patch_done: "reset",
  });
  var coral_positions = new JitteredGridCoordinates({
    columns: 8,
    rows: 1,
    hspacing: 170,
    vspacing: 90,
    hjitter: 40,
    vjitter: 40,
    hoffset: 0,
    voffset: 250,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });

  var all_fish = ["orange", "silver", "green"]; // list of targets 
  all_fish = jsPsych.randomization.shuffle(all_fish); // Let's shuffle the list of images, so that every participant gets different images

  // Let's define the elements in the patches
  var target_1 = {
    type: "target",
    points: 4,
    positions: stim_positions,
    collectible: false,
    zIndex: -1000,
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var target_1_right = Object.assign({}, target_1, {
    images: [all_fish[0] + "-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var target_1_left = Object.assign({}, target_1, {
    images: [all_fish[0] + "-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var target_1_right_speed1 = Object.assign({}, target_1_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 4
  })
  var target_1_right_speed2 = Object.assign({}, target_1_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 5
  })
  var target_1_left_speed1 = Object.assign({}, target_1_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 5
  })
  var target_1_left_speed2 = Object.assign({}, target_1_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 4
  })
  var target_2 = {
    type: "target",
    points: 8,
    positions: stim_positions,
    collectible: false,
    zIndex: -1000,
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var target_2_right = Object.assign({}, target_2, {
    images: [all_fish[1] + "-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var target_2_left = Object.assign({}, target_2, {
    images: [all_fish[1] + "-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var target_2_right_speed1 = Object.assign({}, target_2_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 2
  })
  var target_2_right_speed2 = Object.assign({}, target_2_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 3
  })
  var target_2_left_speed1 = Object.assign({}, target_2_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 2
  })
  var target_2_left_speed2 = Object.assign({}, target_2_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 2
  })
  var target_2_a1 = Object.assign({}, target_2, { points: points_a1 })
  var target_2_a1_right = Object.assign({}, target_2_right, { points: points_a1 })
  var target_2_a1_left = Object.assign({}, target_2_left, { points: points_a1 })
  var target_2_a1_right_speed1 = Object.assign({}, target_2_right_speed1, { points: points_a1 })
  var target_2_a1_right_speed2 = Object.assign({}, target_2_right_speed2, { points: points_a1 })
  var target_2_a1_left_speed1 = Object.assign({}, target_2_left_speed1, { points: points_a1 })
  var target_2_a1_left_speed2 = Object.assign({}, target_2_left_speed2, { points: points_a1 })

  var target_2_a2 = Object.assign({}, target_2, { points: points_a2 })
  var target_2_a2_right = Object.assign({}, target_2_right, { points: points_a2 })
  var target_2_a2_left = Object.assign({}, target_2_left, { points: points_a2 })
  var target_2_a2_right_speed1 = Object.assign({}, target_2_right_speed1, { points: points_a2 })
  var target_2_a2_right_speed2 = Object.assign({}, target_2_right_speed2, { points: points_a2 })
  var target_2_a2_left_speed1 = Object.assign({}, target_2_left_speed1, { points: points_a2 })
  var target_2_a2_left_speed2 = Object.assign({}, target_2_left_speed2, { points: points_a2 })

  var target_3 = {
    type: "target",
    points: 16,
    positions: stim_positions,
    collectible: false,
    zIndex: -1000,
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var target_3_right = Object.assign({}, target_3, {
    images: [all_fish[2] + "-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var target_3_left = Object.assign({}, target_3, {
    images: [all_fish[2] + "-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var target_3_right_speed1 = Object.assign({}, target_3_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 1
  })
  var target_3_right_speed2 = Object.assign({}, target_3_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 1
  })
  var target_3_left_speed1 = Object.assign({}, target_3_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 1
  })
  var target_3_left_speed2 = Object.assign({}, target_3_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_1 = {
    type: "distractor",
    points: -15,
    positions: stim_positions,
    collectible: false,
    zIndex: -4000,
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var distractor_1_right = Object.assign({}, distractor_1, {
    images: ["orange-dist-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_1_left = Object.assign({}, distractor_1, {
    images: ["orange-dist-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_1_right_speed1 = Object.assign({}, distractor_1_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 1
  })
  var distractor_1_right_speed2 = Object.assign({}, distractor_1_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 2
  })
  var distractor_1_left_speed1 = Object.assign({}, distractor_1_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_1_left_speed2 = Object.assign({}, distractor_1_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_2 = {
    type: "distractor",
    points: -15,
    positions: stim_positions,
    collectible: false,
    zIndex: -4000,
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => { stim.style.opacity = v; stim.style.scale = v })
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var distractor_2_right = Object.assign({}, distractor_2, {
    images: ["silver-dist-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_2_left = Object.assign({}, distractor_2, {
    images: ["silver-dist-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_2_right_speed1 = Object.assign({}, distractor_2_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_2_right_speed2 = Object.assign({}, distractor_2_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_2_left_speed1 = Object.assign({}, distractor_2_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 1
  })
  var distractor_2_left_speed2 = Object.assign({}, distractor_2_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 2
  })
  var distractor_3 = {
    type: "distractor",
    points: -15,
    positions: stim_positions,
    collectible: false,
    zIndex: -4000,
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var distractor_3_right = Object.assign({}, distractor_3, {
    images: ["green-dist-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_3_left = Object.assign({}, distractor_3, {
    images: ["green-dist-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_3_right_speed1 = Object.assign({}, distractor_3_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 1
  })
  var distractor_3_right_speed2 = Object.assign({}, distractor_3_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 2
  })
  var distractor_3_left_speed1 = Object.assign({}, distractor_3_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_3_left_speed2 = Object.assign({}, distractor_3_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_4 = {
    type: "distractor",
    points: 0,
    positions: stim_positions,
    collectible: false,
    zIndex: -6000,
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var distractor_4_right = Object.assign({}, distractor_4, {
    images: ["seahorse-right.gif"],
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_4_left = Object.assign({}, distractor_4, {
    images: ["seahorse-left.gif"],
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_4_right_speed1 = Object.assign({}, distractor_4_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 1
  })
  var distractor_4_right_speed2 = Object.assign({}, distractor_4_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 2
  })
  var distractor_4_left_speed1 = Object.assign({}, distractor_4_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_4_left_speed2 = Object.assign({}, distractor_4_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_5 = {
    type: "distractor",
    points: 0,
    images: ["tin-two.png"],
    positions: stim_positions,
    collectible: false,
    zIndex: -8000,
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var distractor_5_right = Object.assign({}, distractor_5, {
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_5_left = Object.assign({}, distractor_5, {
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_5_right_speed1 = Object.assign({}, distractor_5_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_5_right_speed2 = Object.assign({}, distractor_5_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 2
  })
  var distractor_5_left_speed1 = Object.assign({}, distractor_5_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_5_left_speed2 = Object.assign({}, distractor_5_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_6 = {
    type: "distractor",
    amount: 6,
    images: ["coral_a4.png"],
    positions: coral_positions,
    collectible: false,
    zIndex: -10000,
  };
  var distractor_7 = {
    type: "distractor",
    points: 0,
    images: ["brown-boot.png"],
    positions: stim_positions,
    collectible: false,
    zIndex: -8000,
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_collect_finished: (stim) => {
      stim.playback.set(0);
      stim.style.opacity = 0;
      let new_pos = stim_positions.next()
      stim.style.marginLeft = new_pos[0] + 'px'
      stim.style.marginTop = new_pos[1] + 'px'
      tween({ from: 0, to: 1, duration: 1000 }).start((v) => stim.style.opacity = v)
      //(-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  };
  var distractor_7_right = Object.assign({}, distractor_7, {
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_7_left = Object.assign({}, distractor_7, {
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
  })
  var distractor_7_right_speed1 = Object.assign({}, distractor_7_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_slow }, loop: Infinity }),
    amount: 2
  })
  var distractor_7_right_speed2 = Object.assign({}, distractor_7_right, {
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: velo_fast }, loop: Infinity }),
    amount: 1
  })
  var distractor_7_left_speed1 = Object.assign({}, distractor_7_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_slow }, loop: Infinity }),
    amount: 1
  })
  var distractor_7_left_speed2 = Object.assign({}, distractor_7_left, {
    animation: physics({ from: { x: 1920 / 2 }, velocity: { x: -velo_fast }, loop: Infinity }),
    amount: 2
  })

  // displays without travel time and toast (needed to create actual used displays)

  // list of distractors 
  let distractors = [distractor_1_right_speed1, distractor_1_right_speed2, distractor_1_left_speed1, distractor_1_left_speed2,
    distractor_2_right_speed1, distractor_2_right_speed2, distractor_2_left_speed1, distractor_2_left_speed2,
    distractor_3_right_speed1, distractor_3_right_speed2, distractor_3_left_speed1, distractor_3_left_speed2,
    distractor_4_right_speed1, distractor_4_right_speed2, distractor_4_left_speed1, distractor_4_left_speed2,
    distractor_5_right_speed1, distractor_5_right_speed2, distractor_5_left_speed1, distractor_5_left_speed2,
    distractor_6,
    distractor_7_right_speed1, distractor_7_right_speed2, distractor_7_left_speed1, distractor_7_left_speed2]

  // baseline
  let display_b_sc1 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_right_speed1, target_2_right_speed2, target_2_left_speed1, target_2_left_speed2,
      target_3_right_speed2, target_3_left_speed1, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_b_sc2 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_right_speed1, target_2_right_speed2, target_2_left_speed1, target_2_left_speed2,
      target_3_right_speed1, target_3_left_speed1, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_b_sc3 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_right_speed1, target_2_right_speed2, target_2_left_speed1, target_2_left_speed2,
      target_3_right_speed1, target_3_right_speed2, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_b_sc4 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_right_speed1, target_2_right_speed2, target_2_left_speed1, target_2_left_speed2,
      target_3_right_speed1, target_3_right_speed2, target_3_left_speed1,
      ...distractors
    ]
  };
  // Ende baseline

  // a1 
  let display_a1_sc1 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a1_right_speed1, target_2_a1_right_speed2, target_2_a1_left_speed1, target_2_a1_left_speed2,
      target_3_right_speed2, target_3_left_speed1, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_a1_sc2 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a1_right_speed1, target_2_a1_right_speed2, target_2_a1_left_speed1, target_2_a1_left_speed2,
      target_3_right_speed1, target_3_left_speed1, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_a1_sc3 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a1_right_speed1, target_2_a1_right_speed2, target_2_a1_left_speed1, target_2_a1_left_speed2,
      target_3_right_speed1, target_3_right_speed2, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_a1_sc4 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a1_right_speed1, target_2_a1_right_speed2, target_2_a1_left_speed1, target_2_a1_left_speed2,
      target_3_right_speed1, target_3_right_speed2, target_3_left_speed1,
      ...distractors
    ]
  };
  // Ende a1

  // a2 
  let display_a2_sc1 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a2_right_speed1, target_2_a2_right_speed2, target_2_a2_left_speed1, target_2_a2_left_speed2,
      target_3_right_speed2, target_3_left_speed1, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_a2_sc2 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a2_right_speed1, target_2_a2_right_speed2, target_2_a2_left_speed1, target_2_a2_left_speed2,
      target_3_right_speed1, target_3_left_speed1, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_a2_sc3 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a2_right_speed1, target_2_a2_right_speed2, target_2_a2_left_speed1, target_2_a2_left_speed2,
      target_3_right_speed1, target_3_right_speed2, target_3_left_speed2,
      ...distractors
    ]
  };
  let display_a2_sc4 = {
    elements: [
      target_1_right_speed1, target_1_right_speed2, target_1_left_speed1, target_1_left_speed2,
      target_2_a2_right_speed1, target_2_a2_right_speed2, target_2_a2_left_speed1, target_2_a2_left_speed2,
      target_3_right_speed1, target_3_right_speed2, target_3_left_speed1,
      ...distractors
    ]
  };
  // Ende a2
  ///////////// ANFANG DISPLAYS /////////////////

  let uboot = [3000, function () { document.getElementById('next-patch-click-html').style.visibility = "visible"; }]

  // baseline short
  let display_b_ttshort_sc1 = Object.assign({}, display_b_sc1, {
    travel_time: 1000, condition: "baseline_short", debug_msg: 'Condition is Baseline short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"]
  })

  let display_b_ttshort_sc1_toasta1 = Object.assign({}, display_b_ttshort_sc1, {
    tag: "b_ttshort_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc1_toasta2 = Object.assign({}, display_b_ttshort_sc1, {
    tag: "b_ttshort_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc2 = Object.assign({}, display_b_sc2, {
    travel_time: 1000, condition: "baseline_short", debug_msg: 'Condition is Baseline short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"]
  })

  let display_b_ttshort_sc2_toasta1 = Object.assign({}, display_b_ttshort_sc2, {
    tag: "b_ttshort_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc2_toasta2 = Object.assign({}, display_b_ttshort_sc2, {
    tag: "b_ttshort_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc3 = Object.assign({}, display_b_sc3, {
    travel_time: 1000, condition: "baseline_short", debug_msg: 'Condition is Baseline short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"]
  })

  let display_b_ttshort_sc3_toasta1 = Object.assign({}, display_b_ttshort_sc3, {
    tag: "b_ttshort_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc3_toasta2 = Object.assign({}, display_b_ttshort_sc3, {
    tag: "b_ttshort_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc4 = Object.assign({}, display_b_sc4, {
    travel_time: 1000, condition: "baseline_short", debug_msg: 'Condition is Baseline short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"]
  })

  let display_b_ttshort_sc4_toasta1 = Object.assign({}, display_b_ttshort_sc4, {
    tag: "b_ttshort_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttshort_sc4_toasta2 = Object.assign({}, display_b_ttshort_sc4, {
    tag: "b_ttshort_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  // baseline medium 
  let display_b_ttmedium_sc1 = Object.assign({}, display_b_sc1, {
    travel_time: 3000, condition: "baseline_medium", debug_msg: 'Condition is Baseline medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"]
  })

  let display_b_ttmedium_sc1_toasta1 = Object.assign({}, display_b_ttmedium_sc1, {
    tag: "b_ttmedium_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc1_toasta2 = Object.assign({}, display_b_ttmedium_sc1, {
    tag: "b_ttmedium_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc2 = Object.assign({}, display_b_sc2, {
    travel_time: 3000, condition: "baseline_medium", debug_msg: 'Condition is Baseline medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"]
  })

  let display_b_ttmedium_sc2_toasta1 = Object.assign({}, display_b_ttmedium_sc2, {
    tag: "b_ttmedium_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc2_toasta2 = Object.assign({}, display_b_ttmedium_sc2, {
    tag: "b_ttmedium_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc3 = Object.assign({}, display_b_sc3, {
    travel_time: 3000, condition: "baseline_medium", debug_msg: 'Condition is Baseline medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"]
  })

  let display_b_ttmedium_sc3_toasta1 = Object.assign({}, display_b_ttmedium_sc3, {
    tag: "b_ttmedium_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc3_toasta2 = Object.assign({}, display_b_ttmedium_sc3, {
    tag: "b_ttmedium_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc4 = Object.assign({}, display_b_sc4, {
    travel_time: 3000, condition: "baseline_medium", debug_msg: 'Condition is Baseline medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"]
  })

  let display_b_ttmedium_sc4_toasta1 = Object.assign({}, display_b_ttmedium_sc4, {
    tag: "b_ttmedium_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttmedium_sc4_toasta2 = Object.assign({}, display_b_ttmedium_sc4, {
    tag: "b_ttmedium_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  // baseline long
  let display_b_ttlong_sc1 = Object.assign({}, display_b_sc1, {
    travel_time: 5000, condition: "baseline_long", debug_msg: 'Condition is Baseline long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"]
  })

  let display_b_ttlong_sc1_toasta1 = Object.assign({}, display_b_ttlong_sc1, {
    tag: "b_ttlong_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc1_toasta2 = Object.assign({}, display_b_ttlong_sc1, {
    tag: "b_ttlong_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc2 = Object.assign({}, display_b_sc2, {
    travel_time: 5000, condition: "baseline_long", debug_msg: 'Condition is Baseline long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"]
  })

  let display_b_ttlong_sc2_toasta1 = Object.assign({}, display_b_ttlong_sc2, {
    tag: "b_ttlong_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc2_toasta2 = Object.assign({}, display_b_ttlong_sc2, {
    tag: "b_ttlong_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc3 = Object.assign({}, display_b_sc3, {
    travel_time: 5000, condition: "baseline_long", debug_msg: 'Condition is Baseline long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"]
  })

  let display_b_ttlong_sc3_toasta1 = Object.assign({}, display_b_ttlong_sc3, {
    tag: "b_ttlong_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc3_toasta2 = Object.assign({}, display_b_ttlong_sc3, {
    tag: "b_ttlong_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc4 = Object.assign({}, display_b_sc4, {
    travel_time: 5000, condition: "baseline_long", debug_msg: 'Condition is Baseline long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"]
  })

  let display_b_ttlong_sc4_toasta1 = Object.assign({}, display_b_ttlong_sc4, {
    tag: "b_ttlong_a1",
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  let display_b_ttlong_sc4_toasta2 = Object.assign({}, display_b_ttlong_sc4, {
    tag: "b_ttlong_a2",
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-small.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })

  //a1 short
  let display_a1_ttshort_sc1_toastb = Object.assign({}, display_a1_sc1, {
    travel_time: 1000, condition: "a1_short", tag: "a1_ttshort", debug_msg: 'Condition is a1 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttshort_sc2_toastb = Object.assign({}, display_a1_sc2, {
    travel_time: 1000, condition: "a1_short", tag: "a1_ttshort", debug_msg: 'Condition is a1 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttshort_sc3_toastb = Object.assign({}, display_a1_sc3, {
    travel_time: 1000, condition: "a1_short", tag: "a1_ttshort", debug_msg: 'Condition is a1 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttshort_sc4_toastb = Object.assign({}, display_a1_sc4, {
    travel_time: 1000, condition: "a1_short", tag: "a1_ttshort", debug_msg: 'Condition is a1 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  //a1 medium
  let display_a1_ttmedium_sc1_toastb = Object.assign({}, display_a1_sc1, {
    travel_time: 3000, condition: "a1_medium", tag: "a1_ttmedium", debug_msg: 'Condition is a1 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttmedium_sc2_toastb = Object.assign({}, display_a1_sc2, {
    travel_time: 3000, condition: "a1_medium", tag: "a1_ttmedium", debug_msg: 'Condition is a1 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttmedium_sc3_toastb = Object.assign({}, display_a1_sc3, {
    travel_time: 3000, condition: "a1_medium", tag: "a1_ttmedium", debug_msg: 'Condition is a1 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttmedium_sc4_toastb = Object.assign({}, display_a1_sc4, {
    travel_time: 3000, condition: "a1_medium", tag: "a1_ttmedium", debug_msg: 'Condition is a1 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  //a1 long
  let display_a1_ttlong_sc1_toastb = Object.assign({}, display_a1_sc1, {
    travel_time: 5000, condition: "a1_long", tag: "a1_ttlong", debug_msg: 'Condition is a1 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttlong_sc2_toastb = Object.assign({}, display_a1_sc2, {
    travel_time: 5000, condition: "a1_long", tag: "a1_ttlong", debug_msg: 'Condition is a1 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttlong_sc3_toastb = Object.assign({}, display_a1_sc3, {
    travel_time: 5000, condition: "a1_long", tag: "a1_ttlong", debug_msg: 'Condition is a1 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a1_ttlong_sc4_toastb = Object.assign({}, display_a1_sc4, {
    travel_time: 5000, condition: "a1_long", tag: "a1_ttlong", debug_msg: 'Condition is a1 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  //a2 short
  let display_a2_ttshort_sc1_toastb = Object.assign({}, display_a2_sc1, {
    travel_time: 1000, condition: "a2_short", tag: "a2_ttshort", debug_msg: 'Condition is a2 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttshort_sc2_toastb = Object.assign({}, display_a2_sc2, {
    travel_time: 1000, condition: "a2_short", tag: "a2_ttshort", debug_msg: 'Condition is a2 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttshort_sc3_toastb = Object.assign({}, display_a2_sc3, {
    travel_time: 1000, condition: "a2_short", tag: "a2_ttshort", debug_msg: 'Condition is a2 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttshort_sc4_toastb = Object.assign({}, display_a2_sc4, {
    travel_time: 1000, condition: "a2_short", tag: "a2_ttshort", debug_msg: 'Condition is a2 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  //a2 medium
  let display_a2_ttmedium_sc1_toastb = Object.assign({}, display_a2_sc1, {
    travel_time: 3000, condition: "a2_medium", tag: "a2_ttmedium", debug_msg: 'Condition is a2 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttmedium_sc2_toastb = Object.assign({}, display_a2_sc2, {
    travel_time: 3000, condition: "a2_medium", tag: "a2_ttmedium", debug_msg: 'Condition is a2 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttmedium_sc3_toastb = Object.assign({}, display_a2_sc3, {
    travel_time: 3000, condition: "a2_medium", tag: "a2_ttmedium", debug_msg: 'Condition is a2 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttmedium_sc4_toastb = Object.assign({}, display_a2_sc4, {
    travel_time: 3000, condition: "a2_medium", tag: "a2_ttmedium", debug_msg: 'Condition is a2 medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  //a2 long
  let display_a2_ttlong_sc1_toastb = Object.assign({}, display_a2_sc1, {
    travel_time: 5000, condition: "a2_long", tag: "a2_ttlong", debug_msg: 'Condition is a2 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttlong_sc2_toastb = Object.assign({}, display_a2_sc2, {
    travel_time: 5000, condition: "a2_long", tag: "a2_ttlong", debug_msg: 'Condition is a2 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttlong_sc3_toastb = Object.assign({}, display_a2_sc3, {
    travel_time: 5000, condition: "a2_long", tag: "a2_ttlong", debug_msg: 'Condition is a2 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  let display_a2_ttlong_sc4_toastb = Object.assign({}, display_a2_sc4, {
    travel_time: 5000, condition: "a2_long", tag: "a2_ttlong", debug_msg: 'Condition is a2 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })

  //demo trials 

  let demo_1 = Object.assign({}, display_b_sc4, {
    travel_time: 3000, condition: "practice", debug_msg: 'Demo is Baseline medium travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_medium_yellow.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),
    backgrounds: ["background_brown_1.jpg", "background_brown_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info(toast_a2 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-right.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })
  let demo_2 = Object.assign({}, display_a2_sc3, {
    travel_time: 5000, condition: "practice", debug_msg: 'Demo is a2 long travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_low_red.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 5000 }),
    backgrounds: ["background_purple_1.jpg", "background_purple_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })
  let demo_3 = Object.assign({}, display_b_sc2, {
    travel_time: 1000, condition: "practice", debug_msg: 'Demo is Baseline short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info(toast_a1 + "  <image src='media/images/foraging-fishes/" + all_fish[1] + "-right.gif" + "'style=width:20%>", { duration: 0, }); }], uboot],
  })
  let demo_4 = Object.assign({}, display_a1_sc1, {
    travel_time: 1000, condition: "practice", debug_msg: 'Demo is a1 short travel time',
    travel_img: "<div style='top:20px; left: 1600px; visibility: hidden' id='next-patch-click-html' class='next-click'><img src='media/images/foraging-fishes/sub_tacho_high_green.png'/></div>",
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    backgrounds: ["background_blue_1.jpg", "background_blue_2.jpg"],
    on_time_passed: [
      [3000, function () { pb.info('<b>Im nächsten Becken  kein Angebot.</b>', { duration: 0, }); }], uboot],
  })
  let demo_trials = [
    demo_1, demo_2, demo_3, demo_4,
  ];
  /////////////// ENDE DISPLAYS ////////////////////

  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    background_color: 'black',
    images_path: "media/images/foraging-fishes/", // path to image folder
    patch_size: [1920, 1080], // in visual pixels
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    condition: jsPsych.timelineVariable("condition"), // Conditions 
    tag: jsPsych.timelineVariable("tag"), // what is the type of the actual patch and what is the offer in the next one (for baseline patches) 
    debug_msg: jsPsych.timelineVariable("debug_msg"), // Conditions
    travel_time: jsPsych.timelineVariable("travel_time"), // Use element lists from the trial list
    travel_img: jsPsych.timelineVariable("travel_img"), // U-Boot + Tacho
    next_patch_click_html: jsPsych.timelineVariable("travel_img"), // U-Boot + Tacho
    timeout: 25000, // automatic patch leaving after 25 sec 
    backgrounds: jsPsych.timelineVariable("backgrounds"),
    patch_leaving_animation: jsPsych.timelineVariable("patch_leaving_animation"),
    on_time_passed: jsPsych.timelineVariable("on_time_passed"), // for toasts 

    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    block_points_read_out_function: readout_block_points,

    points_display_html: //gesamtpunktzahl
      "<div style='top:20px; left: 15px'id='points-display-html' class='points-display'><font size=+4 face='Arial' color='black' > <b>Punkte: %%</b> </font></div>",
    point_indicator: // aufsteigende punktzahl am fisch 
      "<div id='point-indicator-html' class='point-indicator'><font size=+4 face='Comic Sans MS' color='#000000'>%%</font></div>", //schwarz, früher dunkelblau: 0000AA
    point_animation: physics({
      from: { opacity: 1, y: -60 },
      to: { opacity: 0 },
      velocity: { y: -120, opacity: -1 },
    }),

    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 1920, 1080, 0);
    },
    // on_load:
    //   pb.clear(),

    on_finish: function () {
      pb.clear();
      console.log("Toasts wurden gecleared");
      console.log("max_points =", max_points);
      console.log("readout point counter", readout_point_counter());
      if (readout_point_counter() >= max_points) {
        max_points = max_points + max_block_points;

        console.log(max_points);
        console.log(max_block_points);
        console.log(readout_point_counter);
        jsPsych.endCurrentTimeline();
        console.log("test");

      }
    },
  };
  //// INSTRUCTIONS ////
  timeline.push({
    type: "html-button-response",
    stimulus:
      "<font size='+1'>" +
      // "<b>Herzlich Willkommen!</b><br><b> Vielen Dank für Ihr Interesse an unserer Studie zum Thema visuelle Suche!</b><br><br>" +
      "<p class='left'>Ein paar Hinweise bevor es losgeht:<p/>" +
      "<ul>" +
      '<li style="text-align:left;">Bitte benutzen Sie einen <b>PC oder Laptop</b> mit Maus für dieses Experiment (kein Smartphone, Tablet o. Ä.).</br> </li>' +
      '<li style="text-align:left;">Das Experiment wird ungefähr <b>30 Minuten</b> dauern.</br> </li>' +
      '<li style="text-align:left;">Positionieren Sie sich bequem vor Ihrem Computer, so wie Sie ihn normalerweise benutzen.</br> </li>' +
      '<li style="text-align:left;">Vermeiden Sie Störquellen auf dem PC: Schließen Sie andere Programme und Browser-Tabs.</br></li>' +
      '<li style="text-align:left;">Vermeiden Sie Störquellen im Zimmer: Schalten Sie Musik, TV etc. aus und lassen Sie sich nicht durch andere Personen ablenken.</br></li>' +
      '<li style="text-align:left;">Sollten Sie den Versuch abbrechen wollen, dann drücken Sie ESC und schließen Sie das Browserfenster. Wir löschen dann die Daten.</br></br></li>' +
      "</ul>",
    choices: ['Weiter'],
  });

  var instructions = {
    type: "instructions",
    pages: [
      "<font size='+1'>" +
      "<b>Willkommen!</b> <br/>" +
      "In diesem Experiment schlüpfen Sie in die Rolle eines Fischers. <br/>" +
      "Hier sehen Sie, wie ein Fischbecken im Experiment aussieht:<br/>" +
      "<image src='media/images/foraging-fishes/instruction.png'><br />" +
      "Die Objekte werden sich zusätzlich bewegen.<br/><br/>" +
      "Ihre Aufgabe besteht darin, Fische zu sammeln.<br/>",

      "<font size='+1'>" +
      "Sammeln geht durch Klicken mit der Maus auf das gewünschte Objekt.<br/>" +
      "Aber Achtung: Nur manche Fische geben Punkte!<br/><br/>" +
      "Für diesen Fisch gibt es <b>4 Punkte</b>:<br/><br/>" +
      "<img src='media/images/foraging-fishes/" + all_fish[0] + "-right.gif" + "'/><br/>" +
      "Für diesen Fisch gibt es <b>8 Punkte</b>:<br/><br/>" +
      "<img src='media/images/foraging-fishes/" + all_fish[1] + "-right.gif" + "'/><br/>" +
      "Für diesen Fisch gibt es <b>16 Punkte</b>:<br/><br/>" +
      "<img src='media/images/foraging-fishes/" + all_fish[2] + "-right.gif" + "'/><br/>" +
      "Andere Fische können Minuspunkte geben.<br/>" +
      "Ihr Ziel ist es, möglichst schnell <b>24.000 Punkte</b> zu erreichen.",

      "<font size='+1'>" +
      "Ein Fisch ist besonders: Er kann manchmal im Angebot sein und mehr Punkte bringen!<br/>" +
      "Gibt es im nächsten Becken ein solches <b>Angebot</b>, wird es angezeigt, z.B. so:<br/><br/>" +
      "<image src='media/images/foraging-fishes/Angebot.png'><br/><br/>",

      "<font size='+1'>" +
      "Wenn Ihnen das nächste Becken attraktiver erscheint, können Sie jederzeit auf das <b>U-Boot</b> oben rechts klicken, um dorthin zu gelangen.<br/><br/>" +
      "<image src='media/images/foraging-fishes/uboot.png'><br/><br/>" +
      "Vorsicht: Die Fahrt mit dem U-Boot dauert eine Weile. Wie lange, hängt vom jeweiligen U-Boot ab.<br/>" +
      "Wie schnell das U-Boot ist, können Sie an dem <b>Tacho</b> ablesen: Ist der Zeiger weiter links, ist das U-Boot langsamer, ist er weiter rechts, ist es schneller.<br/>" +
      "<p class='center'><image src='media/images/foraging-fishes/tacho_low_red.png'> <image src='media/images/foraging-fishes/tacho_medium_yellow.png'> <image src='media/images/foraging-fishes/tacho_high_green.png'> <p/>",

      "<font size='+1'>" +
      "Klicken Sie auf 'Weiter', um an vier Becken zu üben. Achten Sie dabei auch auf die Anzeige des Angebots und den Tacho. <br/><br/>" +
      "Mit dem nächsten Bildschirm geht es los!"
    ],
    show_clickable_nav: true,
    button_label_previous: "Zurück",
    button_label_next: "Weiter",
  };

  let fullscreen = {
    type: "fullscreen",
    message: "Der Versuch geht jetzt in den Vollbildmodus! <br />",
    button_label: 'Weiter',
    fullscreen_mode: true,
  }
  timeline.push(fullscreen);

  timeline.push(instructions);

  timeline.push({
    timeline: [patch],
    timeline_variables: demo_trials
  });

  // text nach demo trials 
  timeline.push({
    type: "instructions",
    pages: [
      "<font size='+1'>" +
      "Das waren vier Becken zur Übung. <br />" +
      "Denken Sie daran, dass Sie jederzeit das Becken verlassen können, wenn Ihnen das nächste attraktiver erscheint. <br />" +
      "<b>Versuchen Sie, ab jetzt so schnell wie möglich zu sein, um den besten Verkaufsstand am Hafen zu bekommen!</b> <br> <br />" +
      "Das Experiment beginnt mit dem nächsten Klick. <br />" +
      "Viel Erfolg!",
    ],
    show_clickable_nav: true,
    button_label_previous: "Zurück",
    button_label_next: "Start",
  });

  //// PUSH TRIALS IN TIMELINE //////
  count_a1 = 0;
  count_a2 = 0;
  count_sc1 = 0;
  count_sc2 = 0;
  count_sc3 = 0;
  count_sc4 = 0;

  let ttshort_trials = []; // list of trials in block with travel time short
  for (let i = 1; i <= 1000; i++) {
    // baseline in short 
    next_sc = get_next_sc();
    next_sale = get_next_sale();

    let displays_b_ttshort = [
      [display_b_ttshort_sc1_toasta1, display_b_ttshort_sc1_toasta2],
      [display_b_ttshort_sc2_toasta1, display_b_ttshort_sc2_toasta2],
      [display_b_ttshort_sc3_toasta1, display_b_ttshort_sc3_toasta2],
      [display_b_ttshort_sc4_toasta1, display_b_ttshort_sc4_toasta2]];

    ttshort_trials.push(displays_b_ttshort[next_sc - 1][next_sale - 1]);

    if (i < 10) {
      console.log("count a1 short ist", count_a1)
      console.log("count a2 short ist", count_a2)
      console.log("diff short ist", diff)
    }

    let displays_ax_ttshort = [
      [display_a1_ttshort_sc1_toastb, display_a2_ttshort_sc1_toastb],
      [display_a1_ttshort_sc2_toastb, display_a2_ttshort_sc2_toastb],
      [display_a1_ttshort_sc3_toastb, display_a2_ttshort_sc3_toastb],
      [display_a1_ttshort_sc4_toastb, display_a2_ttshort_sc4_toastb]];

    next_sc = get_next_sc();
    ttshort_trials.push(displays_ax_ttshort[next_sc - 1][next_sale - 1]);

  }// Ende for-Scheife ttshort-trials

  let ttmedium_trials = []; // list of trials in block with travel time medium
  for (let i = 1; i <= 1000; i++) {
    // baseline in medium 
    next_sc = get_next_sc();
    next_sale = get_next_sale();

    let displays_b_ttmedium = [
      [display_b_ttmedium_sc1_toasta1, display_b_ttmedium_sc1_toasta2],
      [display_b_ttmedium_sc2_toasta1, display_b_ttmedium_sc2_toasta2],
      [display_b_ttmedium_sc3_toasta1, display_b_ttmedium_sc3_toasta2],
      [display_b_ttmedium_sc4_toasta1, display_b_ttmedium_sc4_toasta2]];

    ttmedium_trials.push(displays_b_ttmedium[next_sc - 1][next_sale - 1]);

    if (i < 10) {
      console.log("count a1 medium ist", count_a1)
      console.log("count a2 medium ist", count_a2)
      console.log("diff medium ist", diff)
    }

    let displays_ax_ttmedium = [
      [display_a1_ttmedium_sc1_toastb, display_a2_ttmedium_sc1_toastb],
      [display_a1_ttmedium_sc2_toastb, display_a2_ttmedium_sc2_toastb],
      [display_a1_ttmedium_sc3_toastb, display_a2_ttmedium_sc3_toastb],
      [display_a1_ttmedium_sc4_toastb, display_a2_ttmedium_sc4_toastb]];

    next_sc = get_next_sc();
    ttmedium_trials.push(displays_ax_ttmedium[next_sc - 1][next_sale - 1]);

  }// Ende for-Schleife ttmedium trials

  let ttlong_trials = []; // list of trials in block with travel time long
  // baseline in long
  for (let i = 1; i <= 1000; i++) {

    next_sc = get_next_sc();
    next_sale = get_next_sale();

    let displays_b_ttlong = [
      [display_b_ttlong_sc1_toasta1, display_b_ttlong_sc1_toasta2],
      [display_b_ttlong_sc2_toasta1, display_b_ttlong_sc2_toasta2],
      [display_b_ttlong_sc3_toasta1, display_b_ttlong_sc3_toasta2],
      [display_b_ttlong_sc4_toasta1, display_b_ttlong_sc4_toasta2]];

    ttlong_trials.push(displays_b_ttlong[next_sc - 1][next_sale - 1]);

    if (i < 10) {
      console.log("count a1 long ist", count_a1)
      console.log("count a2 long ist", count_a2)
      console.log("diff long ist", diff)
    }
    let displays_ax_ttlong = [
      [display_a1_ttlong_sc1_toastb, display_a2_ttlong_sc1_toastb],
      [display_a1_ttlong_sc2_toastb, display_a2_ttlong_sc2_toastb],
      [display_a1_ttlong_sc3_toastb, display_a2_ttlong_sc3_toastb],
      [display_a1_ttlong_sc4_toastb, display_a2_ttlong_sc4_toastb]];

    next_sc = get_next_sc();
    ttlong_trials.push(displays_ax_ttlong[next_sc - 1][next_sale - 1]);
  }// Ende for-Schleife ttlong trials


  let trials = []
  let list_of_blocks = [ttshort_trials, ttmedium_trials, ttlong_trials];
  list_of_blocks = jsPsych.randomization.shuffle(list_of_blocks); //Randomisiert Block-Reihenfolge

  switch (list_of_blocks[0]) { // needed for text shown after a block is finished 
    case ttshort_trials:
      first_tt = 1;
      break;
    case ttmedium_trials:
      first_tt = 2;
      break;
    case ttlong_trials:
      first_tt = 3;
      break;
  }
  switch (list_of_blocks[1]) {
    case ttshort_trials:
      second_tt = 1;
      break;
    case ttmedium_trials:
      second_tt = 2;
      break;
    case ttlong_trials:
      second_tt = 3;
      break;
  }
  switch (list_of_blocks[2]) {
    case ttshort_trials:
      third_tt = 1;
      break;
    case ttmedium_trials:
      third_tt = 2;
      break;
    case ttlong_trials:
      third_tt = 3;
      break;
  }

  let point_counter = 0;
  let last_point_counter = 0;
  let last_time = 0;
  let last_eps = null;
  let last_last_eps = null;
  let start_time = null;

  timeline.push({           // nach timeline.push demo_trials 
    type: "call-function",
    func: function () {
      point_counter = 0;
      last_point_counter = 0;
      last_time = 0;
      last_eps = null;
      last_last_eps = null;
      start_time = null;
      last_time = performance.now();
      start_time = performance.now();
    },
  });

  let total = 0;
  let exp_break = { //Feedback 
    type: "html-keyboard-response",
    stimulus: function () {
      total = readout_point_counter();          //Gesamtzahl aller Punkte
      var current_points = total
      var current_time = performance.now();
      var collected_since_last_break = current_points - last_point_counter;
      var duration = current_time - last_time;
      var current_eps = Math.ceil(
        (collected_since_last_break / (duration / 1000)) * 60
      );
      last_point_counter = current_points;
      last_time = current_time;
      var stim =
        "Ihre Sammelgeschwindigkeit ist " +
        current_eps +
        " Punkte pro Minute!<br /> <br />";
      if (last_eps != null) {
        stim +=
          "Im letzten Durchgang war sie " +
          last_eps +
          " Punkte pro Minute!<br /> <br />";
      }
      if (last_last_eps != null) {
        stim +=
          "Im vorletzten Durchgang war sie " +
          last_last_eps +
          " Punkte pro Minute!<br /> <br />";
      }
      stim +=
        "Schaffen Sie es, noch schneller zu werden? <br /><br />Weiter mit Tastendruck ...";
      last_last_eps = last_eps;
      last_eps = current_eps;
      return stim;
    },
  };// Ende for-Schleife 

  var conditional_break = {
    timeline: [exp_break],
    conditional_function: function () {
      let real_trials = -4; //früher 0, wegen demo jetzt -4 
      let res = jsPsych.data.get().values();
      for (var t = 0; t < res.length; t++) {
        if (res[t].type == 'foraging-patch') {
          real_trials++;
        }
      }
      if ((real_trials) % 8 == 0) {
        console.log("Jetzt soll Pause gezeigt werden!");
        return true;
      } else {
        return false;
      }
    }
  };

  timeline.push({
    timeline: [patch, conditional_break],
    timeline_variables: list_of_blocks[0], // block with first random travel time
  });

  if (second_tt > first_tt) {
    timeline.push({
      type: "html-keyboard-response",
      stimulus:
        "<font size='+2'>" +
        "Ab jetzt ist das U-Boot langsamer!<br/><br/>" +
        "<img src = 'media/images/foraging-fishes/submarine.png'>" +
        "<br/><br/>Weiter mit Tastendruck!" +
        "</font>",
    });
  }
  else {
    timeline.push({
      type: "html-keyboard-response",
      stimulus:
        "<font size='+2'>" +
        "Ab jetzt ist das U-Boot schneller!<br/><br/>" +
        "<img src = 'media/images/foraging-fishes/submarine.png'>" +
        "<br/><br/>Weiter mit Tastendruck!" +
        "</font>",
    });
  }
  timeline.push({
    timeline: [patch, conditional_break],
    timeline_variables: list_of_blocks[1], // block with second random travel time
  });
  if (third_tt > second_tt) {
    timeline.push({
      type: "html-keyboard-response",
      stimulus:
        "<font size='+2'>" +
        "Ab jetzt ist das U-Boot langsamer!<br/><br/>" +
        "<img src = 'media/images/foraging-fishes/submarine.png'>" +
        "<br/><br/>Weiter mit Tastendruck!" +
        "</font>",
    });
  }
  else {
    timeline.push({
      type: "html-keyboard-response",
      stimulus:
        "<font size='+2'>" +
        "Ab jetzt ist das U-Boot schneller!<br/><br/>" +
        "<img src = 'media/images/foraging-fishes/submarine.png'>" +
        "<br/><br/>Weiter mit Tastendruck!" +
        "</font>",
    });
  }
  timeline.push({
    timeline: [patch, conditional_break],
    timeline_variables: list_of_blocks[2], // block with third random travel time 
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<font size='+1'>" +
      "<b>Danke, das war's mit dem Sammeln!</b><br><br>" +
      "Es folgen noch zwei kurze Fragen und dann sind wir fertig.<br><br>" +
      "Weiter mit Tastendruck!</font><br><br>",
  });
  let yesno = ["Ja", "Nein"];
  timeline.push({
    type: 'survey-text',
    questions: [
      { prompt: "Haben Sie bei dem Versuch eine Strategie angewendet? Wenn ja, welche?", rows: 5, columns: 40 },
    ],
    response_ends_trial: true
  });
  timeline.push({
    type: 'survey-text',
    questions: [
      { prompt: "Möchten Sie sonst noch einen Kommentar hinterlassen?", rows: 5, columns: 40 },
    ],
    response_ends_trial: true
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<b>Vielen Dank für Ihre Teilnahme!</b> </br></br>" +
      "Der Versuch ist nun beendet!</br>" +
      "Drücken Sie eine Taste, Sie werden dann zu Prolific weitergeleitet.</br></br>" +
      "<b>Wichtig:</b></br>"+
      "Schließen Sie diesen Browser-Tab erst, nachdem diese Nachricht nicht mehr sichtbar ist! Dies kann einen Moment dauern. <br /><br />",
    trial_duration: 10000,
  });
  timeline.push(getDoNotReloadToastNode());

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
