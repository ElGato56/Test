/**
 * @title foraging-butterfly
 * @description The Experiment for SK's Bachelor Thesis.
 * @version 0.8
 *
 * The following lines specify which media directories will be packaged and preloaded by jsPsych.
 * Modify them to arbitrary paths within the `media` directory, or delete them.
 * @imageDir images/foraging-butterfly
 * @audioDir audio/sounds
 * @videoDir video
 */
import "../styles/jspsych-foraging-patch.scss"
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-fullscreen";
import "./plugins/jspsych-foraging-patch";
import "jspsych/plugins/jspsych-image-keyboard-response";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-image-button-response";
import "jspsych/plugins/jspsych-survey-multi-choice";
import "jspsych/plugins/jspsych-survey-text";

import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween, physics} from "popmotion";



//
// Bed. schnell:     [ 3 -> 3 -> 3 -> 3 ] ~ 20     [3 -> 3 -> 3 -> 3 ] ~ 20    [3 -> 3 -> 3 -> 3 ] ~ 20 

// Bed. langsam      [10 -> 10] ~ 20      [10 -> 10] ~ 20     [10 -> 10] ~ 20  
//

/**
 * This is where you define your jsPsych timeline.
 *
 * @param input A custom object that can be specified via the JATOS web interface ("JSON study
 *              input").
 */

export function createTimeline(jatosStudyInput = null) {
  if (typeof jatos  !== 'undefined') {
    var pid = jatos.urlQueryParameters['prolific_id'];
  }

let debug = false;

//export function createTimeline(jatosStudyInput = null) {

  // Initialize jsPsych timeline
  let timeline = [];

  // This part is related to keeping track of the points. We register these functions with the plugin and
  // the plugin calls them as the participant forages. However, this is going to change to a nicer solution at some point
  let point_counter = 0;
  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_point_counter() {
    return point_counter;
  }



  // Welcome screen
  timeline.push({
    type: "html-keyboard-response",
    stimulus: "<p>Wilkommen zu dem Experiment!<p/>" + "<p>Drücke eine beliebige Taste, um zu beginnen.</p>",
  });

  // some advices
  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<font size='+1'>" +
      "<p class='left'>Ein paar Hinweise bevor es los geht:<p/>" +
      "<ul>" +
      "<li style=text-align:left;>In diesem Versuch wirst Du Schmetterlinge sammeln.</li>" +
      "<li style=text-align:left;>Bitte benutze einen PC oder Laptop auf einem Tisch mit Maus für diesen Versuch (keine Handys, Tablets, o.ä.).</li>" +
      "<li style=text-align:left;>Positioniere Dich bequem vor Deinem Computer, so wie Du ihn normalerweise benutzt.</li>" +
      "<li style=text-align:left;>Vermeide Störquellen auf dem PC: Andere Programme und Browser-Tabs schließen.</li>" +
      "<li style=text-align:left;>Vermeide Störquellen im Zimmer: Schalte Fernseher, Radio u.ä. ab und lasse Dich nicht durch andere Personen ablenken.</li>" +
      "<li style=text-align:left;>Solltest Du den Versuch abbrechen wollen, dann drücke ESC und schließe das Browserfenster. Wir löschen dann die Daten. </li><br />" +
      "</ul>" +
      "</p>" +
      "Weiter mit Tastendruck!</font>",
  });

  // instructions
  let img1 = 'media/images/foraging-butterfly/butterfly_display_example.jpg'
  let img2 = 'media/images/foraging-butterfly/butterfly_lv.png'
  let img3 = 'media/images/foraging-butterfly/butterfly_3.png'
  let img4 = 'media/images/foraging-butterfly/butterfly_7.png'
  var instructions = {
    type: 'instructions',
    pages: [
      "<p> Deine Aufgabe ist es, Schmetterlinge auf einer Wiese zu fangen. <br />" +
      "Hier siehst Du ein Beispiel für die nachfolgend zu bearbeitende Aufgabe:<br> <image src=" +img1+ " style=width:50%><br> Sammle die Schmetterlinge ein, indem Du sie auf dem Bildschirm anklickst.<br>",
      "<p> Es gibt verschiedene Arten von Schmetterlingen. Je gefangenem Schmetterling bekommst du Punkte. <br />" + 
      "Dies sind die gewöhnlichen Schmetterlinge: <br> <image src=  "+img2+" style=width:15%><br /> Sie bleiben immer gleich und wechseln nie ihr Aussehen. <br /> Für gewöhnliche Schmetterlinge erhälst du je 10 Punkte.<br>",
      "<p> Eine andere Art von Schmetterlingen, sind die besonderen Schmetterlinge. <br> Für sie erhälst du je 20 Punkte. <br /> Das Besondere an ihnen ist, dass sie zwischen den Wiesen ihre Form und Farbe wechseln können. <br>",
      "Ein Beispiel: <br /> Die besonderen Schmetterlinge sind auf der aktuellen Wiese blau. <br> <image src=  "+img3+" style=width:10%><br />" +
      "Wenn du nun die Wiese wechselst, kann es sein, dass auch die besonderen Schmetterlinge gewechselt haben und nun gelb sind. <br> <image src=  "+img4+" style=width:10%><br />",
      "Falls auf der neuen Wiese die besonderen Schmetterlinge ihre Form und Farbe geändert haben und du nun die besonderen Schmetterlinge suchst, <br> kann es passieren, dass du einen Schmetterling fängst, der nicht der besondere ist. Es fliegen nämlich auch noch andere Schmetterlinge umher. <br>  Für diesen bekommst du dann 40 Minuspunkte.",
      "<p> Es leben noch andere Tiere auf der Wiese, die sich nicht fangen lassen und auch keine Punkte bringen.",
      "<p> Deine Aufgabe ist es, so schnell wie möglich 4000 Punkte zu erreichen. <br />" +
      "<p> Wenn du nicht mehr auf der aktuellen Wiese bleiben möchtest, drücke auf „Weiter“, um so auf die nächste Wiese mit Schmetterlingen zu gelangen. <br />",
      "<p> Noch ein letzter Hinweis, bevor es losgeht.<br> Damit du so schnell wie möglich vorankommst, musst du nicht alle Schmetterlinge auf einer Wiese fangen. <br>" +
      "Wenn es zu mühsam wird, kannst du jederzeit auf eine neue Wiese wechseln. <br> Auf der neuen Wiese steht immer wieder eine große Anzahl von Schmetterlingen zur Verfügung.",
     
     ],
    show_clickable_nav: true,
    button_label_previous: "zurück",
    button_label_next: "weiter"

  }
  timeline.push(instructions) 


  // Switch to fullscreen
  timeline.push({
    type: "fullscreen",
    message: "Der Versuch geht jetzt in den Vollbildmodus! <br />",
    button_label: 'Weiter',
    fullscreen_mode: true,
  });

  //max. 3000 Points can be collected in one condition
  let max_points = 2000

  // This will define an object that will be used to
  // generate positions for targets and distractors
  var stim_positions = new JitteredGridCoordinates({
    columns: 25,
    rows: 10,
    hspacing: 75,
    vspacing: 70,
    hjitter: 10,
    vjitter: 10,
    hoffset: 0,
    voffset: 150,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });

  // Let's setup another random position generator for the clouds
  var cloud_positions = new JitteredGridCoordinates({
    columns: 6,
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

  const stimuli = {
    positions: stim_positions, // A position generator that is used to place the elements
    collectible: true, // If collectible is true, then the objects disappear on click and
    zIndex: 1, // Is related to the order on the screen. But I think the plugin is currently ignoring it
  };

  const distractors = {
    positions: stim_positions,
    collectible: false,
  };

  /// Describing the patches in this part ///
  ///Start with the targtes low value target (lvtarget) and high value target(hvtarget) /// 
  const targets_lv = Object.assign({}, {
    type: "target_lv",
    images: ["butterfly_lv.png"],
    amount: 10,
    points: 10,
    trial_ends_when_all_collected: true,
  }, stimuli)

  const distractors_butterfly = Object.assign({}, {
    type: "butterfly_distractor",
    amount: 5,
    points: -40,
  }, stimuli)

  const distractors_animals = Object.assign({}, {
    type: "animals",
    amount: 5,
    zIndex: 1
  }, distractors)

  const distractors_crawler = Object.assign({}, {
    type: "animals",
    amount: 2,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    zIndex: -100,
    positions: stim_positions,
    collectible: false
  },)

  const distractors_flowers = Object.assign({}, {
    type: "flowers",
    amount: 3,
    zIndex: -50,
  }, distractors)

  const distractors_clouds = Object.assign({}, {
    type: "clouds",
    amount: 3,
    images: ["cloud1.png", "cloud2.png", "cloud3.png", "cloud4.png"],
    positions: cloud_positions,
    collectible: false,

    zIndex: 0,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: -100 }, loop: Infinity }),
    
  });

  const targets_hv = Object.assign({}, {
    type: "target_hv",
    amount: 5,
    points: 20,
    trial_ends_when_all_collected: true,
  }, stimuli)


  // Let's make lists of all high value targets and distractors
  let list_targets_hv = []
  let list_distractors_butterfly = []
  let list_distractors_animals = []
  let list_distractors_crawler = []
  let list_distractors_flowers = []
  

  for (let i = 1; i <= 7; i++) {
    list_targets_hv.push(Object.assign({}, { images: ["butterfly_" + i + ".png"] }, targets_hv))
  }

  for (let i = 1; i <= 9; i++) {
    list_distractors_butterfly.push(Object.assign({}, { images: ["butterfly_" + i + ".png"] }, distractors_butterfly))
  }

  for (let i = 1; i <= 4; i++) {
    list_distractors_animals.push(Object.assign({}, { images: ["fly_" + i + ".png"] }, distractors_animals))
  }
  list_distractors_animals.push(Object.assign({}, { images: ["dragonfly.png"] }, distractors_animals))

  for (let i = 1; i <= 4; i++) {
    list_distractors_crawler.push(Object.assign({}, { images: ["crawler_" + i + ".png"] }, distractors_crawler))
  }


  for (let i = 1; i <= 4; i++) {
    list_distractors_flowers.push(Object.assign({}, { images: ["flower_" + i + ".png"] }, distractors_flowers))
  }
  for (let i = 1; i <= 5; i++) {
    list_distractors_flowers.push(Object.assign({}, { images: ["foliage_" + i + ".png"] }, distractors_flowers))
  }
  ["foliage_brown.png", "foliage_green.png", "foliage_orange.png", "foliage_yellow.png"].forEach((flower) => {
    list_distractors_flowers.push(Object.assign({}, { images: [flower] }, distractors_flowers))
  });

 

  // Create patches
  let list_patch_types = []
  for (let i = 0; i < 7; i++) {
    const patch = [targets_lv, ...list_distractors_animals, ...list_distractors_crawler, ...list_distractors_flowers, distractors_clouds] // <- was in jedem patch ist

    // Add LV target
    patch.push(list_targets_hv[i])

    // Add a butterfly distractor of random type
    let butterfly_images_type_1 = Math.floor(Math.random() * 9)
    while (butterfly_images_type_1 == i | butterfly_images_type_1 == i-1) {
      butterfly_images_type_1 = Math.floor(Math.random() * 9)
    }
    patch.push(list_distractors_butterfly[butterfly_images_type_1])

    // Add another butterfly distractor of random type
    let butterfly_images_type_2 = Math.floor(Math.random() * 9)
    while (butterfly_images_type_2 == i | butterfly_images_type_2 == butterfly_images_type_1 | butterfly_images_type_2 == i-1) {
      butterfly_images_type_2 = Math.floor(Math.random() * 9)
    }
    patch.push(list_distractors_butterfly[butterfly_images_type_2])



    // Append to list of all patches
    list_patch_types.push(patch)
  }


  //const patch_type_1 = [targets_lv, targets_hv_1, distractors_1, ] //, distractor,clouds];
  // //Define the distractors// 
  // var distractor = {
  //   type: "butterfly_distractor", //random butterfly, but not the hv_target butterfly// 
  //   amount: 5, 
  //   images: [],
  //   type: "distractor", //all other distractors e.g. flower, grass, crawler, dragonfly or fly// 
  //   amount: 15,
  //   images: [],
  //   positions: stim_positions, 
  //   position_seek: 0,
  // collectible: true,
  // zIndex: 1,
  //     points: -40, // Negative points for clicking a distractor!
  //     animation: tween({
  //       from: { rotate: -10, x: -5 },
  //       to: { rotate: 10, x: 5 },
  //       duration: 1000,
  //       elapsed: Math.floor(Math.random() * 1000.0),
  //       //ease: easing.linear,
  //       flip: Infinity,
  //     }),
  //     trial_ends_when_one_collected : true,
  //   };

  // Diem müssten auch oben in die list_patch_types (und entsprechend auch da drüber definiert werden) -> siehe Zeile 128
  // some clouds as decorations //
  // var clouds = {
  // type: "clouds",
  // amount: 3,
  // images: ["cloud1.png", "cloud2.png", "cloud3.png", "cloud4.png"],
  // positions: cloud_positions,
  // collectible: false,
  // points: 0,
  // zIndex: 0,
  // on_right_out: (stim, pos) => {
  //  stim.playback.set(0);
  //  stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
  // }, //
  //animation :  tween({ from: {x: -1920/2, y: 0}, to: {x : 1920/2, y : 0}, duration: 5000, loop : Infinity}),
  // animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 100 }, loop: Infinity }),
  //  ,
  //};//


    //const trials = [] // This will later contains the element lists for all our trials
    //list_patch_types = jsPsych.randomization.shuffle(list_patch_types) // Make sure not everyone gets the same order
   // const number_of_mini_blocks = 7; // 7 mini blocks

    //if (Date.now() % 2) {
    //  console.log('Condition_1')
     // for (let m = 0; m < number_of_mini_blocks; m++) {
       // let number_patches_in_this_mini_block = 2 + Math.floor(Math.random() * 3) // 2 to 5 patches per mini block, Condition 1 (schnelle Bedingung)
        //for (let p = 0; p < number_patches_in_this_mini_block; p++) {
      //    trials.push({ 'elements': list_patch_types[m] })
      //  }
     // }
   // } else {
     // console.log('Condition_2')
    //  for (let m = 0; m < number_of_mini_blocks; m++) {
      //  let number_patches_in_this_mini_block = 2 + Math.floor(Math.random() * 6) // 9 to 12 patches per mini block, Condition 2 (langsame Bedingung)
      //  for (let p = 0; p < number_patches_in_this_mini_block; p++) {
     //     trials.push({ 'elements': list_patch_types[m] })
     //   }
     // }
   // }


  const trials_b1 = [] // This will later contains the element lists for all our trials_block1
  const trials_b2 = [] // This will later contains the element lists for all our trials_block2
  list_patch_types = jsPsych.randomization.shuffle(list_patch_types) // Make sure not everyone gets the same order
  const number_of_mini_blocks = 1000; // 1000 mini blocks

  let vp_rn = Date.now() % 2
 // console.log('Condition_1')
  for(let m = 0; m < number_of_mini_blocks; m++) {
  let number_patches_in_this_mini_block = 2 + Math.floor(Math.random() * 2) // 2 to 4 patches per mini block, Condition 1 (schnelle Bedingung)
    for(let p = 0; p < number_patches_in_this_mini_block; p++) {
      
      if(vp_rn == 1) { //1
  trials_b1.push({ 'elements': list_patch_types[m%list_patch_types.length], 'condition': 'fast', 'block': m, 
  'background': ['background4.svg', 'background5.svg', 'background6.svg']})
  }
  else {
  trials_b2.push({ 'elements': list_patch_types[m%list_patch_types.length], 'condition': 'fast', 'block': m,
  'background': ['background4.svg', 'background5.svg', 'background6.svg']}) //fast Bedingung hat dunkle Himmelhintergründe
  }
  }
  }

 // console.log('Condition_2')
  for(let m = 0; m < number_of_mini_blocks; m++) {
  let number_patches_in_this_mini_block = 6 + Math.floor(Math.random() * 3) // 6 to 8 patches per mini block, Condition 2 (langsame Bedingung)
    for(let p = 0; p < number_patches_in_this_mini_block; p++) {
  
      if(vp_rn == 1) {
  trials_b2.push({ 'elements': list_patch_types[m%list_patch_types.length], 'condition': 'slow', 'block': m,
  'background': ['background1.svg', 'background2.svg', 'background3.svg']},
  ) 
  }
  else
  {
  trials_b1.push({ 'elements': list_patch_types[m%list_patch_types.length], 'condition': 'slow', 'block' :m,
  'background': ['background1.svg', 'background2.svg', 'background3.svg']}) //slow Bedingung hat helle Hintergründe
   }
  }
  }  


  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    images_path: "media/images/foraging-butterfly/", // path to image folder
    audio_path: "media/audio/sounds/", // path to audio folder
    patch_size: [1920, 1080], // in vitual pixels
    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    condition: jsPsych.timelineVariable("condition"),
    block: jsPsych.timelineVariable("block"),
    //backgrounds: ["background1.svg", "background2.svg", "background3.svg"], // List of backgrounds from which
    backgrounds: jsPsych.timelineVariable("background"),
    // the experiment draws randomly
    timeout: jsPsych.timelineVariable("timeouts"), // Use timeouts from the trial list
    point_indicator:
      "<div id='point-indicator-html' class='point-indicator'><font size=+4 face='Comic Sans MS' color='#AA00AA'>%%</font></div>",
    point_animation: physics({
      from: { opacity: 1 },
      to: { opacity: 0 },
      velocity: { y: -120, opacity: -2.3 },
    }),
    points_display_html:
      "<div id='points-display-html' class='points-display'><font size=+4 face='Arial' color='#99AAFF'>Punkte: %% </font></div>",

    next_patch_click_html:
      "<div style='top:20px; left: 1755px' id='next-patch-click-html' class='next-click'><font size=+4 face='Arial' color='#99AAFF'> Weiter </font></div>",

    travel_time: 4000,

    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),

    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 1920, 1080, 0);
    },

    on_finish: function () {
      if (readout_point_counter() >= max_points) {
        max_points = max_points*2;
        jsPsych.endCurrentTimeline()
  
      }
    }
  };

  // As usual in jsPsych: push the trials into the timeline
  timeline.push({
    timeline: [patch],
    timeline_variables: trials_b1, 
    

  });

  timeline.push({
    timeline: [patch],
    timeline_variables: trials_b2, 
    

  });

  timeline.push({
    type: "html-keyboard-response",
     stimulus:
    "Vielen Dank für deine Teilnahme! </br></br>" 
     + "Der Versuch ist nun beendet. </br></br>" 
     + "Schließe dieses Browserfenster/Tab nicht, du wirst automatisch zu Prolific weitergeleitet.",
    trial_duration: 10000,
  
  });

  return timeline;
}



export function getPreloadImagePaths() {
  return [];
}