/**
 * @title Foraging Bees Experiment
 * @description Migration of the classic foraging bees experiment to jsPsych v7
 * @version 1.0.0
 */

// 1. Import Plugins
import { initJsPsych } from 'jspsych';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import instructions from '@jspsych/plugin-instructions';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';
import fullscreen from '@jspsych/plugin-fullscreen';
import surveyText from '@jspsych/plugin-survey-text';
import surveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import htmlSliderResponse from '@jspsych/plugin-html-slider-response';
import callFunction from '@jspsych/plugin-call-function';
import audioButtonResponse from '@jspsych/plugin-audio-button-response';

// 2. Import Your Custom Plugin
// Adjust path to point to your plugin file
import ForagingPatchPlugin from './ForagingPatchPlugin'; 

// 3. Import Styles
import '../styles/main.scss'; 

// --- UTILITY MOCKS ---
class Scaler {
  constructor(el: any, w: number, h: number) { console.log("Scaling...", w, h); }
}

/**
 * THE MAIN RUN FUNCTION
 * jspsych-builder calls this to start the experiment.
 */
// We explicitly say this object can be "any" type to satisfy TypeScript
export async function run({ assetPaths, input = {} }: any) {  
  // 1. Initialize jsPsych
  const jsPsych = initJsPsych({
    on_finish: () => {
      jsPsych.data.displayData();
    }
  });

  // --- CONFIGURATION ---
  const IMAGES_PATH = "../media/images/foraging-bees/";
  const AUDIO_PATH = "../media/audio/sounds/";

  let point_counter = 0;
  let last_point_counter = 0;
  let last_time = 0;
  
  function update_point_counter(val: number) { point_counter += val; }
  function readout_point_counter() { return point_counter; }

  // --- ASSETS ---
  const BEE_IMG = "bee3.png";
  const FLOWER_IMG = "flower-bright-1.png";

  // --- STIMULI ---
  const distractors = {
    type: "distractor",
    image: FLOWER_IMG,
    amount: 30,
    collectible: false,
  };

  const targets = {
    type: "target",
    amount: 10,
    collectible: true,
    image: BEE_IMG,
    width: 50, height: 50
  };

  // Target Variations
  const targetplus = { ...targets, points: 3, click_sounds: "click.mp3", mouseover_image: BEE_IMG };
  const targetzero = { ...targets, points: 1, click_sounds: "click.mp3", mouseover_image: BEE_IMG };
  const targetminus = { ...targets, points: -1, click_sounds: "click.mp3", mouseover_image: BEE_IMG };

  const display_elements = [targetminus, targetzero, targetplus, distractors];

  // --- TIMELINE ---
  const timeline: any[] = [];

  // 1. Fullscreen
  timeline.push({
    type: fullscreen,
    fullscreen_mode: true,
    message: "<p>Der Versuch geht jetzt in den Vollbildmodus.</p>",
    button_label: "Weiter"
  });

  // 2. Instructions
  timeline.push({
    type: instructions,
    pages: [
        "<b>Willkommen!</b><br>Dies ist die refactoring Version.",
        "Sammle Bienen (Punkte). Vermeide Blumen (Distraktoren).",
        "Klicke 'Weiter' wenn die Wiese leer ist."
    ],
    show_clickable_nav: true
  });

  // 3. Reset Logic
  timeline.push({
    type: callFunction,
    func: () => { 
        point_counter = 0; 
        last_point_counter = 0;
        last_time = performance.now();
    }
  });

  // 4. Foraging Trial
  const patch_trial = {
    type: ForagingPatchPlugin,
    patch_size: [1200, 800],
    background: "lightblue",
    images_path: IMAGES_PATH,
    audio_path: AUDIO_PATH,
    
    elements: display_elements,
    
    travel_time: 1000,
    patch_leaving_animation: true,
    
    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    
    points_display_html: "<div style='position:absolute; top:20px; left:20px; font-size:24px; font-weight:bold'>Punkte: <span id='jspsych-foraging-score-value'>0</span></div>",
    next_patch_click_html: "<button style='position:absolute; top:20px; right:20px; font-size:20px'>Weiter >></button>",
    
    trial_ends_when_all_collected: false
  };

  // Add a few trials
  timeline.push(patch_trial);
  timeline.push(patch_trial);

  // 5. Debrief
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: () => `Ende! Punkte: ${readout_point_counter()}`
  });

  // --- START THE EXPERIMENT ---
  await jsPsych.run(timeline);
}