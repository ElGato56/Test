/**
 * @title foraging-piggybank
 * @description Experiment of ExPra L 2020
 * 
 * @version 1.2-prolific-really-slow
 *
 * @imageDir images/piggybank
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
import "jspsych/plugins/jspsych-image-keyboard-response";
import "jspsych/plugins/jspsych-image-button-response";

import "./plugins/jspsych-foraging-patch";


import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { getSoundCheckNode, getDoNotReloadToastNode} from "./util/JsPsychNodeLib";
import { tween } from "popmotion"
const clonedeep = require("lodash.clonedeep");

/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) {
  if (typeof jatos  !== 'undefined') {
    var pid = jatos.urlQueryParameters['prolific_id'];
  }
 
  let debug = false;

  let participants_random_number = 0 // Was formerly set in the consent I removed

  // Initialize jsPsych timeline
  let timeline = [];

  // Switch to fullscreen
  //timeline.push({
  //  type: "fullscreen",
  //  fullscreen_mode: true,
  //});

  // This will define an object that will be used to
  // generate positions for targets and distractors
  var target_positions_random = new JitteredGridCoordinates({
    columns: 8,
    rows: 8,
    hspacing: 95,
    vspacing: 95,
    hjitter: 40,
    vjitter: 40,
    hoffset: 0,
    voffset: 0,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });

  var distractor_positions_random = new JitteredGridCoordinates({
    columns: 8,
    rows: 8,
    hspacing: 110,
    vspacing: 110,
    hjitter: 40,
    vjitter: 40,
    hoffset: 0,
    voffset: 0,
    on_used_up: "nothing",
    on_patch_done: "reset",
    rejection_function : (x, y) => {return Math.abs(x) < 200 & Math.abs(y) < 200  }
  });
 

  const target_positions_repeated = []
  const distractor_positions_repeated = []
  for  (var i = 0; i < 2; i++){
    target_positions_repeated.push(Object.assign(new JitteredGridCoordinates(), clonedeep(target_positions_random), {on_patch_done: "rewind"}))
    target_positions_random.reset();
    distractor_positions_repeated.push(Object.assign(new JitteredGridCoordinates(), clonedeep(distractor_positions_random), {on_patch_done: "rewind"}))
    distractor_positions_random.reset();
  }


  let piggy_imgs = Array.from(Array(12).keys()).map(x => 'piggy' + (x+1) + '.png')
  let distractors = {
    type : "distractor",
    amount : 12,
    images : piggy_imgs,
    ensure_all_images : true,
    collectible: false,
    zIndex : -200,
  };

  let targets = {
    type : "target",
    points : 1,
    collectible: true, 
    zIndex : -100,
  };

  let targets_novel = Object.assign({}, targets, {positions : target_positions_random} )
  let distractors_novel = Object.assign({}, distractors, {positions : distractor_positions_random} )

  let targets_repeated = []
  let distractors_repeated = []

 
  let coins_small_novel = Object.assign({}, {images : ['coin_small.png'], amount : 24}, targets_novel)
  let coins_medium_novel = Object.assign({}, {images : ['coin_medium.png'], amount : 12}, targets_novel)
  let coins_large_novel = Object.assign({}, {images : ['coin_large.png'], amount : 6}, targets_novel)

  let coins_small_repeated = []
  let coins_medium_repeated = []
  let coins_large_repeated = []
  for (var i = 0; i < 2; i++) {
    targets_repeated.push(Object.assign({}, targets, {positions : target_positions_repeated[i]}))
    distractors_repeated.push(Object.assign({}, distractors, {positions : distractor_positions_repeated[i]} ))
    coins_small_repeated.push(Object.assign({}, {images : ['coin_small.png'], amount : 24}, targets_repeated[i]))
    coins_medium_repeated.push(Object.assign({}, {images : ['coin_medium.png'], amount : 12}, targets_repeated[i]))
    coins_large_repeated.push(Object.assign({}, {images : ['coin_large.png'], amount : 6}, targets_repeated[i]))
  }

  let speed_slow = {crosshair_speed_factor : 20}
  let speed_fast = {crosshair_speed_factor : 20} //0

  let speed = [speed_slow, speed_fast]



  let participants_speed = speed[participants_random_number]
  
  let trials = [];
  for (var b = 0; b < 12; b++) {
    let block = [];
    for (var t = 0; t < 2; t++) {
      let displays_novel = {
        elements: [
          coins_small_novel,
          coins_medium_novel,
          coins_large_novel,
          distractors_novel,
        ],
      };
      block.push(Object.assign({}, displays_novel, participants_speed,  {condition : 'novel' + '-' + participants_speed.crosshair_speed_factor}));
      let displays_repeated = {
        elements: [
          coins_small_repeated[t],
          coins_medium_repeated[t],
          coins_large_repeated[t],
          distractors_repeated[t],
        ],
      };
      block.push(Object.assign({}, displays_repeated, participants_speed, {condition : 'rep-' + t + '-' + participants_speed.crosshair_speed_factor}));
      
    }
    block = jsPsych.randomization.shuffle(block);
    if (trials.length > 1) {
      while (trials[trials.length - 1].elements[0].positions == block[0].elements[0].positions) {
        block = jsPsych.randomization.shuffle(block);
      }
    }
    for (var t = 0; t < 4; t++) {
      trials.push(block[t]);
    }
  
  } 

  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_point_counter() {
    return point_counter;
  }

  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    backgrounds : ['asphalt1.jpg'],//, 'asphalt2.jpg'],
    crosshair_speed_factor : jsPsych.timelineVariable("crosshair_speed_factor"),
    condition : jsPsych.timelineVariable("condition"),
    crosshair : 'crosshair.png',
    audio_path :  'media/audio/sounds/',
    sound_events : [{time : 0, sound  : 'klirr.mp3'}, {time : 9000, sound  : 'bus-arriving.mp3'}],
    images_path : "media/images/piggybank/", // path to image folder
    patch_size : [768, 768], // in 'vitual pixels'
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    timeout : 20000, // 20 sek
    travel_time : 1000, // 1sek
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    point_counter_update_function : update_point_counter,
    point_counter_read_out_function : readout_point_counter,
    reset_point_counter_on_patch_start : true,
    points_display_html:
    "<div style='top:20px; left: 15px'id='points-display-html' class='points-display'><font size=+1 face='Arial' color='black' > <b>%% von 42 Münzen</b> </font></div>",
    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 768, 768, 0);
    },
  };

  
  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<font size='+1'>" +
      "<b>Vielen Dank für Dein Interesse an unserer Studie zum Thema visuelle Suche!</b><br><br>"+
      "<p class='left'>Ein paar Hinweise bevor es los geht:<p/>" +
      "<ul>" +
      '<li style="text-align:left;">Für das Gelingen des Expriments ist es notwendig, dass Du es an einem <b>PC oder Laptop</b> durchführst.</li>' +
      '<li style="text-align:left;">Falls Du gerade Dein Smartphone oder ein Tablet nutzt, schließe den Versuch jetzt und öffne den Link erneut am PC oder Laptop.</li>' +
      '<li style="text-align:left;">Das Experiment wird ungefähr <b>25 Minuten</b> dauern.</li>' +
      '<li style="text-align:left;">Bitte schaffe Dir eine ruhige Umgebung und stelle sicher, dass Du für diesen Zeitraum ungestört sein wirst (z.B. Telefon ausschalten).</li>' +
      '<li style="text-align:left;">Solltest Du den Versuch abbrechen wollen, dann drücke ESC und schließe das Browserfenster. Wir löschen dann die Daten.</li>' +
      '<li style="text-align:left;">Bitte schalte den <b>Ton</b> Deines Computers ein, da das Experiment akustische Signale beinhaltet.</li><br />' +
      "</ul>" +
      "Weiter mit Tastendruck!</font>",
  });

  timeline.push(getSoundCheckNode())

  let img = 'media/images/piggybank/Beispiel_Sparschwein.jpg'
  var instructions = {
    type: 'instructions',
    pages: [
      "<b>Stelle Dir folgengende Situation vor:</b><br>Einem kleinen Mädchen ist ihr Sparschwein an der Bushaltestelle hingefallen und zerbrochen.<br>Hilf ihr, indem Du die Münzen, die auf den Boden gefallen sind, einsammelst.<br>Aber beeile dich, denn der Bus kommt gleich!",
      "Hier siehst Du ein Beispiel für die nachfolgend zu bearbeitenden Suchdisplays:<br> <image src=" +img+ " style=width:30%><br> Sammel die Münzen ein, indem Du sie auf dem Bildschrim anklickst.<br> Beginne Deine Suche in jedem neuen Display wieder in der Mitte des Bildschirms. <br>Arbeite so schnell wie möglich und sammel so viele Münzen wie möglich ein!" 
     ],
    show_clickable_nav: true,
    button_label_previous: "zurück",
    button_label_next: "weiter"

  }
  timeline.push(instructions)

  let bus_arriving_sound = {
    type: "call-function",
    func: function () { new Audio('media/audio/sounds/bus-arriving.mp3').play()}
  }
  let piggybank_break_sound = {
    type: "call-function",
    func: function () { new Audio('media/audio/sounds/klirr.mp3').play()}
  }

  var busanimation1 = {
    type: 'image-keyboard-response',
    stimulus: 'media/images/piggybank/img1kl.jpg',
    trial_duration: 2000,
    choices: jsPsych.NO_KEYS,
    response_ends_trial: false,
};

  var busanimation2 = {
    type: 'image-keyboard-response',
    stimulus: 'media/images/piggybank/img2kl.jpg',
    trial_duration: 2000,
    choices: jsPsych.NO_KEYS,
    response_ends_trial: false,
  };
  
  var busanimation3 = {     
    type: 'image-keyboard-response',
    stimulus: 'media/images/piggybank/img3kl.jpg',
    choices: jsPsych.NO_KEYS,
    trial_duration: 2000,
    response_ends_trial: false,
  };

 
  let fullscreen = {
    type: "fullscreen",
    message: "Der Versuch geht jetzt in den Vollbildmodus! <br />",
    button_label: 'Weiter', 
    fullscreen_mode: true,
  }

  // Putting together the animation at the start.
  timeline.push(fullscreen)
  timeline.push(busanimation1)
  timeline.push(bus_arriving_sound)
  timeline.push(busanimation2)
  timeline.push(piggybank_break_sound)
  timeline.push(busanimation3)
  
  let busanimation_endpic = 'media/images/piggybank/img3.jpg'
  timeline.push({
    type: "html-button-response",
    stimulus: '<p><br> <image src=' +busanimation_endpic+' style=width:65%><br> Kannst Du helfen, die Münzen einzusammeln? Beeile dich, bevor der Bus kommt!</p>',
    choices: ["Los!"],
  });

  let point_counter = 0;
  let last_point_counter = 0;
  let last_time = 0;
  let last_eps = null;
  let last_last_eps = null;
  let start_time = null;

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

  let total = 0;
  let  exp_break = {
    type: "html-keyboard-response",
    stimulus: function () {
      total += readout_point_counter();
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
        "Deine Sammelgeschwindigkeit ist " +
        current_eps +
        " Münzen pro Minute!<br /> <br />";
      if (last_eps != null) {
        stim +=
          "Im letzten Durchgang war sie " +
          last_eps +
          " Münzen pro Minute!<br /> <br />";
      }
      if (last_last_eps != null) {
        stim +=
          "Im vorletzten Durchgang war sie " +
          last_last_eps +
          " Münzen pro Minute!<br /> <br />";
      }
      stim +=
        "Schaffst Du es noch schneller zu werden? <br /><br />Weiter mit Taste ...";
      last_last_eps = last_eps;
      last_eps = current_eps;
      return stim;
    },
  };

  var conditional_break = {
    timeline: [exp_break],
    conditional_function: function(){
        let real_trials = 0;
        let res = jsPsych.data.get().values();
        for (var t = 0; t < res.length; t++) {
          if (res[t].type == 'foraging-patch') {
            real_trials++;
          }
        }
        if((real_trials) % 4 == 0){
            return true;
        } else {
            return false;
        }
    }
}

  
  // As usual in jsPsych: push the simple trials into the timeline
  timeline.push({
    timeline: [patch, conditional_break],
    timeline_variables: trials,
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<font size='+1'>" +
      "<b>Danke, das war's! mit dem Sammeln!</b><br><br>"+
      "Es folgen nun noch drei kurze Fragen und dann sind wir fertig.<br><br>" +
      "Weiter mit Tastendruck!</font><br><br>",
  });


  let yesno = ["Ja", "Nein"];
  timeline.push({
    type: 'survey-text',
   questions: [
      {prompt: "Ist Dir während des Versuchs etwas aufgefallen? Wenn ja bitte kurz beschreiben:", rows: 5, columns: 40},
    ],
    response_ends_trial: true
  }); 

  timeline.push({
    type: "survey-multi-choice",
    questions: [
      {
        prompt:
          "Hast Du bemerkt, dass sich manche Münz-Anordnungen wiederholt haben?",
        name: "noticedrepeat",
        options: yesno,
        required: true,
      },
    ],
    response_ends_trial: true,
  });

  timeline.push({
    type: "html-slider-response",
    labels: ["Am Anfang", "Am Ende"],
    stimulus: "Zeitpunkt im Experiment",
    prompt:
      "Falls Du in der vorherigen Frage 'ja' geantwortet hast: <br />" +
      "Gib mit diesem Slider an, wann ungefähr es Dir aufgefallen ist. <br />" +
      "Wenn Du es nicht bemerkt hast, lass den Slider unverändert!",
    response_ends_trial: true,
    min: 0,
    max: 100,
    start: 0,
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "Vielen Dank für Deine Teilnahme! </br></br>" +
      "Der Versuch ist nun beendet! Warte 10 Sek oder drücke eine Taste. <br /><br />" +
      "Schließe dieses Browserfenster/Tab nicht. Du wirst automatisch zu Prolific weitergeleitet.",
    trial_duration: 10000,
  });
  timeline.push(getDoNotReloadToastNode());
 

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
