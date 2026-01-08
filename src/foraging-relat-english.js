/**
 * @title foraging-relat-english
 * @description Experiment for IGM's bachelor thesis. 
 *  
 * 
 * @version 1.1
 *
 * @imageDir images/foraging-relat
 */
import "../styles/jspsych-foraging-patch.scss"
import "../styles/main.scss"
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-external-html";
import "jspsych/plugins/jspsych-call-function";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-survey-multi-choice";
import "jspsych/plugins/jspsych-survey-text";
import "./plugins/jspsych-foraging-patch";
import "jspsych/plugins/jspsych-survey-text";

import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween, physics} from "popmotion"


/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) { 
  if (typeof jatos  !== 'undefined') {
    var pid = jatos.urlQueryParameters['PROLIFIC_PID']; // project group: the pid would typically
                                                        // be stored as data field with the consent 
                                                        // which I have removed. I kept this part 
                                                        // for now (also in other epxeirment files)
                                                        // just for me for future reference.
  };

  
  // This part is related to keeping track of the points. We register these functions with the plugin and
  // the plugin calls them as the participant forages. However, this is going to change to a nicer solution at some point
  let point_counter = 0;
  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_point_counter() {
    return point_counter;
  }

  // Initialize jsPsych timeline
  let timeline = [];

  let max_targets = 1000; 

  // This will define an object that will be used to
  // generate positions for targets and distractors
  var stim_positions = new JitteredGridCoordinates({
    columns: 20,
    rows: 11,
    hspacing: 90,
    vspacing: 90,
    hjitter: 40,
    vjitter: 40,
    hoffset: 45,
    voffset: 45,
    on_used_up: "nothing",
    on_patch_done: "reset",
  });

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

  const targets = {
    type: 'target', 
    amount: 15, 
    positions: stim_positions, 
    collectible: true, 
    points: 1, 
    trial_ends_when_all_collected: true,
    // The line below assigns a list of animations (generated from random velocities) to the elements
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,
    //click_delay : 30,   // testen ob es unterschied macht, wenn das weg ist
    //click_animation : tween({ from: { scale: 1, opacity : 1}, to: { scale: 1.5, opacity : 0}, duration: 50 }),
  }

  const non_targets = {
    type: 'non_target', 
    amount: 60,
    positions: stim_positions,
    collectible: false,  
    points: 0,
    // The line below assigns a list of animations (generated from random velocities) to the elements
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,
    click_animation : tween({ from: { scale: 0.2 }, to: { scale: 1}, duration: 500 }),  // duration länger machen, dass es deutlicher wird
  }

  const distractors ={
    type: 'distractor', 
    amount: 15,
    positions: stim_positions,
    collectible: false, 
    points: 0,
    // The line below assigns a list of animations (generated from random velocities) to the elements
    animations: generate_random_velocities(20, 30).map((vel) =>
      physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
    ),
    on_left_out: left_border_touched,
    on_right_out: right_border_touched,
    on_top_out: top_border_touched,
    on_bottom_out: bottom_border_touched,
    click_animation : tween({ from: { scale: 0.2 }, to: { scale: 1}, duration: 500 }),
  }


  const target_disk_olive = Object.assign({}, {images: ['disk_olive30px.svg']}, targets)
  const target_disk_aqua = Object.assign({}, {images: ['disk_aqua30px.svg']}, targets)
  const target_square_olive = Object.assign({}, {images: ['square_olive26_587px.svg']}, targets)
  const target_square_aqua = Object.assign({}, {images: ['square_aqua26_587px.svg']}, targets)

  const nont_disk_olive = Object.assign({}, {images: ['disk_olive30px.svg']}, non_targets)
  const nont_disk_aqua = Object.assign({}, {images: ['disk_aqua30px.svg']}, non_targets)
  const nont_square_olive = Object.assign({}, {images: ['square_olive26_587px.svg']}, non_targets)
  const nont_square_aqua = Object.assign({}, {images: ['square_aqua26_587px.svg']}, non_targets)
  
  const distractor_square_green = Object.assign({}, {images: ['square_green26_587px.svg']}, distractors)
  const distractor_square_olive = Object.assign({}, {images: ['square_olive26_587px.svg']}, distractors)
  const distractor_square_aqua = Object.assign({}, {images: ['square_aqua26_587px.svg']}, distractors)
  const distractor_square_blue = Object.assign({}, {images: ['square_blue26_587px.svg']}, distractors)
  const distractor_disk_green = Object.assign({}, {images: ['disk_green30px.svg']}, distractors)
  const distractor_disk_olive = Object.assign({}, {images: ['disk_olive30px.svg']}, distractors)
  const distractor_disk_aqua = Object.assign({}, {images: ['disk_aqua30px.svg']}, distractors)
  const distractor_disk_blue = Object.assign({}, {images: ['disk_blue30px.svg']}, distractors)


  // create all variations of patches
  let display_rel_disk_olive = {
    elements: [target_disk_olive, nont_disk_aqua, distractor_square_green],
    condition: 'rel',
    condition_colour: 'rel_olive',
    condition_form: 'rel_disk',
    debug_msg: 'rel'
  };
  let display_sim_disk_olive = {
    elements: [target_disk_olive, nont_disk_aqua, distractor_square_olive],
    condition: 'sim',
    condition_colour: 'sim_olive',
    condition_form: 'sim_disk',
    debug_msg: 'sim'
  };
  let display_nont_disk_olive = {
    elements: [target_disk_olive, nont_disk_aqua, distractor_square_aqua],
    condition: 'nont',
    condition_colour: 'nont_olive',
    condition_form: 'nont_disk',
    debug_msg: 'nont'
  };
  let display_opp_disk_olive = {
    elements: [target_disk_olive, nont_disk_aqua, distractor_square_blue],
    condition: 'opp',
    condition_colour: 'opp_olive',
    condition_form: 'opp_disk',
    debug_msg: 'opp'
  };

  let display_rel_disk_aqua = {
    elements: [target_disk_aqua, nont_disk_olive, distractor_square_blue],
    condition: 'rel',
    condition_colour: 'rel_aqua',
    condition_form: 'rel_disk',
    debug_msg: 'rel'
  };
  let display_sim_disk_aqua = {
    elements: [target_disk_aqua, nont_disk_olive, distractor_square_aqua],
    condition: 'sim',
    condition_colour: 'sim_aqua',
    condition_form: 'sim_disk',
    debug_msg: 'sim'
  };
  let display_nont_disk_aqua = {
    elements: [target_disk_aqua, nont_disk_olive, distractor_square_olive],
    condition: 'nont',
    condition_colour: 'nont_aqua',
    condition_form: 'nont_disk',
    debug_msg: 'nont'
  };
  let display_opp_disk_aqua = {
    elements: [target_disk_aqua, nont_disk_olive, distractor_square_green],
    condition: 'opp',
    condition_colour: 'opp_aqua',
    condition_form: 'opp_disk',
    debug_msg: 'opp'
  };

  let display_rel_square_olive = {
    elements: [target_square_olive, nont_square_aqua, distractor_disk_green],
    condition: 'rel',
    condition_colour: 'rel_olive',
    condition_form: 'rel_square',
    debug_msg: 'rel'
  };
  let display_sim_square_olive = {
    elements: [target_square_olive, nont_square_aqua, distractor_disk_olive],
    condition: 'sim',
    condition_colour: 'sim_olive',
    condition_form: 'sim_square',
    debug_msg: 'sim'
  };
  let display_nont_square_olive = {
    elements: [target_square_olive, nont_square_aqua, distractor_disk_aqua],
    condition: 'nont',
    condition_colour: 'nont_olive',
    condition_form: 'nont_square',
    debug_msg: 'nont'
  };
  let display_opp_square_olive = {
    elements: [target_square_olive, nont_square_aqua, distractor_disk_blue],
    condition: 'opp',
    condition_colour: 'opp_olive',
    condition_form: 'opp_square',
    debug_msg: 'opp'
  };

  let display_rel_square_aqua = {
    elements: [target_square_aqua, nont_square_olive, distractor_disk_blue],
    condition: 'rel',
    condition_colour: 'rel_aqua',
    condition_form: 'rel_square',
    debug_msg: 'rel'
  };
  let display_sim_square_aqua = {
    elements: [target_square_aqua, nont_square_olive, distractor_disk_aqua],
    condition: 'sim',
    condition_colour: 'sim_aqua',
    condition_form: 'sim_square',
    debug_msg: 'sim'
  };
  let display_nont_square_aqua = {
    elements: [target_square_aqua, nont_square_olive, distractor_disk_olive],
    condition: 'nont',
    condition_colour: 'nont_aqua',
    condition_form: 'nont_square',
    debug_msg: 'nont'
  };
  let display_opp_square_aqua = {
    elements: [target_square_aqua, nont_square_olive, distractor_disk_green],
    condition: 'opp',
    condition_colour: 'opp_aqua',
    condition_form: 'opp_square',
    debug_msg: 'opp'
  };

  // create blocks
  let block_with_target_disk_olive = [display_rel_disk_olive, display_sim_disk_olive, display_nont_disk_olive, display_opp_disk_olive];
  let block_with_target_square_olive = [display_rel_square_olive, display_sim_square_olive, display_nont_square_olive, display_opp_square_olive];
  let block_with_target_disk_aqua = [display_rel_disk_aqua, display_sim_disk_aqua, display_nont_disk_aqua, display_opp_disk_aqua];
  let block_with_target_square_aqua = [display_rel_square_aqua, display_sim_square_aqua, display_nont_square_aqua, display_opp_square_aqua];

  // Randomly assign participants to target colours
  let participants_target_colour = (Math.random() > 0.5)? 1 : 0 // can be zero or one 

  // sort blocks to according to target colour together with 0 = olive and 1 = aqua
  const participant_zero = [block_with_target_disk_olive, block_with_target_square_olive]   
  const participant_one = [block_with_target_disk_aqua, block_with_target_square_aqua];

  const participant = [participant_zero, participant_one]
  
  let repetitions_practice = 1; // repetitions of all possible patches in one block. Makes 4 patches in practice trials 

  let practice_trials = [jsPsych.randomization.repeat(participant[participants_target_colour][0], repetitions_practice), 
  jsPsych.randomization.repeat(participant[participants_target_colour][1], repetitions_practice) ];

  let repetitions = 3; // repetions of all possible patches in one block. Makes 12 patches per block 

  let trials = [jsPsych.randomization.repeat(participant[participants_target_colour][0], repetitions), 
  jsPsych.randomization.repeat(participant[participants_target_colour][1], repetitions) ]; // TODO: description
 
  //let point_counter = 0
  let last_point_counter = 0
  let last_time  = 0
  let last_eps = null
  let last_last_eps = null
  let start_time = null
     
  // instructions
  let img1 = 'media/images/foraging-relat/display_example_eng.jpg'
  let img2 = 'media/images/foraging-relat/disk_aqua30px.svg'
  let img3 = 'media/images/foraging-relat/patchleaving_example_eng.jpg'
  var instructions = {
    type: 'instructions',
    pages: [
        "<b>Welcome to the experiment!</b><br> <br>Your task is to collect objects like this one:  <br><image src=" +img2+ " style=width:20%> <br> You will always have to look for a specific type of target objects.",
        "Here you can see an example of how the displays in the experiment will look like: <br> <image src=" +img1+ " style=width:50%><br> Additionally the objects in the experiment will move.",
        "You can collect the target objects by clicking on them with the mouse. <br> For each correctly collected target object you will receive one point. If you click on a wrong object you will lose time.<br> Your <b>goal</b> is to reach <b>1000 points</b> as fast as possible. <br> ",
        "If searching becomes too tedious you can go to the next display at any time.<br> By clicking on 'Next' (upper right corner) you will get to a new display with new objects. <br> <image src=" +img3+ " style=width:50%><br>",
        "You can now try out the task with four example displays. <br> For practicing it will be sufficient if you collect only 5 objects per display.<br><br> Click 'Next' to start the practice trials." 
    ],
    show_clickable_nav: true,
  };



  var fertig = 0
  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    background_color : "#E1E1E1",   // RGB 225, 225, 225 in hex
    images_path : "media/images/foraging-relat/", // path to image folder
    patch_size : [1920, 1080], // in vitual pixels
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    condition: jsPsych.timelineVariable("condition"), 
    condition_colour: jsPsych.timelineVariable("condition_colour"),
    condition_form: jsPsych.timelineVariable("condition_form"),
    debug_msg: jsPsych.timelineVariable("debug_msg"),
    travel_time : 1000,
    patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 1000 }),
    
    point_counter_update_function : update_point_counter,
    point_counter_read_out_function : readout_point_counter,
    points_display_html: 
    "<div id='points-display-html' class='points-display'></div>",
   
    next_patch_click_html:
    "<div style='top:20px; left: 1755px' id='next-patch-click-html' class='next-click'><font size=+4 face='Arial' color='646464' > <b>Next</b> </font></div>",
    
    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(document.getElementById("jspsych-foraging-container"), 1920, 1080, 0);
    },
    on_finish: function() { 
      if (readout_point_counter() >= max_targets) {
        jsPsych.endCurrentTimeline()
        
        if (fertig == 1) {
          jsPsych.endExperiment('You can close this tab now. Thank you!');
        }
      }
    },
  };
  
  timeline.push({
    type: "html-button-response",
    stimulus:
      "<font size='+1'>" +
      "<p class='left'>Here is some advice before we start:<p/>" +
      "<ul>" +
      '<li style="text-align:left;">In this experiment you will collect different objects.</li>' +
      '<li style="text-align:left;">Please use a PC or laptop with a mouse on a table for this experiment (no smartphone, tablet or similar).</li>' +
      '<li style="text-align:left;">Take only short breaks and only when the experiment shows feedback (on how many points you reached so far). </li>' +
      '<li style="text-align:left;">Please turn off the night mode if it is activated and turn the brightness to maximum so the colours will be shown correctly.</li>' +
      '<li style="text-align:left;">Position yourself comfortably in front of your computer, just as you normally use it.</li>' +
      '<li style="text-align:left;">Avoid sources of interference on the PC: Close other programs and browser tabs.</li>' +
      '<li style="text-align:left;">Avoid sources of interference in the room: Switch off the TV, radio, etc. and do not allow yourself to be distracted by other people.</li>' +
      '<li style="text-align:left;">If you want to abort the experiment, press ESC and close the browser window. We will then delete the data. </li><br />' +
      "</ul>",
    choices: ['Next'],
  });


  // Switch to fullscreen
  timeline.push({
    type: "fullscreen",
    button_label: 'Next', 
    fullscreen_mode: true,
  });

  // Instruction 
  timeline.push(instructions);
  
  // Practice trials 
  var trials_count_practice = (Math.random()>0.5)? 1 : 0;
    
  var picture_practice = "Test";

  if (participants_target_colour == 0){
    if (trials_count_practice == 0){
      picture_practice = 'media/images/foraging-relat/disk_olive30px.svg';
    }
    else{
      picture_practice = 'media/images/foraging-relat/square_olive26_587px.svg';
    }
  }
  else {
    if (trials_count_practice == 0){
      picture_practice = 'media/images/foraging-relat/disk_aqua30px.svg';
    }
    else{
      picture_practice = 'media/images/foraging-relat/square_aqua26_587px.svg'
    }
  }

  timeline.push({
    type: "html-keyboard-response",
    stimulus:  
      "<font size='+2'>" +
      "In this block please collect this target object: <br /><br />" + 
      "<img src =" +picture_practice+ " style=width:30% >" +  
      "<br /><br />Continue by pressing a button!" +
      "</font>",
  });

  timeline.push({
    timeline: [patch],
    timeline_variables: practice_trials[trials_count_practice],
  });

  //Instruction after practice trials 
  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "<font size='+1'>" +
      "<p>The practice trials are now finished. <p/>" +
      "<p><p/><b>Time is money!</b> Please try to collect your 1000 points as fast as possible.<br />" +
      "<p>And remember: You do not have to collect all objects in a display. There are infinite new and full displays.<p/><br />" +
      "<p><b>Ready to go?</b></p>" +
      "<p>Start the experiment by pressing a button!</p>" +
      "</font>",
  });

  // reset pointcounter after practic trials 
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

  var trials_count = (Math.random()>0.5)? 1 : 0;

  for (var b = 0; b < 100; b++){
    if (b % 2 == 0) {
      if (trials_count == 0) {
        trials_count = 1;
      }
      else {
        trials_count = 0;
      }
    } 
    var picture = "Test";

    if (participants_target_colour == 0){
      if (trials_count == 0){
        picture = 'media/images/foraging-relat/disk_olive30px.svg';
      }
      else{
        picture = 'media/images/foraging-relat/square_olive26_587px.svg';
      }
    }
    else {
      if (trials_count == 0){
        picture = 'media/images/foraging-relat/disk_aqua30px.svg';
      }
      else{
        picture = 'media/images/foraging-relat/square_aqua26_587px.svg'
      }
    }
   
    var ausgabe = {
      type: "html-keyboard-response",
      stimulus:  
        "<font size='+2'>" +
        "In this block please collect this target object:<br /><br />" + 
        "<img src =" +picture+ " style=width:30% >" +  
        "<br /><br />Continue by pressing a button!" +
        "</font>",
    }

    timeline.push({
      timeline: [ausgabe],
      conditional_function: function(){
        if (readout_point_counter() >= max_targets) { 
          return false;
        }
        else {
          return true;
        }
      }
    });

    timeline.push({
      timeline: [patch],
      timeline_variables: trials[trials_count],
      conditional_function: function(){
        if (readout_point_counter() >= max_targets) { 
          return false;
        }
        else {
          return true;
        }
      }
    });

    // Feedback after a block 
    var ausgabe2 = {
      type: "html-keyboard-response",
      stimulus:  function() {
        var current_points = readout_point_counter()
        var current_time = performance.now()
        var collected_since_last_break = (current_points - last_point_counter)
        var duration =  current_time - last_time
        var current_eps = Math.ceil((collected_since_last_break / (duration/1000))*60)
        last_point_counter = current_points
        last_time = current_time
        var stim = 
        "<font size='+2'>" +
        "You have reached " + current_points + " of " + max_targets +  " points. <br />" +
        "Your collection rate is " + current_eps + " points per minute.<br /> <br />" 
        if (last_eps != null) {
          stim += "In the last block it was "+ last_eps + " points per minute.<br /> <br />" 
          }
          if (last_last_eps != null) {
            stim += "In the second last block it was "+ last_last_eps + " points per minute.<br /> <br />" 
          }
        stim += "Can you go even faster? <br /><br />Continue by pressing a button!"
        last_last_eps = last_eps
        last_eps = current_eps         
        return stim
        }
      }

     timeline.push({
      timeline: [ausgabe2],
      conditional_function: function(){
        if (readout_point_counter() >= max_targets) { 
          return false;
        }
        else {
          return true;
        }
      }
    });   
  };

  timeline.push({
    type: "survey-text",
    questions: [{ prompt: "<b>Great you collected more than 1000 target objects! <br>The experiment is finished now!</b><br>" +
    " If you noticed anything unusual during the experiment you can leave a comment here:", name: 'Comment', rows: 10, columns: 80 }],
    button_label: 'Next',
    placeholder: 'Comment...',  
  });

  var ausgabe3 = {
    type: "html-keyboard-response",
     stimulus:
    "Thank you for your participation! </br></br>" 
     + "The experiment is now finished. </br></br>" 
     + "Close this browser window/tab only after this message is no longer visible. Thanks a lot!",
    trial_duration: 10000,
  }
  timeline.push({
    timeline: [ausgabe3],
    conditional_function: function(){
      if (readout_point_counter() >= max_targets) { 
        fertig=1;
      }
      else {
        fertig=0;
      }
    }
  });
  return timeline;
}   



export function getPreloadImagePaths() {
  return [];
}