/**
 * @title foraging-value
 * @description hybrid foraging task with different valued and prevalent targets similiar to Wolfe, Cain, & Alaoui-Soce (2018)
 * Note that for simplicity, randomization of blocks and target identities is not included.
 * Moreover, instruction screens, feedback, etc. is ommited to keep the exampel concise.
 * For those things see other examples and the jsPsych documentation.
 * 
 * @version 0.1
 *
 * @imageDir images/foraging-value
 */
import "../styles/jspsych-foraging-patch.scss";
import "jspsych/plugins/jspsych-fullscreen";
import "./plugins/jspsych-foraging-patch";
import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween, physics } from "popmotion";
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-instructions";



import "jspsych/plugins/jspsych-survey-text";
import "jspsych/plugins/jspsych-survey-multi-choice";


/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) {

// Initialize timeline
let timeline = [];

let info = {
  style: "color:green;" ,
  type: "html-keyboard-response",
  stimulus: "Pause <br/> <br/> Weiter mit beliebiger Taste."
}

var instructions = {
  type: "instructions",
  pages: [
    "<font size='+1'>" +
    "<b>Herzlich Willkommen! Und vielen Dank für Ihr  Interesse an diesem Experiment.</b> <br/>" +
    "In diesem Experiment schlüpfen Sie in die Rolle eines Fischers. <br/>" +
    "Ihre Aufgabe besteht darin, Fische zu sammeln.<br/>",

    "<font size='+1'>" +
    "Hier sehen Sie, wie ein Fischbecken im Experiment aussieht:<br/>" +
    "<image src='media/images/foraging-value/foraging_screen2.jpg'/><br/><br/>" +
    "Die Objekte werden sich zusätzlich bewegen.<br/><br/>" ,

    "<font size='+1'>" +
    "Sammeln geht durch Klicken mit der Maus auf den gewünschten Fisch.<br/>" +
    "<image src='media/images/foraging-value/Shark_.png" ,

   
    "<font size='+1'>" +
    "Jeder Fisch hat einen eigenen Wert. Dieser erscheint beim Einsammeln.<br/><br/>" +
    "Ihren Gesamtpunktestand können Sie oben links auf dem Bildschirm sehen.<br/><br/>" +
    "<image src='media/images/foraging-value/pointcounter.png" ,
    "Ihr Ziel ist es, möglichst schnell <b>24.000 Punkte</b> zu erreichen.<br/><br/>" ,

    "<font size='+1'>" +
    "Aber Achtung: Nur manche Fische geben Pluspunkte!<br/><br/>" +
    "Andere Fische geben Minuspunkte.<br/><br/>" +
    "<image src='media/images/foraging-value/Shark_.png" +
    "<image src='media/images/foraging-value/Shark_collected.png" ,




    "<font size='+1'>" +
    "Wenn Sie auf <b>weiter</b> klicken, gelangen Sie zu einem neuen, vollen Becken.<br/>" +
    "Nachdem Sie auf <b>weiter</b> geklickt haben, dauert es ein paar Sekunden, bis Sie im neuen becken ankommen.<br/>" +
    "<image src='media/images/foraging-value/weiter.png" ,

  
    "<font size='+1'>" +
    "Klicken Sie auf 'Weiter', um den Versuch zu beginnen. <br/><br/>" +
    "Mit dem nächsten Bildschirm geht es los!"
  ],
  show_clickable_nav: true,
  button_label_previous: "Zurück",
  button_label_next: "Weiter",
};

 // Switch to fullscreen
 timeline.push({
   type: "fullscreen",
   message: "Der Versuch geht jetzt in den Vollbildmodus! <br />",
   button_label: 'Weiter', 
   fullscreen_mode: true,
 });
 timeline.push(instructions);
 
  // Have a Pointcounter
  let point_counter = 0;
  function readout_point_counter() {
    return point_counter;
  }
  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_point_counter() {
    return point_counter;
  }
  let max_points = 200
  let block_count = 200

  // This will define an object that will be used to
  // generate positions for targets and distractors
  var stim_positions = new JitteredGridCoordinates({
    columns: 18,
    rows: 12,
    hspacing: 125,
    vspacing: 80,
    hjitter: 40,
    vjitter: 40,
    hoffset: 0,
    voffset: 0,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });



  let lists_good = false
  let numberlist
  let attempts = 0
  let imagelist_A = []
  let imagelist_B = []
  let imagelist_C = []
  while (lists_good == false) {
    // Get 24 random numbers
    numberlist = jsPsych.randomization.shuffle([...Array(24).keys()]);

    // Split in three lists:
    imagelist_A = numberlist.splice(0, 8)
    imagelist_B = numberlist.splice(0, 8)
    imagelist_C = numberlist.splice(0, 8)

    lists_good = true // Set to true; but change back to false below if we find a violation
    for (var i=0; i<8; i++){
      if (imagelist_A.includes(imagelist_A[i]+12) || //or
          imagelist_B.includes(imagelist_B[i]+12) || //or
          imagelist_C.includes(imagelist_C[i]+12)){
            lists_good = false
            break; // Break out of the loop!
          }
    }
    attempts++;
  }
  console.log('Found a solution after ' + attempts + ' attempt!')
  console.log('Lists are:')
  console.log('imagelist_A', imagelist_A)
  console.log('imagelist_B', imagelist_B)
  console.log('imagelist_C', imagelist_C)


  // TODO @ Eva: replace popping from image list by popping from the respective lits

    let imagelist = jsPsych.randomization.shuffle([...Array(24).keys()]);
  console.log(imagelist)
  // Let's first define the elements in even value unequal prevalence patches
  // and add uneven_equal elements and uneven_unequal elements
  let imagenumber = imagelist_A.pop()
  var target_1_A_left = {
    type: "target",
    amount: 14,
    images: [imagenumber+"_left.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var target_1_A_right = {
    type: "target",
    amount: 14,
    images: [imagenumber+"_right.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  // uneven_equal elements
  imagenumber = imagelist_B.pop()
  let target_1_B_left = Object.assign({},target_1_A_left,{images: [imagenumber+"_left.gif"], points: 16, amount: 7})
  let target_1_B_right = Object.assign({},target_1_A_right,{images: [imagenumber+"_right.gif"], points: 16, amount: 7})
  // uneven_unequal elements
  imagenumber = imagelist_C.pop()
  let target_1_C_left = Object.assign({},target_1_A_left,{images: [imagenumber+"_left.gif"],points: 16, amount: 2})
  let target_1_C_right = Object.assign({},target_1_A_right,{images: [imagenumber+"_right.gif"],points: 16, amount: 2})
  


  imagenumber = imagelist_A.pop()
  var target_2_A_left = {
    type: "target",
    amount: 8,
    images: [imagenumber+"_left.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
  
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}};
  
  var target_2_A_right = {
    type: "target",
    amount: 8,
    images: [imagenumber+"_right.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let target_2_B_left = Object.assign({},target_2_A_left,{images: [imagenumber+"_left.gif"], points: 8, amount: 7})
  let target_2_B_right = Object.assign({},target_2_A_right,{images: [imagenumber+"_right.gif"],points: 8, amount: 7})
  
  imagenumber = imagelist_C.pop()
  let target_2_C_left = Object.assign({},target_2_A_left,{images: [imagenumber+"_left.gif"], points: 8, amount: 4})
  let target_2_C_right = Object.assign({},target_2_A_right,{images: [imagenumber+"_right.gif"], points: 8, amount: 4})
  


  

  imagenumber = imagelist_A.pop()
  var target_3_A_left = {
    type: "target",
    amount: 4,
    images: [imagenumber+"_left.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var target_3_A_right = {
    type: "target",
    amount: 4,
    images: [imagenumber+"_right.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let target_3_B_left = Object.assign({},target_3_A_left,{images: [imagenumber+"_left.gif"], points: 4, amount: 7})
  let target_3_B_right = Object.assign({},target_3_A_right,{images: [imagenumber+"_right.gif"], points: 4, amount: 7})
  
  imagenumber = imagelist_C.pop()
  let target_3_C_left = Object.assign({},target_3_A_left,{images: [imagenumber+"_left.gif"], points: 4, amount: 8})
  let target_3_C_right = Object.assign({},target_3_A_right,{images: [imagenumber+"_right.gif"], points: 4, amount: 8})
  

  imagenumber = imagelist_A.pop()
  var target_4_A_left = {
    type: "target",
    amount: 2,
    images: [imagenumber+"_left.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var target_4_A_right = {
    type: "target",
    amount: 2,
    images: [imagenumber+"_right.gif"],
    points: 4,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let target_4_B_left = Object.assign({},target_4_A_left,{images: [imagenumber+"_left.gif"], points: 2, amount: 7})
  let target_4_B_right = Object.assign({},target_4_A_right,{images: [imagenumber+"_right.gif"], points: 2, amount: 7})
  
  imagenumber = imagelist_C.pop()
  let target_4_C_left = Object.assign({},target_4_A_left,{images: [imagenumber+"_left.gif"], points: 2, amount: 14})
  let target_4_C_right = Object.assign({},target_4_A_right,{images: [imagenumber+"_right.gif"],points: 2, amount: 14})
  

  imagenumber = imagelist_A.pop()
  var distractor_1_A_left = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_left.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var distractor_1_A_right = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_right.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let distractor_1_B_left = Object.assign({},distractor_1_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_1_B_right = Object.assign({},distractor_1_A_right,{images: [imagenumber+"_right.gif"],})
  
  imagenumber = imagelist_C.pop()
  let distractor_1_C_left = Object.assign({},distractor_1_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_1_C_right = Object.assign({},distractor_1_A_right,{images: [imagenumber+"_right.gif"],})
  

  imagenumber = imagelist_A.pop()
  var distractor_2_A_left = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_left.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var distractor_2_A_right = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_right.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let distractor_2_B_left = Object.assign({},distractor_2_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_2_B_right = Object.assign({},distractor_2_A_right,{images: [imagenumber+"_right.gif"],})
  
  imagenumber = imagelist_C.pop()
  let distractor_2_C_left = Object.assign({},distractor_2_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_2_C_right = Object.assign({},distractor_2_A_right,{images: [imagenumber+"_right.gif"],})
  
  imagenumber = imagelist_A.pop()
  var distractor_3_A_left = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_left.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var distractor_3_A_right = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_right.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let distractor_3_B_left = Object.assign({},distractor_3_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_3_B_right = Object.assign({},distractor_3_A_right,{images: [imagenumber+"_right.gif"],})
  
  imagenumber = imagelist_C.pop()
  let distractor_3_C_left = Object.assign({},distractor_3_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_3_C_right = Object.assign({},distractor_3_A_right,{images: [imagenumber+"_right.gif"],})
  
  imagenumber = imagelist_A.pop()
  var distractor_4_A_left = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_left.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_left_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (1920 / 2 - Math.floor(Math.random() * -100)) + "px";
    },
    animation: physics({ from: { x: +1920 / 2 }, velocity: { x: -40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(-20+ Math.floor(Math.random() * -20))}
  };
  
  var distractor_4_A_right = {
    type: "distractor",
    amount: 20,
    images: [imagenumber+"_right.gif"],
    points: -1,
    positions: stim_positions, 
    collectible: true,
    on_right_out: (stim, pos) => {
      stim.playback.set(0);
      stim.style.marginLeft = (-1920 / 2 - Math.floor(Math.random() * 100)) + "px";
    },
    animation: physics({ from: { x: -1920 / 2 }, velocity: { x: 40 }, loop: Infinity }),
    on_initialize: function(){this.playback.setVelocity(+20+ Math.floor(Math.random() * +20))}
  };
  imagenumber = imagelist_B.pop()
  let distractor_4_B_left = Object.assign({},distractor_4_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_4_B_right = Object.assign({},distractor_4_A_right,{images: [imagenumber+"_right.gif"],})
  
  imagenumber = imagelist_C.pop()
  let distractor_4_C_left = Object.assign({},distractor_4_A_left,{images: [imagenumber+"_left.gif"],})
  let distractor_4_C_right = Object.assign({},distractor_4_A_right,{images: [imagenumber+"_right.gif"],})
  
  let display_A_even_unequal = { elements: [target_1_A_left, target_1_A_right, target_2_A_left, target_2_A_right, target_3_A_left, target_3_A_right, target_4_A_left, target_4_A_right, distractor_1_A_left, distractor_1_A_right, distractor_2_A_left, distractor_2_A_right, distractor_3_A_left, distractor_3_A_right, distractor_4_A_left, distractor_4_A_right], condition: "even_unequal", debug_msg : "A_even_unequal" };
  let block_A_even_unequal = jsPsych.randomization.repeat([display_A_even_unequal], block_count);

  let display_B_uneven_equal = { elements: [target_1_B_left, target_1_B_right, target_2_B_left, target_2_B_right, target_3_B_left, target_3_B_right, target_4_B_left, target_4_B_right, distractor_1_B_left, distractor_1_B_right, distractor_2_B_left, distractor_2_B_right, distractor_3_B_left, distractor_3_B_right, distractor_4_B_left, distractor_4_B_right], condition: "uneven_equal", debug_msg : "B_uneven_equal" };
  let block_B_uneven_equal = jsPsych.randomization.repeat([display_B_uneven_equal], block_count);
  
  let display_C_uneven_unequal = { elements: [target_1_C_left, target_1_C_right, target_2_C_left, target_2_C_right, target_3_C_left, target_3_C_right, target_4_C_left, target_4_C_right, distractor_1_C_left, distractor_1_C_right, distractor_2_C_left, distractor_2_C_right, distractor_3_C_left, distractor_3_C_right, distractor_4_C_left, distractor_4_C_right], condition: "uneven_unequal", debug_msg : "A_uneven_unequal" };
  let block_C_uneven_unequal = jsPsych.randomization.repeat([display_C_uneven_unequal], block_count);

  // hierüber Blöcke definieren


  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    background_color : 'black',
    images_path : "media/images/foraging-value/", // path to image folder
    patch_size : [1920, 1080], // in vitual pixels
    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    condition: jsPsych.timelineVariable("condition"),
    debug_msg : jsPsych.timelineVariable("debug_msg"),
    travel_time : 2000,
    backgrounds: ["background.png"],
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    points_display_html:
      "<div id='points-display-html' class='points-display'><font size=+4 face='Comic Sans MS' color='#99AAFF'>Punkte: %% </font></div>",
      point_indicator: // aufsteigende punktzahl am fisch 
      "<div id='point-indicator-html' class='point-indicator'><font size=+4 face='Comic Sans MS' color='#000000'>%%</font></div>", //schwarz, früher dunkelblau: 0000AA
    point_animation: physics({
      from: { opacity: 1, y: -60 },
      to: { opacity: 0 },
      velocity: { y: -120, opacity: -1 },
    }),

    next_patch_click_html:
      "<div id='next-patch-click-html' class='next-click'><font size=+4 face='Comic Sans MS' color='#99AAFF'> Weiter </font></div>",


    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 3000 }),


    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 1920, 1080, 0);
    },
    on_finish: function() {
      if(readout_point_counter() >= max_points) {
        max_points = max_points + 200
        jsPsych.endCurrentTimeline()
     }
    }
  }


  // As usual in jsPsych: push the blocks shuffled into the timeline
  //even is value equal is prevalence
  let blocklist = jsPsych.randomization.shuffle([block_A_even_unequal, block_B_uneven_equal, block_C_uneven_unequal])

  
  timeline.push({
    timeline: [patch],
    timeline_variables: blocklist.pop(), 
  }); 
  timeline.push(info)
   timeline.push({
    timeline: [patch],
    timeline_variables: blocklist.pop(), 
  });
  timeline.push(info)
  timeline.push({
    timeline: [patch],
    timeline_variables: blocklist.pop(), 
  });


  

  return timeline;
}




export function getPreloadImagePaths() {
  return [];
}
