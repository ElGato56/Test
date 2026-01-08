/**
 * @title foraging-sweets
 * @description Expra 2021
 *
 * @version 0.7
 *
 * @imageDir images/foraging-sweets
 */
import "../styles/jspsych-foraging-patch.scss";
import "jspsych/plugins/jspsych-fullscreen";
import "./plugins/jspsych-foraging-patch";
import "jspsych/plugins/jspsych-instructions";
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
  //timeline.push({
  //  type: "fullscreen",
  //  fullscreen_mode: true,
  //});

  // This will define an object that will be used to
  // generate positions for targets and distractors
  var p1 = new JitteredGridCoordinates({
    columns: 16,rows: 1,
    hspacing: 120,vspacing: 90,
    hjitter: 40, vjitter: 40,
    hoffset: 0, voffset: -410,
    on_used_up: "nothing", on_patch_done: "reset",
  });

  var p2 = new JitteredGridCoordinates({
    columns: 16,rows: 1,
    hspacing: 120,vspacing: 90,
    hjitter: 40, vjitter: 40,
    hoffset: 0, voffset: -410+175,
    on_used_up: "nothing", on_patch_done: "reset",
  });


  var p3 = new JitteredGridCoordinates({
    columns: 16,rows: 1,
    hspacing: 120,vspacing: 90,
    hjitter: 40, vjitter: 40,
    hoffset: 0, voffset: -410+175*2,
    on_used_up: "nothing", on_patch_done: "reset",
  });

  var p4 = new JitteredGridCoordinates({
    columns: 16,rows: 1,
    hspacing: 120,vspacing: 90,
    hjitter: 40, vjitter: 40,
    hoffset: 0, voffset: -410+175*3,
    on_used_up: "nothing", on_patch_done: "reset",
  });

  var p5 = new JitteredGridCoordinates({
    columns: 16,rows: 1,
    hspacing: 120,vspacing: 90,
    hjitter: 40, vjitter: 40,
    hoffset: 0, voffset: -410+175*4,
    on_used_up: "nothing", on_patch_done: "reset",
  });

  var p6 = new JitteredGridCoordinates({
    columns: 16,rows: 1,
    hspacing: 120,vspacing: 90,
    hjitter: 40, vjitter: 40,
    hoffset: 0, voffset: -410+175*5,
    on_used_up: "nothing", on_patch_done: "reset",
  });



  // Let's first define the elements in simple feature patches

  function left_border_touched(stim, pos) {
    stim.playback.set(0);
    stim.style.marginLeft = (+1920 / 2 +120) + 'px'
  }
  function right_border_touched(stim, pos) {
    stim.playback.set(0);
    stim.style.marginLeft = (-1920 / 2 -120) + 'px'
  }

  //positions: stim_positions_row_1,

  let right_movers = {  
    animation: physics({ velocity: { x: 70, y: 0}, loop: Infinity }),
    on_right_out: right_border_touched,
  }
  let left_movers = {  
    animation: physics({ velocity: { x: -70, y: 0}, loop: Infinity }),
    on_left_out: left_border_touched,
  }
  
  
  var simple_instructions = {
    type: "instructions",
    pages: jsPsych.timelineVariable("pages"),
    show_clickable_nav: true,
    button_label_next: "Start!",
    button_label_previous: "Zurück"
  };
  
 
  
// Simple displays
  let simple_task = [{targets : ['Blaubonbon.png','Rotbonbon.png'],  distractors : ['Gruenbonbon.png', 'Gelbbonbon.png']},
                 {targets : ['Gruenbonbon.png', 'Gelbbonbon.png'],  distractors : ['Blaubonbon.png','Rotbonbon.png']},
                 {targets : ['Blaubonbon.png','Gruenbonbon.png'],  distractors : ['Rotbonbon.png', 'Gelbbonbon.png']},
                 {targets : ['Blaubonbon.png', 'Gelbbonbon.png'],  distractors : ['Gruenbonbon.png','Rotbonbon.png']}
                ]
// twocnj display
let twocnj_task = [{targets : ['Blaubonbon.png','Rotmuffin.png'],  distractors : ['Rotbonbon.png', 'Blaumuffin.png']},
                  {targets : ['Rotbonbon.png', 'Blaumuffin.png'],  distractors : ['Blaubonbon.png','Rotmuffin.png']},
                  {targets : ['Blaubonbon.png','Blaumuffingestreift.png'],  distractors : ['Blaubonbongestreift.png', 'Rotbonbon.png']},
                  {targets : ['Blaubonbongestreift.png', 'Rotbonbon.png'],  distractors : ['Blaubonbon.png','Blaumuffingestreift.png']},
                  ]

let threecnj_task = [
                  {targets : ['Blaubonbon.png','Rotmuffingestreift.png'],  distractors : ['Rotbonbon.png', 'Rotmuffin.png', 'Rotbonbongestreift.png', 'Blaumuffin.png', 'Blaubonbongestreift.png']},
                  {targets : ['Rotmuffin.png', 'Blaubonbongestreift.png'], distractors :['Rotbonbon.png', 'Blaubonbon.png', 'Rotbonbongestreift.png', 'Blaumuffin.png', 'Rotmuffingestreift.png']},
                  {targets : ['Rotbonbon.png','Blaumuffingestreift.png'], distractors : ['Rotmuffin.png', 'Blaubonbon.png', 'Rotbonbongestreift.png', 'Blaumuffin.png', 'Blaubonbongestreift.png']},
                  {targets : ['Blaumuffin.png','Rotbonbongestreift.png'], distractors : ['Rotmuffin.png', 'Blaubonbon.png', 'Blaumuffingestreift.png', 'Rotbonbon.png', 'Blaubonbongestreift.png']}
                 ]

  let simple_displays = []

  for (var i=0; i<4; i++){
    var simple_row_T = {
      type: "target",
      amount: 8,
      images: simple_task[i].targets,
      ensure_all_images : true,
      collectible: true,
      trial_ends_when_all_collected: true,
    };
    var simple_row_D = {
      type: "distractor",
      amount: 8,
      images: simple_task[i].distractors,
      ensure_all_images : true,
      collectible: false,
      //trial_ends_when_all_collected: true,
    };
    simple_displays.push(
      {
        pages: [
          "Bitte sammele jetzt diese Süßigkeiten:<br/>" +
          "<image src='media/images/foraging-sweets/"+simple_row_T.images[0]+"'>" +
          "<image src='media/images/foraging-sweets/"+simple_row_T.images[1]+"'>" 
        ],
        elements: [
          Object.assign({},simple_row_T, left_movers,  {positions : p1}),
          Object.assign({},simple_row_T, right_movers, {positions : p2}),
          Object.assign({},simple_row_T, left_movers,  {positions : p3}),
          Object.assign({},simple_row_T, right_movers, {positions : p4}),
          Object.assign({},simple_row_T, left_movers,  {positions : p5}),
          Object.assign({},simple_row_T, right_movers, {positions : p6}),
          Object.assign({},simple_row_D, left_movers,  {positions : p1}),
          Object.assign({},simple_row_D, right_movers, {positions : p2}),
          Object.assign({},simple_row_D, left_movers,  {positions : p3}),
          Object.assign({},simple_row_D, right_movers, {positions : p4}),
          Object.assign({},simple_row_D, left_movers,  {positions : p5}),
          Object.assign({},simple_row_D, right_movers, {positions : p6})
        ], condition : 'simple', tag : 'simple1', 
      }
    )
    simple_displays.push(
      {
      pages: [
        "Bitte sammele jetzt diese Süßigkeiten:<br/>" +
        "<image src='media/images/foraging-sweets/"+simple_row_T.images[0]+"'>" +
        "<image src='media/images/foraging-sweets/"+simple_row_T.images[1]+"'>" 
      ],
      elements: [
        Object.assign({},simple_row_T, right_movers,  {positions : p1}),
        Object.assign({},simple_row_T, left_movers, {positions : p2}),
        Object.assign({},simple_row_T, right_movers,  {positions : p3}),
        Object.assign({},simple_row_T, left_movers, {positions : p4}),
        Object.assign({},simple_row_T, right_movers,  {positions : p5}),
        Object.assign({},simple_row_T, left_movers, {positions : p6}),
        Object.assign({},simple_row_D, right_movers,  {positions : p1}),
        Object.assign({},simple_row_D, left_movers, {positions : p2}),
        Object.assign({},simple_row_D, right_movers,  {positions : p3}),
        Object.assign({},simple_row_D, left_movers, {positions : p4}),
        Object.assign({},simple_row_D, right_movers,  {positions : p5}),
        Object.assign({},simple_row_D, left_movers, {positions : p6})
      ], condition : 'simple', tag : 'simple2', 
    }
    )

  }
  // create twocnj disps
  let twocnj_displays = []
  for (var i=0; i<4; i++){
    var twocnj_row_T = {
      type: "target",
      amount: 8,
      images: twocnj_task[i].targets,
      ensure_all_images : true,
      collectible: true,
      trial_ends_when_all_collected: true,
    };
  
    var twocnj_row_D = {
      type: "distractor",
      amount: 8,
      images: twocnj_task[i].distractors,
      ensure_all_images : true,
      collectible: false,
    };
    twocnj_displays.push(
      {
      pages: [
        "Bitte sammele jetzt diese Süßigkeiten:<br/>" +
        "<image src='media/images/foraging-sweets/"+twocnj_row_T.images[0]+"'>" +
        "<image src='media/images/foraging-sweets/"+twocnj_row_T.images[1]+"'>" 
      ],
      elements: [
        Object.assign({},twocnj_row_T, left_movers,  {positions : p1}),
        Object.assign({},twocnj_row_T, right_movers, {positions : p2}),
        Object.assign({},twocnj_row_T, left_movers,  {positions : p3}),
        Object.assign({},twocnj_row_T, right_movers, {positions : p4}),
        Object.assign({},twocnj_row_T, left_movers,  {positions : p5}),
        Object.assign({},twocnj_row_T, right_movers, {positions : p6}),
        Object.assign({},twocnj_row_D, left_movers,  {positions : p1}),
        Object.assign({},twocnj_row_D, right_movers, {positions : p2}),
        Object.assign({},twocnj_row_D, left_movers,  {positions : p3}),
        Object.assign({},twocnj_row_D, right_movers, {positions : p4}),
        Object.assign({},twocnj_row_D, left_movers,  {positions : p5}),
        Object.assign({},twocnj_row_D, right_movers, {positions : p6})
      ], condition : 'twocnj', tag : 'twocnj1', 
    }
    )
    twocnj_displays.push(
      {
        pages: [
          "Bitte sammele jetzt diese Süßigkeiten:<br/>" +
          "<image src='media/images/foraging-sweets/"+twocnj_row_T.images[0]+"'>" +
          "<image src='media/images/foraging-sweets/"+twocnj_row_T.images[1]+"'>" 
        ],
        elements: [
          Object.assign({},twocnj_row_T, right_movers,  {positions : p1}),
          Object.assign({},twocnj_row_T, left_movers, {positions : p2}),
          Object.assign({},twocnj_row_T, right_movers,  {positions : p3}),
          Object.assign({},twocnj_row_T, left_movers, {positions : p4}),
          Object.assign({},twocnj_row_T, right_movers,  {positions : p5}),
          Object.assign({},twocnj_row_T, left_movers, {positions : p6}),
          Object.assign({},twocnj_row_D, right_movers,  {positions : p1}),
          Object.assign({},twocnj_row_D, left_movers, {positions : p2}),
          Object.assign({},twocnj_row_D, right_movers,  {positions : p3}),
          Object.assign({},twocnj_row_D, left_movers, {positions : p4}),
          Object.assign({},twocnj_row_D, right_movers,  {positions : p5}),
          Object.assign({},twocnj_row_D, left_movers, {positions : p6})
        ], condition : 'twocnj', tag : 'twocnj2', 
      }
    )

  }
  // create threecnj disps
  let threecnj_displays = []
  for (var i=0; i<4; i++){
    var threecnj_row_T = {
      type: "target",
      amount: 8,
      images: threecnj_task[i].targets,
      ensure_all_images : true,
      collectible: true,
      trial_ends_when_all_collected: true,
    };
  
    var threecnj_row_D = {
      type: "distractor",
      amount: 8,
      images: threecnj_task[i].distractors,
      ensure_all_images : true,
      collectible: false,
    };
  
    threecnj_displays.push(
      {
        pages: [
          "Bitte sammele jetzt diese Süßigkeiten:<br/>" +
          "<image src='media/images/foraging-sweets/"+threecnj_row_T.images[0]+"'>" +
          "<image src='media/images/foraging-sweets/"+threecnj_row_T.images[1]+"'>" 
        ],
        elements: [
          Object.assign({},threecnj_row_T, left_movers,  {positions : p1}),
          Object.assign({},threecnj_row_T, right_movers, {positions : p2}),
          Object.assign({},threecnj_row_T, left_movers,  {positions : p3}),
          Object.assign({},threecnj_row_T, right_movers, {positions : p4}),
          Object.assign({},threecnj_row_T, left_movers,  {positions : p5}),
          Object.assign({},threecnj_row_T, right_movers, {positions : p6}),
          Object.assign({},threecnj_row_D, left_movers,  {positions : p1}),
          Object.assign({},threecnj_row_D, right_movers, {positions : p2}),
          Object.assign({},threecnj_row_D, left_movers,  {positions : p3}),
          Object.assign({},threecnj_row_D, right_movers, {positions : p4}),
          Object.assign({},threecnj_row_D, left_movers,  {positions : p5}),
          Object.assign({},threecnj_row_D, right_movers, {positions : p6})
        ], condition : 'threecnj', tag : 'threecnj1', 
      }
    )
    threecnj_displays.push(
      {
        pages: [
          "Bitte sammele jetzt diese Süßigkeiten:<br/>" +
          "<image src='media/images/foraging-sweets/"+threecnj_row_T.images[0]+"'>" +
          "<image src='media/images/foraging-sweets/"+threecnj_row_T.images[1]+"'>" 
        ],
        elements: [
          Object.assign({},threecnj_row_T, right_movers,  {positions : p1}),
          Object.assign({},threecnj_row_T, left_movers, {positions : p2}),
          Object.assign({},threecnj_row_T, right_movers,  {positions : p3}),
          Object.assign({},threecnj_row_T, left_movers, {positions : p4}),
          Object.assign({},threecnj_row_T, right_movers,  {positions : p5}),
          Object.assign({},threecnj_row_T, left_movers, {positions : p6}),
          Object.assign({},threecnj_row_D, right_movers,  {positions : p1}),
          Object.assign({},threecnj_row_D, left_movers, {positions : p2}),
          Object.assign({},threecnj_row_D, right_movers,  {positions : p3}),
          Object.assign({},threecnj_row_D, left_movers, {positions : p4}),
          Object.assign({},threecnj_row_D, right_movers,  {positions : p5}),
          Object.assign({},threecnj_row_D, left_movers, {positions : p6})
        ], condition : 'threecnj', tag : 'threecnj2', 
      }
    )

  }



  /*
  var row_2 = Object.assign({},row_1,{
    positions: stim_positions_row_2,
    on_left_out: left_border_touched,
    on_right_out: undefined,
    animation: physics({ velocity: { x: -70, y: 0}, loop: Infinity }),
  })

  var row_3 = Object.assign({},row_1,{positions: stim_positions_row_3})
  var row_4 = Object.assign({},row_2,{positions: stim_positions_row_4})
  var row_5 = Object.assign({},row_1,{positions: stim_positions_row_5})
  var row_6 = Object.assign({},row_2,{positions: stim_positions_row_6})
 */



  let trials = jsPsych.randomization.repeat([...simple_displays, ...twocnj_displays, ...threecnj_displays], 1); // let's do only 2 patches of this type for testing

  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    backgrounds: ["background.png"],
    images_path: "media/images/foraging-sweets/", // path to image folder
    patch_size: [1920, 1080], // in vitual pixels
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
        1920,
        1080,
        0
      );
    },
  };

  //, 
  // As usual in jsPsych: push the simple trials into the timeline


  timeline.push({
    type : 'instructions',
    pages : [
      "<b>Chaos in der Süßigkeitenfabrik</b><br/><br/>" +
      "<image src='media/images/foraging-sweets/display.png'><br/>" +
      "Oh weia! In der Süßigkeitenfabrik ist Chaos ausgebrochen.<br/><br/>" +
      "Die Muffins und Bonbons liegen wild verstreut auf den Fließbändern und die Verpackung der Süßigkeiten funktioniert nicht mehr automatisch. Gut, dass Du da bist!",

      "Diese Muffins und Bonbons sind in der Süßigkeitenfabrik verstreut:<br/>" +
      "<image src='media/images/foraging-sweets/targets.png'><br/>" +
      "Diese kannst Du einsammeln, indem Du sie mit der Maus anklickst",

      "In jedem Durchgang müssen nur zwei Arten von Süßigkeiten gesammelt werden. Also, zum Beispiel, nur blaue, gestreifte Bonbons und rote Muffins ohne Streifen. Es wird immer angezeigt, welche gesammelt werden sollen!",

      "Jetzt geht es los mit dem Experiment!",
    ],
    show_clickable_nav: true,
    button_label_next: "Weiter",
    button_label_previous: "Zurück"
  })

  
  timeline.push({
    timeline: [simple_instructions, patch],
    timeline_variables: trials,
  });


  timeline.push({
    type : 'instructions',
    pages : [
      "<b>Ende</b><br/><br/>" +
      "Das Chaos ist aufgeräumt! Der Versuch ist zu Ende!<br/><br/>" +
      "Vielen Dank für Deine Teilnahme!",
    ],
    show_clickable_nav: true,
    button_label_next: "Weiter",
    button_label_previous: "Zurück"
  })


  //timeline.push({
  //  timeline: [simple_instructions, patch],
  //  timeline_variables: [display_simple_2],
  //});

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
