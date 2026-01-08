/**
 * @title foraging-berries 
 * @description Experiment Bachelor Thesis DK
 * 
 * @version 1.8_final_0_8.000_20_lid0ger
 *
 * @imageDir images/foraging-berries
 * @audioDir audio/sounds
 */
import "../styles/jspsych-foraging-patch.scss"
import "../styles/main.scss"
import "../styles/toasts.scss"

import "jspsych/plugins/jspsych-call-function";
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-survey-text";
import "jspsych/plugins/jspsych-survey-multi-select"
import "jspsych/plugins/jspsych-image-keyboard-response";
import "jspsych/plugins/jspsych-image-button-response";

import "./plugins/jspsych-foraging-patch";


import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { getDoNotReloadToastNode} from "./util/JsPsychNodeLib";
import { tween, physics } from "popmotion"
const clonedeep = require("lodash.clonedeep");

/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) {
  let lid  = 0;
  if (typeof jatos  !== 'undefined') {
    var pid = jatos.urlQueryParameters['prolific_id'];
    lid = jatos.urlQueryParameters['lid'];
  }
 

  let debug = false;

  let participants_random_number = (Math.random() > 0.5)? 1 : 0;
  console.info('C' + participants_random_number);

  // Initialize jsPsych timeline
  let timeline = [];

  var buttons_german = {
    button_label: 'Weiter',
    button_label_previous: "zurück",
    button_label_next: "weiter",
    choices: "Weiter!",
  }

  var buttons_chinese = {
    button_label: '继续',
    button_label_previous: "返回",
    button_label_next: "继续",
    choices: "继续!"
  }

  var buttons = {
    german: buttons_german,
    chinese: buttons_chinese
  }

  
  if (lid == 0) { 
    var current_language = "german" //for testing the experiment, see lines above
  }
  else {
    var current_language = "chinese"
  }
  

    var question_german = {
      age_sentence: ["Bitte geben Sie Ihr Alter ein"],
      sex_sentence: ["Ich bin"],
      hand_sentence: ["Ich bin"],
      sight_sentence: ["Ich benötige und trage"],

      color_blindness_sentence: ["Ich habe"],
      language_sentence: ["Meine Muttersprache ist"],
      profession_sentence: ["Ich arbeite / habe eine Ausbildung in folgendem Bereich"],
      smartphone_experience_sentence: ["Ich habe Erfahrung mit Smartphones seit"],
      region_past_sentence: ["Ich bin aufgewachsen in"],
      region_present_sentence: ["Aktuell lebe ich in"],
      area_sentence: ["Ich wohne"],

      sex: ["männlich", "weiblich", "divers"],
      hands: ["Rechtshänder*in", "Linkshänder*in"],
      sight: ["keine Sehhilfe", "eine Sehhilfe (Brille oder Kontaktlinsen)"],
      language: ["Deutsch", "Englisch", "Chinesisch", "Sonstiges"],

      profession: ["Geistes- / Sozialwissenschaften", "Naturwissenschaften", "Sonstiges (z. B. Schüler*in)"],
      smartphone_experience: ["weniger als einem Jahr", "mehr als einem Jahr"],
      area: ["auf dem Land", "in der Stadt"],
      color_blindness: ["keine Farbfehlsichtigkeit", "eine Rot-Grün-Sehschwäche", "eine andere Farbfehlsichtigkeit oder -blindheit"],
      region_past: ["Deutschland", "einem anderen europäischen Land", "Asien", "Afrika", "Amerika", "Australien und Ozeanien"],
      region_present: ["Deutschland", "einem anderen europäischen Land", "Asien", "Afrika", "Amerika", "Australien und Ozeanien"],

      fullscreen_change: ["Der Versuch geht jetzt in den Vollbildmodus! <br />"]
    }

    var question_chinese = {
      age_sentence: ["请输入您的年龄"],
      sex_sentence: ["我是"],
      hand_sentence: ["我是"],
      sight_sentence: ["我需要和戴"],

      color_blindness_sentence: ["Ich habe"],
      language_sentence: ["我的母语是"],
      profession_sentence: ["Ich arbeite / habe eine Ausbildung in folgendem Bereich:n"],
      smartphone_experience_sentence: ["Ich habe Erfahrung mit Smartphones seit"],
      region_past_sentence: ["Ich bin aufgewachsen in"],
      region_present_sentence: ["现在我住在"],
      area_sentence: ["我住在"],

      sex: ["男性", "女性", "第三性"],
      hands: ["惯用右手的人", "惯用左手的人"],
      sight: ["无视觉辅助", "视觉辅助工具（眼镜或隐形眼镜）"],

      language: ["德国", "英文", "中文", "各别"],
      profession: ["Geistes- / Sozialwissenschaften", "Naturwissenschaften", "Sonstiges (z. B. Schüler*in)"],
      smartphone_experience: ["weniger als einem Jahr", "mehr als einem Jahr"],
      area: ["auf dem Land", "in der Stadt"],
      color_blindness: ["keine Farbfehlsichtigkeit", "eine Rot-Grün-Sehschwäche", "eine andere Farbfehlsichtigkeit oder -blindheit"],
      region_past: ["中国", "德国", "einem anderen europäischen Land", "Asien", "Afrika", "Amerika", "Australien und Ozeanien"],
      region_present: ["Deutschland", "einem anderen europäischen Land", "Asien", "Afrika", "Amerika", "Australien und Ozeanien"],

      fullscreen_change: ["现在测试将进入全屏模式！ <br />"]
    }

    var question = {
      german: question_german,
      chinese: question_chinese
    }
   
    timeline.push({
      type: "survey-text",
      questions: [{ prompt: question[current_language]["age_sentence"] }],
      button_label: [buttons[current_language]["button_label"]],
    });
 
    timeline.push({
      type: "survey-multi-choice",
      button_label: [buttons[current_language]["button_label"]],
      questions: [
        { prompt: question[current_language]["sex_sentence"], name: "sex", options: question[current_language]["sex"], required: true },
        { prompt: question[current_language]["hand_sentence"], name: "hand", options: question[current_language]["hands"], required: true },
        { prompt: question[current_language]["sight_sentence"], name: "sight", options: question[current_language]["sight"], required: true },
      ],
    });


  // Switch to fullscreen
  timeline.push({
    type: "fullscreen",
    fullscreen_mode: true,
    message: question[current_language]["fullscreen_change"],
    button_label: [buttons[current_language]["button_label"]],
   });  
  

  var grass_positions = new JitteredGridCoordinates({
    columns: 2,
    rows: 2,
    hspacing: (1080 / 2) -100,
    vspacing: (1920 / 2) +450, 
    hjitter: 100,
    vjitter: 20,
    hoffset: +50,
    voffset: +530, 
    on_used_up: "nothing",
    on_patch_done: "reset",
  });

  var leaf_positions = new JitteredGridCoordinates({ 
    columns: 4, 
    rows: 5, 
    hspacing: 190, 
    vspacing: 205, 
    hjitter: 50, 
    vjitter: 30, 
    hoffset: -40, 
    voffset: 10, 
    on_used_up: "nothing",
    on_patch_done: "reset",
  });



  //////////////////////////////////////////
  //  Section 1: Position Generators      //
  //////////////////////////////////////////

  // Positions for the different conditions  
  
  // GNBN (grass novel, bush novel)) used for good and bad
  const L_pos_GNBN = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "reset"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GNBN = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "reset"})
  grass_positions.reset();  // Shuffle for next use 

  // GRBR-G  (grass repeated, bush repeated, "good" berry values)
  const L_pos_GRBR_G = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "rewind"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GRBR_G = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "rewind"})
  grass_positions.reset();  // Shuffle for next use 

  // GRBR-B (grass repeated, bush repeated, "bad" berry values)
  const L_pos_GRBR_B = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "rewind"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GRBR_B = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "rewind"})
  grass_positions.reset();  // Shuffle for next use 

  // GNBR-G  (grass novel, bush repeated, "good" berry values)
  const L_pos_GNBR_G = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "rewind"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GNBR_G = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "reset"})
  grass_positions.reset();  // Shuffle for next use 

  // GNBR-B (grass novel, bush repeated, "good" berry values)
  const L_pos_GNBR_B = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "rewind"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GNBR_B = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "reset"})
  grass_positions.reset();  // Shuffle for next use 

  // GRBN-G  (grass repeated, bush novel, "good" berry values)
  const L_pos_GRBN_G = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "reset"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GRBN_G = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "rewind"})
  grass_positions.reset();  // Shuffle for next use 

  // GRBN-B (grass repeated, bush novel, "good" berry values)
  const L_pos_GRBN_B = Object.assign(new JitteredGridCoordinates(), clonedeep(leaf_positions), {on_patch_done: "reset"})
  leaf_positions.reset(); // Shuffle for next use
  const gr_pos_GRBN_B = Object.assign(new JitteredGridCoordinates(), clonedeep(grass_positions), {on_patch_done: "rewind"})
  grass_positions.reset();  // Shuffle for next use 

  //////////////////////////////////////////
  //  Section 2: Element Definitions      //
  //////////////////////////////////////////

  // Elements:
  // We first define some stuff that is relevant for all elements in the displays

  const all_grass_images = Array.from(Array(32).keys()).map(
    (x) => "grass" + (x + 1) + ".png"
  ); // Makes a list with all 32 grass images

  // Let's shuffle the list of images, so that every participant gets different images:
  const gr_img_sub = jsPsych.randomization.repeat(all_grass_images, 1)
  
  const grass_shared_attributes = {
     type: "background", 
     amount: 4, ensure_all_images : true, 
     collectible: false,
     zIndex : -1000
   }
   
  const distractors_shared_attributes = {
    type: "distractor",
    images: ["closed11.png", "closed12.png", "closed13.png", "closed14.png"],
    mouseover_images: ["open11.png", "open12.png", "open13.png", "open14.png"],
    amount: 5,
    ensure_all_images : true,
    collectible: false,
    zIndex : -1000,
    animation: tween({ from: { rotate: -2, x: -1 }, to: { rotate: 2, x: 1 },
      duration: 1500, elapsed: Math.floor(Math.random() * 1500.0),
      flip: Infinity,
    }),
  };


 const targets_shared_attributes = {
  collectible: true,
  images: ["closed11.png", "closed12.png", "closed13.png", "closed14.png"],
  collected_images: ["closed11.png", "closed12.png", "closed13.png", "closed14.png"],
  mouseover_collected_images: ["open11.png", "open12.png", "open13.png", "open14.png"],
  collectible_only_if_uncovered: true,
  cover_on_mouseleave: true,
  animation: tween({
    from: { rotate: -2, x: -1 }, to: { rotate: 2, x: 1 },
    duration: 1500, elapsed: Math.floor(Math.random() * 1500.0),
    flip: Infinity,
  }),
};

var purple = ["berry11p.png", "berry12p.png", "berry13p.png", "berry14p.png"] 
var red = ["berry11r.png", "berry12r.png", "berry13r.png", "berry14r.png"]

let gb = [purple, red]
let bb = [red, purple]

let participants_gb = gb[participants_random_number]
let participants_bb = bb[participants_random_number]


// Definitions of points and amounts here, so that it can be easily changed
const gp = 20 // good points 
const bp = 1  // bad points
const few = 2 
const many = 6
  


  // GNBN-G (leaves novel, bush novel, "good" berry values)
  const grass_GNBN_G = {positions : gr_pos_GNBN, images : gr_img_sub.slice(0, 4), ...grass_shared_attributes}
  const distractors_GNBN_G = {positions : L_pos_GNBN, ...distractors_shared_attributes}
  const high_value_targets_GNBN_G = {positions : L_pos_GNBN, points : gp, amount : many, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GNBN_G = {positions : L_pos_GNBN, points : bp, amount : few, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GNBN_G = [grass_GNBN_G, distractors_GNBN_G, high_value_targets_GNBN_G, low_value_targets_GNBN_G]
  const elements_GNBN_G_demo = [distractors_GNBN_G, high_value_targets_GNBN_G, low_value_targets_GNBN_G]


  // GNBN-B (leaves novel, bush novel, "bad" berry values)
  const grass_GNBN_B = {positions : gr_pos_GNBN, images : gr_img_sub.slice(4, 8), ...grass_shared_attributes}
  const distractors_GNBN_B = {positions : L_pos_GNBN, ...distractors_shared_attributes}
  const high_value_targets_GNBN_B = {positions : L_pos_GNBN, points : gp, amount : few, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GNBN_B = {positions : L_pos_GNBN, points : bp, amount : many, mouseover_images: participants_bb,  ...targets_shared_attributes}
  const elements_GNBN_B = [grass_GNBN_B, distractors_GNBN_B, high_value_targets_GNBN_B, low_value_targets_GNBN_B]
  const elements_GNBN_B_demo = [distractors_GNBN_B, high_value_targets_GNBN_B, low_value_targets_GNBN_B]

  // GRBR-G (leaves repeated, bush repeated, "good" berry values)
  const grass_GRBR_G = {positions : gr_pos_GRBR_G, images : gr_img_sub.slice(8, 12), ...grass_shared_attributes}
  const distractors_GRBR_G = {positions : L_pos_GRBR_G, ...distractors_shared_attributes}
  const high_value_targets_GRBR_G = {positions : L_pos_GRBR_G, points : gp, amount : many, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GRBR_G = {positions : L_pos_GRBR_G, points : bp, amount : few, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GRBR_G = [grass_GRBR_G, distractors_GRBR_G, high_value_targets_GRBR_G, low_value_targets_GRBR_G]
  
  // GRBR-B (leaves repeated, bush repeated, "bad" berry values)
  const grass_GRBR_B = {positions : gr_pos_GRBR_B, images : gr_img_sub.slice(12, 16), ...grass_shared_attributes}
  const distractors_GRBR_B = {positions : L_pos_GRBR_B, ...distractors_shared_attributes}
  const high_value_targets_GRBR_B = {positions : L_pos_GRBR_B, points : gp, amount : few, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GRBR_B = {positions : L_pos_GRBR_B, points : bp, amount : many, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GRBR_B = [grass_GRBR_B, distractors_GRBR_B, high_value_targets_GRBR_B, low_value_targets_GRBR_B]

  // GNBR-G  (leaves novel, bush repeated, "good" berry values)
  const grass_GNBR_G = {positions : gr_pos_GNBR_G, images : gr_img_sub.slice(16, 20), ...grass_shared_attributes}
  const distractors_GNBR_G = {positions : L_pos_GNBR_G, ...distractors_shared_attributes}
  const high_value_targets_GNBR_G = {positions : L_pos_GNBR_G, points : gp, amount : many, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GNBR_G = {positions : L_pos_GNBR_G, points : bp, amount : few, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GNBR_G = [grass_GNBR_G, distractors_GNBR_G, high_value_targets_GNBR_G, low_value_targets_GNBR_G]

  // GNBR-B (leaves novel, bush repeated, "bad" berry values)
  const grass_GNBR_B = {positions : gr_pos_GNBR_B, images : gr_img_sub.slice(20, 24), ...grass_shared_attributes}
  const distractors_GNBR_B = {positions : L_pos_GNBR_B, ...distractors_shared_attributes}
  const high_value_targets_GNBR_B = {positions : L_pos_GNBR_B, points : gp, amount : few, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GNBR_B = {positions : L_pos_GNBR_B, points : bp, amount : many, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GNBR_B = [grass_GNBR_B, distractors_GNBR_B, high_value_targets_GNBR_B, low_value_targets_GNBR_B]

  // GRBN-G  (leaves repeated, bush novel, "good" berry values)
  const grass_GRBN_G = {positions : gr_pos_GRBN_G, images : gr_img_sub.slice(24, 28), ...grass_shared_attributes}
  const distractors_GRBN_G = {positions : L_pos_GRBN_G, ...distractors_shared_attributes}
  const high_value_targets_GRBN_G = {positions : L_pos_GRBN_G, points : gp, amount : many, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GRBN_G = {positions : L_pos_GRBN_G, points : bp, amount : few, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GRBN_G =  [grass_GRBN_G, distractors_GRBN_G, high_value_targets_GRBN_G, low_value_targets_GRBN_G]

  // GRBN-B (leaves repeated, bush novel, "bad" berry values)
  const grass_GRBN_B = {positions : gr_pos_GRBN_B, images : gr_img_sub.slice(28, 32), ...grass_shared_attributes}
  const distractors_GRBN_B = {positions : L_pos_GRBN_B, ...distractors_shared_attributes}
  const high_value_targets_GRBN_B = {positions : L_pos_GRBN_B, points : gp, amount : few, mouseover_images: participants_gb, ...targets_shared_attributes}
  const low_value_targets_GRBN_B = {positions : L_pos_GRBN_B, points : bp, amount : many, mouseover_images: participants_bb, ...targets_shared_attributes}
  const elements_GRBN_B =  [grass_GRBN_B, distractors_GRBN_B, high_value_targets_GRBN_B, low_value_targets_GRBN_B]


  //////////////////////////////////////////
  //  Section 3: Display Definitions      //
  //////////////////////////////////////////

  let demo_trials = [
    {elements : elements_GNBN_G_demo, condition : 'GNBN_G', debug_msg : 'Demo is GNBN_G', backgrounds: ["background0.png"]},//, reset_point_counter_on_patch_start : false},
    {elements : elements_GNBN_B_demo, condition : 'GNBN_B', debug_msg : 'Demo is GNBN_B', backgrounds: ["background0.png"]}//, reset_point_counter_on_patch_start : false},
  ]; 
  
  let trials = [];
  let list_of_blocks = [];
  for (var b = 0; b < 120; b++) { //12
    let block = [
      {elements : elements_GNBN_G, condition : 'GNBN_G', block : b, debug_msg : 'Condition is GNBN_G', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GNBN_B, condition : 'GNBN_B', block : b, debug_msg : 'Condition is GNBN_B', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GRBR_G, condition : 'GRBR_G', block : b, debug_msg : 'Condition is GRBR_G', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GRBR_B, condition : 'GRBR_B', block : b, debug_msg : 'Condition is GRBR_B', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GRBN_G, condition : 'GRBN_G', block : b, debug_msg : 'Condition is GRBN_G', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GRBN_B, condition : 'GRBN_B', block : b, debug_msg : 'Condition is GRBN_B', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GNBR_G, condition : 'GNBR_G', block : b, debug_msg : 'Condition is GNBR_G', backgrounds: ["background1.png"]},//, reset_point_counter_on_patch_start : false},
      {elements : elements_GNBR_B, condition : 'GNBR_B', block : b, debug_msg : 'Condition is GNBR_B', backgrounds: ["background1.png"]}//, reset_point_counter_on_patch_start : false}
    ];
    
    // Make sure blocks don't start with a trialtype the previous block ended:
    block = jsPsych.randomization.shuffle(block); //Randomisiert Block-Reihenfolge
    if (trials.length > 1) { //Länge des aktuellen Trial-Aray: nach erstem
      while (trials[trials.length - 1].elements[0].positions == block[0].elements[0].positions) {
        block = jsPsych.randomization.shuffle(block);
      }
    } 

    // Push the 8 trials of this block into the timeline
    for (var t = 0; t < 8; t++) {
      trials.push(block[t]);
      
    }

    //list_of_blocks.push(block);
  
  } 

  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_point_counter() {
    return point_counter;
  }

  var patch_text_german = {
    points: ["<b>Punkte: %%</b> </font></div>"], 
    next: ["<div style='top:440px; left: 950px' id='next-patch-click-html' class='next-click'><font size='+4' face='Arial' color='white' > <b><img src='media/images/foraging-berries/sign_g.png'/></b>  </font></div>"]
  }

  var patch_text_chinese = {
    points: ["<b>分数: %%</b> </font></div>"],
    next: ["<div style='top:440px; left: 950px' id='next-patch-click-html' class='next-click'><font size='+4' face='Arial' color='white' ><b><img src='media/images/foraging-berries/sign_c.png'/></b>  </font></div>"]
  }

  var patch_text = {
    german: patch_text_german,
    chinese: patch_text_chinese
  }


  let max_points = 10000; //max_points;

  // This will create the actual patches of the experiment:
  let patch = {
    max_points: max_points,
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    condition : jsPsych.timelineVariable("condition"),
    audio_path :  'media/audio/sounds/',
    images_path : "media/images/foraging-berries/", // path to image folder
    patch_size : [1080, 1920], // in 'vitual pixels' (([1080, 1920]))
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    backgrounds: jsPsych.timelineVariable("backgrounds"),// background variable Probe-Trial
    debug_msg : jsPsych.timelineVariable("debug_msg"), // Conditions
    block : jsPsych.timelineVariable("block"), // Block
    travel_time : 1000, // 1sek
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    point_counter_update_function : update_point_counter,
    point_counter_read_out_function : readout_point_counter,
    reset_point_counter_on_patch_start : false,
    points_display_html: 
      "<div style='top:20px; left: 15px'id='points-display-html' class='points-display'><font size='+4' face='Arial' color='white' >" + patch_text[current_language]["points"],
    point_indicator: 
      "<div id='point-indicator-html' class='point-indicator'><font size='+4' face='Comic Sans MS' color='yellow'>%%</font></div>",
    point_animation: physics({
      from: { opacity: 1, y: -60 },
      to: { opacity: 0 },
      velocity: { y: -120, opacity: -1 },
    }),
    next_patch_click_html: patch_text[current_language]["next"],

      // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 1080, 1920, 0);
    },
    on_finish: function () {
      if (readout_point_counter() >= max_points) {
        jsPsych.endCurrentTimeline()

      }
    },
  };

 
  var instructions_german = {
   instructions_1: "<font size='+1'>" +
   "<b>Vielen Dank für Ihr Interesse an unserer Studie zum Thema „Visuelle Suche“!</b><br><br>"+
   "<p class='left'>Ein paar Hinweise, bevor es los geht:<p/>" +
   "<ul>" +
   '<li style="text-align:left;">Für das Gelingen des Experiments ist es notwendig, dass Sie es auf einem <b>Smartphone mit intaktem Bildschirm</b> durchführen.</li>' +
   '<li style="text-align:left;">Nicht alle Smartphone-Browser sind für dieses Experiment geeignet (Firefox und Safari z. B. nicht).</li>' +
   '<li style="text-align:left;">Das Experiment wird ungefähr <b>25 Minuten</b> dauern.</li>' + //CHANGEME: wie lange? - auch bei chin ändern
   '<li style="text-align:left;">Wichtig ist, dass Sie das Experiment <b>am Stück ohne Unterbrechung</b> durchführen.</li>' +
   '<li style="text-align:left;">Damit Sie in dem Versuch klarkommen, sollten Sie keine Farbfehlsichtigkeit haben.</b> </li>' +
   '<li style="text-align:left;">Während des Versuchs darf sich Ihr Display nicht ausschalten, da sonst der Vollbildmodus beendet wird. Sie können zwischendurch kurz pausieren, während Sie Rückmeldung zu Ihrer Leistung bekommen. Achten Sie jedoch darauf, dass sich Ihr Handydisplay nicht ausschaltet.</b> </li>' +
   '<li style="text-align:left;">Bitte schaffen Sie sich eine ruhige Umgebung und stellen Sie sicher, dass Sie für diesen Zeitraum ungestört sein werden. </li>' +
   '<li style="text-align:left;">Sollten Sie den Versuch abbrechen wollen, dann drücken Sie den Zurück-Knopf Ihres Smartphones und schließen den Tab / das Browserfenster. Die Daten werden dann nicht gespeichert. Wir können dann jedoch auch keine Kompensation bezahlen, da wir nicht sehen, ob und wie lange Sie sich mit dem Versuch beschäftigt haben.</li>' +
   "</ul>", 

   instructions_2:  
   "<b> Ihre Aufgabe ist es, Beeren an einem Busch zu pflücken. <br /> " +
   "<b> Halten Sie dafür Ihr Smartphone in der nichtdominanten Hand und bedienen es mit dem Zeigefinger Ihrer dominanten Hand! <br>Als Rechtshänder halten Sie Ihr Smartphone also mit links und bedienen es mit rechts (siehe Bild). <br>Als Linkshänder halten Sie Ihr Smartphone mit rechts und bedienen es mit links. <br />" +
   "<image src='media/images/foraging-berries/smartphone.png' style=width:50%> <br /> " +
   "</ul>",
   
   instructions_3:
   "<b> Der Busch wird nicht mittig angezeigt. Bitte schieben Sie den Busch daher kurz in die Mitte Ihres Displays, sodass Sie die Beeren problemlos pflücken können. <br>Zwischendurch bekommen Sie Rückmeldung über Ihre Sammelgeschwindigkeit. <br>Anschließend müssen Sie den Busch wieder kurz in die Mitte ziehen, um weiter pflücken zu können.<br /> " +
   "<image src='media/images/foraging-berries/smartphone_scroll_g.png' style=width:75%> <br /> " +
   "</ul>", 

   instructions_4:  
   "<b> Die Beeren befinden sich hinter Blättern. Tippen Sie auf die Blätter, um zu schauen, ob sich eine Beere dahinter befindet. <br />" +
   "<b> Ungeöffnet: <br />" +
   "<image src='media/images/foraging-berries/intro_closed.png' style=width:50%> <br /> " +
   "<b> Geöffnet (keine Beere): <br />" +
   "<image src='media/images/foraging-berries/intro_open.png' style=width:50%> <br /> " +
   "</ul>", 

   instructions_5: 
   "<b> Es gibt zwei verschiedene Beerensorten, für die Sie unterschiedliche Punkte bekommen – entweder je einen Punkt oder je zwanzig Punkte. <br />" +
   "<image src='media/images/foraging-berries/intro_berry_p.png' style=width:50%> <br /> <image src='media/images/foraging-berries/intro_berry_r.png' style=width:50%> <br /> " +
   "</ul>",
   
   instructions_6:
   "<b> Ihre Aufgabe ist es, so schnell wie möglich 10000 Punkte zu erreichen. <br />" + //CHANGEME: wie viele Punkte / wie viele Durchgänge / wie lange  - auch bei chin ändern
   "<b> Wenn Sie nicht mehr in dem aktuellen Busch bleiben möchten, können Sie jederzeit rechts auf „weiter“ tippen, um so zum nächsten Busch zu gelangen. <br> Oben links ist Ihr aktueller Punktestand.<br />" +
   "Hier sehen Sie ein Beispiel für die nachfolgend zu bearbeitenden Suchdisplays:<br> " +
   "<image src='media/images/foraging-berries/intro_screenshot_g.png' style=width:75%> <br /> " +
   "Tippen Sie die Blätter an, um zu sehen, ob sich dahinter Beeren befinden. Pflücken Sie die Beeren, indem Sie sie auf dem Bildschrim antippen. <br>Arbeiten Sie so schnell wie möglich!<br> " +
   "<b> Klicken Sie auf „weiter“, um an zwei Büschen zu üben!<br />",

  }

  var instructions_chinese = {
   instructions_1: "<font size='+1'>" +
   "<b>非常感谢您对我们的研究“视觉搜索”感兴趣！</b><br><br>"+
   "<p class='left'>在我们开始之前，有以下几点提示：<p/>" +
   "<ul>" +
   '<li style="text-align:left;">为了保证实验顺利进行，您必须在屏幕完好无损的智能<b>手机</b>上完成实验。</li>' +
   '<li style="text-align:left;">并非所有智能手机浏览器都适用于此测试（例如，Firefox 和 Safari不适用于此测试）。</li>' +
   '<li style="text-align:left;">测试大约需要<b>25分钟</b> 。</li>' + 
   '<li style="text-align:left;">重要的是，请您<b>在整个过程中不中断</b>测试。</li>' +
   '<li style="text-align:left;">为了能顺利完成测试，您应当颜色知觉正常，无色盲或色弱。</b> </li>' +
   '<li style="text-align:left;">在测试期间，屏幕不得锁屏，否则将终止全屏模式。当您获得成绩反馈时，可以在此期间短暂暂停。但是，请确保手机显示屏未锁屏。</b> </li>' +
   '<li style="text-align:left;">请在一个安静的环境中完成测试，并确保在此期间，您将不受干扰。</li>' +
   '<li style="text-align:left;">如果您想中止测试，请按智能手机上的后退键，并关闭标签页/浏览器窗口。数据就不会被保存。但是，我们不会支付赔偿，因为我们无法得知您是否参与过测试以及测试进行了多久。</li>' +
   "</ul>", 

   instructions_2:  
   "<b> 您的任务是从灌木丛中采摘浆果。 <br /> " +
   "<b> 请您用非惯用手握住智能手机，用惯用手的食指进行操作! <br>作为一个右撇子，您应该用左手拿着智能手机，用右手操作（见图）。<br>如果您是左撇子，请用右手拿着智能手机，用左手操作。<br />" +
   "<image src='media/images/foraging-berries/smartphone.png' style=width:50%> <br /> " +
   "</ul>", 

   instructions_3:  
   "<b> 灌木丛不出现在屏幕的正中间。因此，请将灌木丛手动移到您的屏幕中间，以便可以轻松地采摘浆果。 <br>期间您将收到有关采摘速度的反馈。 然后，您要重新把灌木丛移到屏幕中间继续采摘。<br /> " +
   "<image src='media/images/foraging-berries/smartphone_scroll_c.png' style=width:75%> <br /> " +
   "</ul>", 
   instructions_4:  
   "<b> 浆果位于叶子后面。轻点叶子，看看后面是否有浆果。 <br />" +
   "<b> 未打开: <br />" +
   "<image src='media/images/foraging-berries/intro_closed.png' style=width:50%> <br /> " +
   "<b> 打开（无浆果）: <br />" +
   "<image src='media/images/foraging-berries/intro_open.png' style=width:50%> <br /> " +
   "</ul>", 

   instructions_5: 
   "<b> 有两种不同类型的浆果，不同的浆果分值不同---每个1分或每个20分。<br />" +
   "<image src='media/images/foraging-berries/intro_berry_p.png' style=width:50%> <br /> <image src='media/images/foraging-berries/intro_berry_r.png' style=width:50%> <br /> " +
   "</ul>",
   
   instructions_6:  
   "<b> 您的任务是尽快达到10000分。 <br />" + 
   "<b> 如果您不想再停留在当前的灌木丛，您可以随时点击右侧的“继续”来到下一个灌木丛。<br> 左上角是您当前的分数。<br />" +
   "这里您可以看到一个之后会出现的搜索界面：<br> " +
   "<image src='media/images/foraging-berries/intro_screenshot_c.png' style=width:75%> <br /> " +
   "点击叶片，看看后面是否有浆果。通过触摸屏幕上的浆果来采摘。<br>越快越好！<br> " +
   "<b>点击“继续”，进行练习！<br />",


  
  }

  var instructions = {
   german: instructions_german,
   chinese: instructions_chinese
  }


  var trial = {
    type: 'instructions',
    pages: [
          instructions[current_language]["instructions_1"],
          instructions[current_language]["instructions_2"], 
          instructions[current_language]["instructions_3"],  
          instructions[current_language]["instructions_4"],  
          instructions[current_language]["instructions_5"],
          instructions[current_language]["instructions_6"],
         
     ],
    show_clickable_nav: true,
    button_label_previous: [buttons[current_language]["button_label_previous"]], //"zurück",
    button_label_next: [buttons[current_language]["button_label_next"]], //"weiter"

  }
  timeline.push(trial)

  let point_counter = 0;
  let last_point_counter = 0;
  let last_time = 0;
  let last_eps = null;
  let last_last_eps = null;
  let start_time = null; 
 
  timeline.push({ //für Demo
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
  let exp_break = {
    type: "html-button-response",
    choices: [buttons[current_language]["choices"]],
    stimulus: function () {
      if (readout_point_counter() < max_points){
      total = readout_point_counter();
      var current_points = total
      var current_time = performance.now();
      var collected_since_last_break = current_points - last_point_counter;
      var duration = current_time - last_time;
      var current_eps = Math.ceil(
        (collected_since_last_break / (duration / 1000)) * 60
      );
      last_point_counter = current_points;
      last_time = current_time;

      var info_between_german = {
        stim_1: "Ihre Sammelgeschwindigkeit ist " + current_eps + " Punkte pro Minute!<br /> <br />",
        stim_2: "Im letzten Durchgang war sie " + last_eps + " Punkte pro Minute!<br /> <br />",
        stim_3: "Im vorletzten Durchgang war sie " + last_last_eps + " Punkte pro Minute!<br /> <br />",
        stim_4: "Schaffen Sie es, noch schneller zu werden? <br />",
        ppm: " Punkte pro Minute!<br /> <br />"
      }    
      var info_between_chinese = {
        stim_1: "您的采摘速度是 " + current_eps + " 分每分钟！<br /> <br />",
        stim_2: "在上一轮您的采摘速度是 " + last_eps + " 分每分钟！<br /> <br />",
        stim_3: "在倒数第二轮您的采摘速度是 " + last_last_eps + " 分每分钟！<br /> <br />",
        stim_4: "您能设法，做得更快吗？ <br />",
        ppm: "分每分钟!<br /> <br />"
      }  
      var info_between = {
        german: info_between_german,
        chinese: info_between_chinese
      }

      var stim = [info_between[current_language]["stim_1"]];
      if (last_eps != null) {
        stim +=
        [info_between[current_language]["stim_2"]];
      }
      if (last_last_eps != null) {
        stim +=
          [info_between[current_language]["stim_3"]];
      }
      stim +=
        [info_between[current_language]["stim_4"]];
      last_last_eps = last_eps;
      last_eps = current_eps;
      return stim;
    }
    else{

    }
  }};

  



  // As usual in jsPsych: push the simple trials into the timeline
  timeline.push({
    timeline: [patch],
    timeline_variables: demo_trials
  });

  var after_demo_german = {
    after_demo: [
    "<font size='+1'>" +
    "<b> Das waren zwei Büsche zur Übung. <br />" +
    "<b> Denken Sie daran, dass Sie die Büsche nicht ganz leer sammeln müssen, wenn sich weiteres Suchen nicht mehr lohnt. <br />" +
    "<b> Seien Sie so schnell wie möglich! <br />" +
    "<b> Mit einem Klick auf „weiter“ startet der richtige Versuch. <br />",
  ]}

  var after_demo_chinese = {
    after_demo: [
    "<font size='+1'>" +
    "<b> 刚才只是练习。<br />" +
    "<b> 请记住，您不必将灌木丛中的所有浆果采摘完，如果进一步搜索不再值得。 <br />" +
    "<b> 请您要尽可能的快。 <br />" +
    "<b> 点击“继续”后，开始正式的测试。<br />",
  ]}

  var after_demo = {
    german: after_demo_german,
    chinese: after_demo_chinese
  }

  timeline.push({
    type: "html-button-response",
    stimulus: after_demo[current_language]["after_demo"],
    choices: [buttons[current_language]["choices"]],
    show_clickable_nav: false,
  });
 
  timeline.push({ //for real experiment
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
      conditional_function: function(){return readout_point_counter() < max_points},
    });
  }

  var conditional_break = {
    timeline: [exp_break],
    //conditional_function: function(){return readout_point_counter() < max_points},
    conditional_function: function(){
        let real_trials = -2; //Should be 0, due to the two demo trials changed to -2
        let res = jsPsych.data.get().values();
        for (var t = 0; t < res.length; t++) {
          if (res[t].type == 'foraging-patch') {
            real_trials++;
          }
        }
        if((real_trials) % 8 == 0){
            return true;
        } else {
            return false;
        }
    }
}

  // As usual in jsPsych: push the simple trials into the timeline
  timeline.push({
    //conditional_function: function(){return readout_point_counter() < max_points},
    timeline: [patch, conditional_break],
    timeline_variables: trials,
  });



  var post_interview_german ={
    yesno: ["Ja", "Nein"],
    start_end: ["Am Anfang", "Am Ende"],
    moment_exp: ["Zeitpunkt im Experiment"],
    post_interview_1: ["<font size='+1'>" +
    "<b>Danke, das war's mit dem Pflücken!</b><br><br>"+
    "Es folgen nun noch ein paar kurze Fragen und dann sind wir fertig.<br><br>"],
    post_interview_2: ["Ist Ihnen während des Versuchs etwas aufgefallen? Wenn ja, bitte kurz beschreiben:"],
    post_interview_3: ["Haben Sie bemerkt, dass sich Merkmale manchmal wiederholt haben?"],
    post_interview_4: ["Falls Sie in der vorherigen Frage „ja“ geantwortet haben: <br />" +
    "Geben Sie mit diesem Slider an, wann es Ihnen ungefähr aufgefallen ist. <br />" +
    "Wenn Sie es nicht bemerkt haben, lassen Sie den Slider unverändert! <br />"],
    post_interview_5: ["Welche Aussagen sind richtig? <br />"], 
    post_interview_5_options: [
      "Die Anordnung von Beeren hat sich wiederholt.",
      "Die Anordnung von Gräsern hat sich wiederholt.",
      "Die Büsche haben sich mit Verändern der Hintergrundfarbe wiederholt.", 
      "Vier und sechs ergibt zehn.",
      "Ich habe gewissenhaft an dem Experiment teilgenommen, sodass meine Daten verwertbar sind."
    ],
    post_interview_11: ["Vielen Dank für Ihre Teilnahme! </br></br>" +
    "Drücken Sie bitte „Weiter“, um den Versuch zu beenden. <br /><br />" +
    "Schließen Sie dieses Browserfenster / diesen Tab anschließend nicht. Sie werden automatisch zu Prolific weitergeleitet."]
  }

  var post_interview_chinese = {
    yesno: ["是", "否"],
    start_end: ["在开始", "在最后"],
    moment_exp: ["实验中的时间点"],
    post_interview_1: ["<font size='+1'>" +
    "<b>感谢您，采摘到此为止!</b><br><br>"+
    "这里还有几个简短的问题，然后测试就正式结束。<br><br>"],
    post_interview_2: ["测试时您注意到什么了吗？如果有，请简要说明："],
    post_interview_3: ["您是否注意到，某些特征有时会重复出现？"],
    post_interview_4: ["如果您在上一个问题回答了“是”：<br />" +
    "滑动这个滑块来表示您注意到它的大概时间。<br />" +
    "如果您没有注意到，请保持滑块不变!<br />"],
    post_interview_5: ["哪些说法是正确的？<br />"], 
    post_interview_5_options: [
      "浆果的排列重复了。",
      "草坪的排列重复了。",
      "灌木丛和背景颜色的变化重复了。", 
      "四加六等于十。",
      "我认真地参与了实验，所以我的数据是可用的。"
    ],

    post_interview_11: ["非常感谢您的参与! </br></br>" +
    "请按 “继续”，结束测试。<br /><br />" +
    "然后请不要关闭浏览器窗口/标签。您将自动转到 Prolific。"]
  }

  var post_interview = {
    german: post_interview_german,
    chinese: post_interview_chinese
  }


  timeline.push({
    type: "html-button-response", 
    choices: [buttons[current_language]["choices"]],
    stimulus: post_interview[current_language]["post_interview_1"]
  });


  let yesno = post_interview[current_language]["yesno"];//= ["Ja", "Nein"];
  let start_end = post_interview[current_language]["start_end"];
  
  timeline.push({
    type: 'survey-text',
    button_label: [buttons[current_language]["button_label"]],
    questions: [
      {
        prompt: post_interview[current_language]["post_interview_2"], rows: 5, columns: 40,
        name: "noticed_anything"
      },
    ],
    response_ends_trial: true,
  }); 


  timeline.push({
    type: "survey-multi-choice",
    button_label: [buttons[current_language]["button_label"]],
    questions: [
      {
        prompt:
          post_interview[current_language]["post_interview_3"],
        name: "noticed_any_repetition",
        options: yesno,
        required: true,
      },
    ],
    response_ends_trial: true,
  });


  timeline.push({
    type: "html-slider-response",
    button_label: [buttons[current_language]["button_label"]],
    labels: start_end, //["Am Anfang", "Am Ende"],
    stimulus: post_interview[current_language]["moment_exp"],
    prompt:
      post_interview[current_language]["post_interview_4"]  ,
    response_ends_trial: true,
    min: 0,
    max: 100,
    start: 0,
    name: "moment_noticed_any_repetition"
  });


  timeline.push({
    type: "survey-multi-select",
    button_label: [buttons[current_language]["button_label"]],
    questions: [
      {
        prompt: post_interview[current_language]["post_interview_5"],
        name: "noticed_which_repetitions",
        options: post_interview[current_language]["post_interview_5_options"],
        required: true,
      },
    ],
    response_ends_trial: true,
  });


  timeline.push({
    type: "html-button-response",
    choices: [buttons[current_language]["choices"]],
    stimulus:
      post_interview[current_language]["post_interview_11"],
    trial_duration: 10000,
  });
  timeline.push(getDoNotReloadToastNode());
 

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
