/**
 * @title ForagingEE
 * @description easter egg hunt
 * @version 1.0-final-prolific
 *
 * @imageDir images/ee-foraging
 *    
 */

import "../styles/jspsych-foraging-patch.scss";
import "../styles/main.scss";
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-image-button-response";
import "jspsych/plugins/jspsych-external-html";
import "jspsych/plugins/jspsych-call-function";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-survey-multi-choice";
import "jspsych/plugins/jspsych-survey-text";
import "jspsych/plugins/jspsych-html-slider-response";
import "./plugins/jspsych-foraging-patch";

import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween, physics, } from "popmotion";
const clonedeep = require("lodash.clonedeep");
const isequal = require("lodash.isequal");

/**
 * Creates the experiment's jsPsych timeline.
 *
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 *
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */ 
export function createTimeline(jatosStudyInput = null) {
  if (typeof jatos  !== 'undefined') {
    pid = jatos.urlQueryParameters['prolific_id'];
  }

  let max_eggs = 1000;
  let top_left_positions = new JitteredGridCoordinates({
    columns: 10,
    rows: 6,
    hspacing: 90,
    vspacing: 70,
    hjitter: 10,
    vjitter: 10,
    hoffset: -10 * 50 - 30 + 50,
    voffset: -5 * 50 + 70,
    on_used_up: "nothing", //, on_patch_done : 'reset'
  });

  let top_right_positions = new JitteredGridCoordinates({
    columns: 10,
    rows: 6,
    hspacing: 90,
    vspacing: 70,
    hjitter: 10,
    vjitter: 10,
    hoffset: +10 * 50 - 30 - 50,
    voffset: -5 * 50 + 70,
    on_used_up: "nothing", //, on_patch_done : 'reset'
  });

  let bottom_left_positions = new JitteredGridCoordinates({
    columns: 10,
    rows: 6,
    hspacing: 90,
    vspacing: 70,
    hjitter: 10,
    vjitter: 10,
    hoffset: -10 * 50 - 30 + 50,
    voffset: +5 * 50 + 60 - 45,
    on_used_up: "nothing", //, on_patch_done : 'reset'
  });

  let bottom_right_positions = new JitteredGridCoordinates({
    columns: 10,
    rows: 6,
    hspacing: 90,
    vspacing: 70,
    hjitter: 10,
    vjitter: 10,
    hoffset: +10 * 50 - 30 - 50,
    voffset: +5 * 50 + 60 - 45,
    on_used_up: "nothing", //, on_patch_done : 'reset'
  });

  let cloud_positions = new JitteredGridCoordinates({
    columns: 5,
    rows: 1,
    hspacing: 300,
    vspacing: 0,
    hjitter: 30,
    vjitter: 0,
    hoffset: 0,
    voffset: -550,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });

  // Initialize timeline
  let timeline = [];

  timeline.push({
    type: "survey-text",
    questions: [{ prompt: "Bitte geben Sie ihr Alter ein" }],
  });

  var sex = ["männlich", "weiblich", "divers"];
  var hands = ["Rechtshänder", "Linkshänder"];
  var sight = ["keine Sehilfe", "eine Sehhilfe (Brille oder Kontaktlinsen)"];

  timeline.push({
    type: "survey-multi-choice",
    questions: [
      { prompt: "Ich bin", name: "sex", options: sex, required: true },
      { prompt: "Ich bin", name: "hand", options: hands, required: true },
      {
        prompt: "Ich benötige und trage",
        name: "sight",
        options: sight,
        required: true,
      },
    ],
  });


  let img = 'media/images/ee-foraging/instruction.jpg'
  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<image src=" +img+ " style=width:40%><br></br>" +
      "<font size='+2'>" +
      "<p>Ein paar Hinweise bevor es los geht:<p/>" +
      "<p align='left'>" +
      "<ul>" +
      "<li>In diesem Versuch wirst Du Ostereier sammeln!</li>" +
      "<li>Bitte benutze einen PC oder Laptop auf einem Tisch mit Maus für diesen Versuch (keine Handys, Tablets, o.ä.).</li>" +
      "<li>Mache bitte nur kurze Pausen und nur dann, wenn der Versuch Feedback (wie viele Eier gesammelt wurden) anzeigt. </li>" +
      "<li>Positioniere Dich bequem vor Deinem Computer, so wie Du ihn normalerweise benutzt.</li>" +
      "<li>Vermeide Störquellen auf dem PC: Andere Programme und Browser-Tabs schließen.</li>" +
      "<li>Vermeide Störquellen im Zimmer: Schalte Fernseher, Radio u.ä. ab und lasse Dich nicht durch andere Personen ablenken.</li>" +
      "<li>Solltest Du den Versuch abbrechen wollen, dann drücke ESC und schließe das Browserfenster. Wir löschen dann die Daten. </li><br />" +
      "</ul>" +
      "</p>" +
      "Weiter mit Tastendruck!</font>",
  });

  // Switch to fullscreen
  timeline.push({
    type: "fullscreen",
    message: "Der Versuch geht jetzt in den Vollbildmodus! <br />",
    button_label: 'Weiter', 
    fullscreen_mode: true,
  });

  const targets = {
    type: "target",
    images: ["grass.png", "grass.png", "grass.png"],
    mouseover_images: ["egg1.png", "egg2.png", "egg3.png"],
    //images: ['egg1.png', 'egg2.png', 'egg3.png'],
    collected_images: ["grass.png", "grass.png", "grass.png"],
    mouseover_collected_images: ["empty.png", "empty.png", "empty.png"],
    cover_on_mouseleave: true,
    collectible: true,
    points: 1,
    animation: tween({
      from: { rotate: -2, x: -1 },
      to: { rotate: 2, x: 1 },
      duration: 1500,
      elapsed: Math.floor(Math.random() * 1500.0),
      //ease: easing.linear,
      flip: Infinity,
    }),
  };

  const distractors = {
    type: "distractor",
    images: ["grass.png", "grass.png", "grass.png"],
    mouseover_images: ["empty.png", "empty.png", "empty.png"],
    collectible: false,
    cover_on_mouseleave: true,
    //points: 0,
    animation: tween({
      from: { rotate: -2, x: -1 },
      to: { rotate: 2, x: 1 },
      duration: 1500,
      elapsed: Math.floor(Math.random() * 1500.0),
      flip: Infinity,
    }),
  };

  const targets_many = Object.assign(
    {},
    { amount: 15, tag: "many_targets" },
    targets
  );
  const distractors_many = Object.assign(
    {},
    { amount: 5, tag: "many_targets" },
    distractors
  );
  const targets_few = Object.assign(
    {},
    { amount: 2, tag: "few_targets" },
    targets
  );
  const distractors_few = Object.assign(
    {},
    { amount: 18, tag: "few_targets" },
    distractors
  );

  const targets_practice = Object.assign(
    {},
    { amount: 10, tag: "practice" },
    targets
  );
  const distractors_practice = Object.assign(
    {},
    { amount: 10, tag: "practice" },
    distractors
  );

  let tl_rewind = Object.assign(
    new JitteredGridCoordinates(),
    top_left_positions,
    { on_patch_done: "rewind" }
  );
  let tr_rewind = Object.assign(
    new JitteredGridCoordinates(),
    top_right_positions,
    { on_patch_done: "rewind" }
  );
  let bl_rewind = Object.assign(
    new JitteredGridCoordinates(),
    bottom_left_positions,
    { on_patch_done: "rewind" }
  );
  let br_rewind = Object.assign(
    new JitteredGridCoordinates(),
    bottom_right_positions,
    { on_patch_done: "rewind" }
  );

  let tl_reset = Object.assign(
    new JitteredGridCoordinates(),
    top_left_positions,
    { on_patch_done: "reset" }
  );
  let tr_reset = Object.assign(
    new JitteredGridCoordinates(),
    top_right_positions,
    { on_patch_done: "reset" }
  );
  let bl_reset = Object.assign(
    new JitteredGridCoordinates(),
    bottom_left_positions,
    { on_patch_done: "reset" }
  );
  let br_reset = Object.assign(
    new JitteredGridCoordinates(),
    bottom_right_positions,
    { on_patch_done: "reset" }
  );

  // THIS IS UGLY BUT IT DOES WHAT I WANT

  // Sub-patch with many target is in the top left (ttl)
  const ttl_tl_rewind = clonedeep(tl_rewind);
  ttl_tl_rewind.reset();
  const ttl_tr_rewind = clonedeep(tr_rewind);
  ttl_tr_rewind.reset();
  const ttl_bl_rewind = clonedeep(bl_rewind);
  ttl_bl_rewind.reset();
  const ttl_br_rewind = clonedeep(br_rewind);
  ttl_br_rewind.reset();

  const ttl_ttl_rep = Object.assign({}, targets_many, {
    positions: ttl_tl_rewind,
  });
  const ttl_dtl_rep = Object.assign({}, distractors_many, {
    positions: ttl_tl_rewind,
  });
  const ttl_ttr_rep = Object.assign({}, targets_few, {
    positions: ttl_tr_rewind,
  });
  const ttl_dtr_rep = Object.assign({}, distractors_few, {
    positions: ttl_tr_rewind,
  });
  const ttl_tbl_rep = Object.assign({}, targets_few, {
    positions: ttl_bl_rewind,
  });
  const ttl_dbl_rep = Object.assign({}, distractors_few, {
    positions: ttl_bl_rewind,
  });
  const ttl_tbr_rep = Object.assign({}, targets_few, {
    positions: ttl_br_rewind,
  });
  const ttl_dbr_rep = Object.assign({}, distractors_few, {
    positions: ttl_br_rewind,
  });

  // Sub-patch with many target is in the top right (ttr)
  const ttr_tl_rewind = clonedeep(tl_rewind);
  ttr_tl_rewind.reset();
  const ttr_tr_rewind = clonedeep(tr_rewind);
  ttr_tr_rewind.reset();
  const ttr_bl_rewind = clonedeep(bl_rewind);
  ttr_bl_rewind.reset();
  const ttr_br_rewind = clonedeep(br_rewind);
  ttr_br_rewind.reset();

  const ttr_ttl_rep = Object.assign({}, targets_few, {
    positions: ttr_tl_rewind,
  });
  const ttr_dtl_rep = Object.assign({}, distractors_few, {
    positions: ttr_tl_rewind,
  });
  const ttr_ttr_rep = Object.assign({}, targets_many, {
    positions: ttr_tr_rewind,
  });
  const ttr_dtr_rep = Object.assign({}, distractors_many, {
    positions: ttr_tr_rewind,
  });
  const ttr_tbl_rep = Object.assign({}, targets_few, {
    positions: ttr_bl_rewind,
  });
  const ttr_dbl_rep = Object.assign({}, distractors_few, {
    positions: ttr_bl_rewind,
  });
  const ttr_tbr_rep = Object.assign({}, targets_few, {
    positions: ttr_br_rewind,
  });
  const ttr_dbr_rep = Object.assign({}, distractors_few, {
    positions: ttr_br_rewind,
  });

  // Sub-patch with many target is in the top right (tbl)
  const tbl_tl_rewind = clonedeep(tl_rewind);
  tbl_tl_rewind.reset();
  const tbl_tr_rewind = clonedeep(tr_rewind);
  tbl_tr_rewind.reset();
  const tbl_bl_rewind = clonedeep(bl_rewind);
  tbl_bl_rewind.reset();
  const tbl_br_rewind = clonedeep(br_rewind);
  tbl_br_rewind.reset();

  const tbl_ttl_rep = Object.assign({}, targets_few, {
    positions: tbl_tl_rewind,
  });
  const tbl_dtl_rep = Object.assign({}, distractors_few, {
    positions: tbl_tl_rewind,
  });
  const tbl_ttr_rep = Object.assign({}, targets_few, {
    positions: tbl_tr_rewind,
  });
  const tbl_dtr_rep = Object.assign({}, distractors_few, {
    positions: tbl_tr_rewind,
  });
  const tbl_tbl_rep = Object.assign({}, targets_many, {
    positions: tbl_bl_rewind,
  });
  const tbl_dbl_rep = Object.assign({}, distractors_many, {
    positions: tbl_bl_rewind,
  });
  const tbl_tbr_rep = Object.assign({}, targets_few, {
    positions: tbl_br_rewind,
  });
  const tbl_dbr_rep = Object.assign({}, distractors_few, {
    positions: tbl_br_rewind,
  });

  // Sub-patch with many target is in the top right (tbr)
  const tbr_tl_rewind = clonedeep(tl_rewind);
  tbr_tl_rewind.reset();
  const tbr_tr_rewind = clonedeep(tr_rewind);
  tbr_tr_rewind.reset();
  const tbr_bl_rewind = clonedeep(bl_rewind);
  tbr_bl_rewind.reset();
  // Welcome screen
  const tbr_br_rewind = clonedeep(br_rewind);
  tbr_br_rewind.reset();

  const tbr_ttl_rep = Object.assign({}, targets_few, {
    positions: tbr_tl_rewind,
  });
  const tbr_dtl_rep = Object.assign({}, distractors_few, {
    positions: tbr_tl_rewind,
  });
  const tbr_ttr_rep = Object.assign({}, targets_few, {
    positions: tbr_tr_rewind,
  });
  const tbr_dtr_rep = Object.assign({}, distractors_few, {
    positions: tbr_tr_rewind,
  });
  const tbr_tbl_rep = Object.assign({}, targets_few, {
    positions: tbr_bl_rewind,
  });
  const tbr_dbl_rep = Object.assign({}, distractors_few, {
    positions: tbr_bl_rewind,
  });
  const tbr_tbr_rep = Object.assign({}, targets_many, {
    positions: tbr_br_rewind,
  });
  const tbr_dbr_rep = Object.assign({}, distractors_many, {
    positions: tbr_br_rewind,
  });

  // The novels are so much easier, because all position generators can act randomly
  const ttl_ttl_nov = Object.assign({}, targets_many, { positions: tl_reset });
  const ttl_dtl_nov = Object.assign({}, distractors_many, {
    positions: tl_reset,
  });
  const ttl_ttr_nov = Object.assign({}, targets_few, { positions: tr_reset });
  const ttl_dtr_nov = Object.assign({}, distractors_few, {
    positions: tr_reset,
  });
  const ttl_tbl_nov = Object.assign({}, targets_few, { positions: bl_reset });
  const ttl_dbl_nov = Object.assign({}, distractors_few, {
    positions: bl_reset,
  });
  const ttl_tbr_nov = Object.assign({}, targets_few, { positions: br_reset });
  const ttl_dbr_nov = Object.assign({}, distractors_few, {
    positions: br_reset,
  });

  const ttr_ttl_nov = Object.assign({}, targets_few, { positions: tl_reset });
  const ttr_dtl_nov = Object.assign({}, distractors_few, {
    positions: tl_reset,
  });
  const ttr_ttr_nov = Object.assign({}, targets_many, { positions: tr_reset });
  const ttr_dtr_nov = Object.assign({}, distractors_many, {
    positions: tr_reset,
  });
  const ttr_tbl_nov = Object.assign({}, targets_few, { positions: bl_reset });
  const ttr_dbl_nov = Object.assign({}, distractors_few, {
    positions: bl_reset,
  });
  const ttr_tbr_nov = Object.assign({}, targets_few, { positions: br_reset });
  const ttr_dbr_nov = Object.assign({}, distractors_few, {
    positions: br_reset,
  });

  const tbl_ttl_nov = Object.assign({}, targets_few, { positions: tl_reset });
  const tbl_dtl_nov = Object.assign({}, distractors_few, {
    positions: tl_reset,
  });
  const tbl_ttr_nov = Object.assign({}, targets_few, { positions: tr_reset });
  const tbl_dtr_nov = Object.assign({}, distractors_few, {
    positions: tr_reset,
  });
  const tbl_tbl_nov = Object.assign({}, targets_many, { positions: bl_reset });
  const tbl_dbl_nov = Object.assign({}, distractors_many, {
    positions: bl_reset,
  });
  const tbl_tbr_nov = Object.assign({}, targets_few, { positions: br_reset });
  const tbl_dbr_nov = Object.assign({}, distractors_few, {
    positions: br_reset,
  });

  const tbr_ttl_nov = Object.assign({}, targets_few, { positions: tl_reset });
  const tbr_dtl_nov = Object.assign({}, distractors_few, {
    positions: tl_reset,
  });
  const tbr_ttr_nov = Object.assign({}, targets_few, { positions: tr_reset });
  const tbr_dtr_nov = Object.assign({}, distractors_few, {
    positions: tr_reset,
  });
  const tbr_tbl_nov = Object.assign({}, targets_few, { positions: bl_reset });
  const tbr_dbl_nov = Object.assign({}, distractors_few, {
    positions: bl_reset,
  });
  const tbr_tbr_nov = Object.assign({}, targets_many, { positions: br_reset });
  const tbr_dbr_nov = Object.assign({}, distractors_many, {
    positions: br_reset,
  });

  // Practice trials
  const practice_ttl_nov = Object.assign({}, targets_practice, {
    positions: tl_reset,
  });
  const practice_dtl_nov = Object.assign({}, distractors_practice, {
    positions: tl_reset,
  });
  const practice_ttr_nov = Object.assign({}, targets_practice, {
    positions: tr_reset,
  });
  const practice_dtr_nov = Object.assign({}, distractors_practice, {
    positions: tr_reset,
  });
  const practice_tbl_nov = Object.assign({}, targets_practice, {
    positions: bl_reset,
  });
  const practice_dbl_nov = Object.assign({}, distractors_practice, {
    positions: bl_reset,
  });
  const practice_tbr_nov = Object.assign({}, targets_practice, {
    positions: br_reset,
  });
  const practice_dbr_nov = Object.assign({}, distractors_practice, {
    positions: br_reset,
  });

  // Let's get some clouds as decorations
  const clouds = {
    type: "clouds",
    amount: 3,
    images: ["cloudsmall1.png", "cloudsmall2.png", "cloudsmall3.png"],
    positions: cloud_positions,
    collectible: false,
    points: 0,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920/2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({
      from: { x: -1920 / 2 },
      velocity: { x: 30 },
      loop: Infinity,
    }),
  };

  // Now we define a patch as a list of element lists that the patch contains

  const el_rep_ttl = [
    ttl_ttl_rep,
    ttl_dtl_rep,
    ttl_ttr_rep,
    ttl_dtr_rep,
    ttl_tbl_rep,
    ttl_dbl_rep,
    ttl_tbr_rep,
    ttl_dbr_rep,
    clouds,
  ];
  const el_rep_ttr = [
    ttr_ttl_rep,
    ttr_dtl_rep,
    ttr_ttr_rep,
    ttr_dtr_rep,
    ttr_tbl_rep,
    ttr_dbl_rep,
    ttr_tbr_rep,
    ttr_dbr_rep,
    clouds,
  ];
  const el_rep_tbl = [
    tbl_ttl_rep,
    tbl_dtl_rep,
    tbl_ttr_rep,
    tbl_dtr_rep,
    tbl_tbl_rep,
    tbl_dbl_rep,
    tbl_tbr_rep,
    tbl_dbr_rep,
    clouds,
  ];
  const el_rep_tbr = [
    tbr_ttl_rep,
    tbr_dtl_rep,
    tbr_ttr_rep,
    tbr_dtr_rep,
    tbr_tbl_rep,
    tbr_dbl_rep,
    tbr_tbr_rep,
    tbr_dbr_rep,
    clouds,
  ];
  const fields_rep = [el_rep_ttl, el_rep_ttr, el_rep_tbl, el_rep_tbr];

  const el_nov_ttl = [
    ttl_ttl_nov,
    ttl_dtl_nov,
    ttl_ttr_nov,
    ttl_dtr_nov,
    ttl_tbl_nov,
    ttl_dbl_nov,
    ttl_tbr_nov,
    ttl_dbr_nov,
    clouds,
  ];
  const el_nov_ttr = [
    ttr_ttl_nov,
    ttr_dtl_nov,
    ttr_ttr_nov,
    ttr_dtr_nov,
    ttr_tbl_nov,
    ttr_dbl_nov,
    ttr_tbr_nov,
    ttr_dbr_nov,
    clouds,
  ];
  const el_nov_tbl = [
    tbl_ttl_nov,
    tbl_dtl_nov,
    tbl_ttr_nov,
    tbl_dtr_nov,
    tbl_tbl_nov,
    tbl_dbl_nov,
    tbl_tbr_nov,
    tbl_dbr_nov,
    clouds,
  ];
  const el_nov_tbr = [
    tbr_ttl_nov,
    tbr_dtl_nov,
    tbr_ttr_nov,
    tbr_dtr_nov,
    tbr_tbl_nov,
    tbr_dbl_nov,
    tbr_tbr_nov,
    tbr_dbr_nov,
    clouds,
  ];
  const fields_nov = [el_nov_ttl, el_nov_ttr, el_nov_tbl, el_nov_tbr];

  let indices = [0, 1, 2, 3];
  indices = jsPsych.randomization.shuffle(indices);

  const this_participants_reps = [
    fields_rep[indices[0]],
    fields_rep[indices[1]],
  ];
  const this_participants_novs = [
    fields_nov[indices[2]],
    fields_nov[indices[3]],
  ];

  const practice_trial = [
    practice_ttl_nov,
    practice_dtl_nov,
    practice_ttr_nov,
    practice_dtr_nov,
    practice_tbl_nov,
    practice_dbl_nov,
    practice_tbr_nov,
    practice_dbr_nov,
    clouds,
  ];

  let new_block = null;
  let last_block = null;
  let list_of_blocks = [];
  for (var b = 0; b < 120; b++) { 
    let block = [
      { elements: this_participants_reps[0], condition: "repeated" },
      { elements: this_participants_reps[1], condition: "repeated" },
      { elements: this_participants_novs[0], condition: "novel" },
      { elements: this_participants_novs[1], condition: "novel" },
    ];

    new_block = block;
    new_block = jsPsych.randomization.shuffle(new_block);

    while (last_block != null && isequal(new_block[0], last_block[3])) {
      new_block = jsPsych.randomization.shuffle(new_block);
    }

    list_of_blocks.push(new_block);
    last_block = new_block;
  }

  let point_counter = 0;
  let last_point_counter = 0;
  let last_time = 0;
  let last_eps = null;
  let last_last_eps = null;
  let start_time = null;

  function update_point_counter(val) {
    point_counter += val;
  }

  function readout_point_counter() {
    return point_counter;
  }

  let scaler;
  let patch = {
    type: "foraging-patch",
    max_points : max_eggs,
    images_path: "media/images/ee-foraging/", // path to image folder
    patch_size: [1920, 1080], // in vitual pixels
    elements: jsPsych.timelineVariable("elements"),
    condition: jsPsych.timelineVariable("condition"),
    backgrounds: ["background1.png", "background2.png"],
    next_when_empty: ["target"],
    points_display_html:
      "<div id='points-display-html' class='points-display'><font size=+4 face='Comic Sans MS' color='#AA00AA'>Ostereier: %% </font></div>",
    point_indicator:
      "<div id='point-indicator-html' class='point-indicator'><font size=+4 face='Comic Sans MS' color='#AA00AA'>%%</font></div>",
    point_animation: physics({
      from: { opacity: 1 },
      to: { opacity: 0 },
      velocity: { y: -120, opacity: -2.3 },
    }),
    next_patch_click_html:
      "<div id='next-patch-click-html' class='next-click'><font size=+4 face='Comic Sans MS' color='#AA00AA' style='position : absolute; left : -40px'> Weiter </font></div>",
    travel_time: 1000,
    //points : point_counter,
    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    patch_leaving_animation: tween({
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 1000,
    }),
    on_load: () => {
      scaler = new Scaler(
        document.getElementById("jspsych-foraging-container"),
        1920,
        1080,
        0
      );
    },
    on_finish: function () {
        if (readout_point_counter() >= max_eggs) {
          jsPsych.endCurrentTimeline()

        }
      },
    
  };


  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<image src=" +img+ " style=width:40%><br></br>" +
      "<font size='+2'>" +
      "<p>Aufgabe: So schnell wie möglich 1000 Ostereier suchen!<p/>" +
      "<p>Fahre mit der Maus über die Grasbüschel um diese aufzudecken (die Abbildung oben ist nur ein einfaches Bild der Szene; es folgen gleich aber zwei interaktive Übungswiesen!). Kommen Ostereier zum Vorschein, dann kannst Du sie durch Mausklick einsammeln.</p>" +
      "<p>Versuche so schnell wie möglich zu sein!</p>" +
      "<p>Mit Klick auf 'Weiter' (oben rechts) kommst Du zur nächsten 'Wiese'.</p>" +
      "<p>Du musst die Wiesen nicht leer sammeln! Wenn das Suchen zu mühsam wird, dann kannst Du zur nächsten Wiese weiter ziehen. Auf jeder Wiese sind etwa gleich viele Eier versteckt.</p><br>" +
      "<p>Drücke eine beliebige Taste, um auf zwei Beispiel-Wiesen die Aufgabe zu üben! (Es reicht, wenn Du zur Übung auf jeder Wiese ca. 5 Ostereier sammelst)</p>" +
      "</font>",
  });

  timeline.push({
    //  blocks
    timeline: [patch],
    timeline_variables: [
      { elements: practice_trial, condition: "practice" },
      { elements: practice_trial, condition: "practice" },
    ],
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<font size='+2'>" +
      "<p>Die Übungsphase ist beendet! Ab jetzt soll so schnell wie möglich gesammelt werden!<p/>" +
      "<p>Wenn der Punktezähler 1000 überschreitet, kannst Du direkt auf 'Weiter' klicken und das Sammeln ist beendet!<p/>" +
      "<p>Wenn Du schneller sammelst, ist das Experiment nicht nur schneller zu Ende (und somit die Belohnung pro Zeit höher), sondern Du kannst auch einen Bonus ergattern: Die schnellsten 30 % der Teilnehmer erhalten 2 Pfund (ca. 2,20 €) zusätzlich zum Grundbetrag! Der Bonus wird nach Abschluss der Erhebung über Prolific gutgeschrieben<p/>" +

      "<p>Sobald Du bereit bist, drücke eine Taste um den Versuch zu starten!<p/><br />" +
      "<p><font color='#009900'>Und denke daran: Die Wiesen müssen nicht leer gesammelt werden! Es gibt unendlich viele neue, volle Wiesen!</font><p/><br />" +
      "<p>Weiter mit Tastendruck!</p>" +
      "</font>",
  });

  timeline.push({
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

  for (var b = 0; b < list_of_blocks.length; b++) {
    timeline.push({
      //  blocks
      timeline: [patch],
      timeline_variables: list_of_blocks[b],
      conditional_function: function(){return readout_point_counter() < max_eggs},
    });

    timeline.push({
      conditional_function: function(){return readout_point_counter() < max_eggs},
      timeline: [{
      type: "html-keyboard-response",
      stimulus: function () {
        var current_points = readout_point_counter();
        var current_time = performance.now();
        var collected_since_last_break = current_points - last_point_counter;
        var duration = current_time - last_time;
        var current_eps = Math.ceil(
          (collected_since_last_break / (duration / 1000)) * 60
        );
        last_point_counter = current_points;
        last_time = current_time;
        var stim =
          "Du hast insgesamt " +
          current_points +
          " von " +
          max_eggs +
          " Ostereiern gesammelt! <br />" +
          "Deine Sammelgeschwindigkeit ist " +
          current_eps +
          " Ostereier pro Minute!<br /> <br />";
        if (last_eps != null) {
          stim +=
            "Im letzten Durchgang war sie " +
            last_eps +
            " Ostereier pro Minute!<br /> <br />";
        }
        if (last_last_eps != null) {
          stim +=
            "Im vorletzten Durchgang war sie " +
            last_last_eps +
            " Ostereier pro Minute!<br /> <br />";
        }
        stim +=
          "Schaffst Du es noch schneller zu werden? <br /><br />Weiter mit Taste ...";
        last_last_eps = last_eps;
        last_eps = current_eps;
        return stim;
      },
    }]});
  }

  timeline.push({
    type: "html-keyboard-response",
    duration  : function () {Math.floor((performance.now() - start_time) / 1000 / 60)},
    stimulus: function () {
      return  "Super! Sie haben " +
    readout_point_counter() +
    " Ostereier in " +
    Math.floor((performance.now() - start_time) / 1000 / 60) +
    " Minuten gefunden! <br ><br >" +
    " Der Hauptversuch ist zu Ende!" +
    " Jetzt folgen noch vier kurze Fragen." +
    " Selbst wenn Sie diese nicht beantworten möchten, schicken Sie bitte leere bzw. zufällige Antworten ab. " +
    " Nur dann wird das Ergebnis des ganzen Versuchs korrekt gespeichert.    <br ><br >" +
    " Weiter zu den Fragen mit beliebiger Taste" 
    }
  });

  
  timeline.push({
     type: 'survey-text',
    questions: [
       {prompt: "Ist Ihnen während des Versuchs etwas aufgefallen? Wenn ja bitte kurz beschreiben:", rows: 5, columns: 40},
     ],
     response_ends_trial: true
   });

  let yesno = ["Ja", "Nein"];
  
  timeline.push({
    type: "survey-multi-choice",
    questions: [
      { prompt: "Haben Sie bemerkt, dass es auf den Wiesen imemr eine 'Ecke' gibt, die besonders viele Ostereier beinhaltet?", name: "eggcluster", options: yesno, required: true },
      
    ],
    response_ends_trial: true
  });

  timeline.push({
    type: "survey-multi-choice",
    questions: [
      { prompt: "Haben Sie bemerkt, dass manche Wiesen identisch zu bereits gezeigten Wiesen waren und sich die Ostereier an der selben Stelle befinden?", name: "repeats", options: yesno, required: true },
    ],
    response_ends_trial: true
  });

  timeline.push({
     type: 'html-slider-response',
     labels: ['Am Anfang', 'Am Ende'],
     stimulus : 'Zeitpunkt im Experiment' ,
     prompt: "<p><font size=+2>Falls Ihnen aufgefallen ist, dass manche Wiesen sich wiederholen, " 
           + "geben Sie mit diesem Slider an, wann ungefährt es Ihnen aufgefallen ist."
           + "Wenn Sie es nicht bemerkt haben, lassen Sie den Slider unverändert!</font></p>",
     response_ends_trial: true,
     min : 0,
     max : 100,
     start : 0
    });
    

    timeline.push({
      type: "html-keyboard-response",
      stimulus:
      "Vielen Dank für Ihre Teilnahme! </br></br>" 
       + "Der Versuch ist nun beendet! Warten Sie 10 Sek oder drücken Sie eine Taste. </br></br>" 
       + "Schließen Sie dieses Browserfenster/Tab erst, nachdem diese Nachricht nicht mehr sichtbar ist. Vielen Dank!",
      trial_duration: 10000,
      // on_finish: function(){
      //   if (completion_url != null) {
      //     jatos.endStudyAndRedirect(completion_url)
      //   } else {
      //     console.log('Completed in local mode!')
      //   }
      // }
    });
  
    
  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
