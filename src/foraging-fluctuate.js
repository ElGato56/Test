/**
 * @title foraging-fluctuate
 *  
 * @description Test with predictably fluctuation elements.
 * 
 * @version 1.7-prolific-final-version
 *
 * @imageDir images/foraging-fluctuate
 */
 import "../styles/jspsych-foraging-patch.scss" 
 import "../styles/main.scss"
 import "jspsych/plugins/jspsych-call-function";
 import "jspsych/plugins/jspsych-html-keyboard-response";
 import "jspsych/plugins/jspsych-instructions";
 import "jspsych/plugins/jspsych-html-button-response";
 import "jspsych/plugins/jspsych-fullscreen"; 
 import "jspsych/plugins/jspsych-survey-text";
 import "jspsych/plugins/jspsych-survey-multi-choice";
 //import "jspsych/plugins/jspsych-preload";
 
 import "./plugins/jspsych-foraging-patch";

 import { JitteredGridCoordinates } from "./util/PositionGenerators";
 import { Scaler } from "./util/Scaler";
 import { tween, physics } from "popmotion"
 
 let debug = false
 
 /**
  * Creates the experiment's jsPsych timeline.
  * Make sure to import every jsPsych plugin you use (at the top of this file).
  * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
  * study input.
  */
 export function createTimeline(jatosStudyInput = null) {
   if (typeof jatos  !== 'undefined') {
     var pid = jatos.urlQueryParameters['PROLIFIC_PID'];
   };
 
   // Let's make a list with all the VSC_X.svg filenames:
   const image_files = Array.from(Array(360).keys()).map(
     (x) => "VCS_resized_" + (x + 1) + ".svg"
   );
 
   // Let's make a list of the "animation states" which has this form:
 //const cycle_list = Array.from(Array(360).keys())
 
   const cycle_list = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,
     40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,
     90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,
     130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,
     170,171,172,173,174,175,176,177,178,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,179,
     180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,
     210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,224,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,
     250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,
     290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,
     330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359] //plateaus implemented (currently #36) //ca. 26s
 
   // Initialize jsPsych timeline
   let timeline = [];
 
   // Let's make a list with all the VSC_X.svg filenames:
   const image_files_pl = Array.from(Array(360).keys()).map(
     (x) => "media/images/foraging-fluctuate/VCS_resized_" + (x + 1) + ".svg"
   );
   
   var preload = {
     type: "call-function",
     async: true,
     func: function (done) {
       jsPsych.getDisplayElement().innerHTML = '<p>Loading... Please wait.</p>'
       jsPsych.pluginAPI.preloadImages(image_files_pl, function () {
         done({ preload: "success" });
       })
     }
   };
   timeline.push(preload)
 
   
   // This will define an object that will be used to
   // generate positions for targets and distractors
   var stim_positions = new JitteredGridCoordinates({
     columns: 15,
     rows: 8,
     hspacing: 120,
     vspacing: 120,
     hjitter: 40,
     vjitter: 40,
     hoffset: 45,
     voffset: 45,
     on_used_up: "reset",
     on_patch_done: "reset",
   });
 
   // Let's first define the elements in simple feature patches
 
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
 
  // Get random positions around the screen borders:
 
  function get_border_pos(fringe) {
 
    // Attention: Currently the resolution is hardcoded here:
    const screen_width = 1920;
    const screen_height = 1080;
 
    // Let's number the border areas
    //  |--1--|
    //  0     2
    //  |--3--|
    
    // and select one of them ...
   const border=Math.floor(Math.random()*4)
   let x = 0
   let y = 0
   if (border==0) {
     x =  screen_width/2  + Math.floor(Math.random()*fringe)
     y = -screen_height/2-fringe  + Math.floor(Math.random()*(screen_height+2*fringe))
   }
   else if (border==1) {
     x =  -screen_width/2  + Math.floor(Math.random()*screen_width)
     y = -screen_height/2  - Math.floor(Math.random()*fringe)
   }
   else if (border==2) {
     x =   screen_width/2  + Math.floor(Math.random()*fringe)
     y = -screen_height/2 -fringe  + Math.floor(Math.random()*(screen_height+2*fringe))
   }
   else if (border==3) {
     x =   -screen_width/2  + Math.floor(Math.random()*screen_width)
     y =   screen_height/2  + Math.floor(Math.random()*fringe)
   }  
     return [x, y]
  }
 
 
 //distractors in current setup
   var distractors = {
     type: "distractor",
     amount: 60,
     images: image_files,
     scale: 0.2,
     //cycle_images : {offset  : 0},
     positions: stim_positions, 
     collectible: false,
     points: -5, 
     trial_ends_when_all_collected : false,
     // The line below assigns a list of animations (generated from random velocities) to the elements
     animations: generate_random_velocities(20, 30).map((vel) =>
       physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
     ),
     on_left_out: left_border_touched,
     on_right_out: right_border_touched,
     on_top_out: top_border_touched,
     on_bottom_out: bottom_border_touched,
     click_animation : tween({ from: { scale: 0.2 }, to: { scale: 1}, duration: 50 }),
   };
 
   var distractor_start1 = Object.assign({}, distractors, {cycle_images : {offset: 0}})
   var distractor_start2 = Object.assign({}, distractors, {cycle_images : {offset: 214}}) //Trial starts at begin of plateau-phase#2 --> 214!!! //TODO
 
   //Star-Targets
   var targets_1 = {
     type: "target_1",
     amount: 15,
     images: ["VCS_resized_1.svg"], //or blue shape? 
     scale: 0.2,
     //cycle_images : {offset  : 55},
     positions: stim_positions, 
     collectible: false,
     points: 1, //or more? 
     trial_ends_when_all_collected : false, // do we need this? true --> false 
     // The line below assigns a list of animations (generated from random velocities) to the elements
     animations: generate_random_velocities(20, 30).map((vel) =>
       physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
     ),
     on_left_out: left_border_touched,
     on_right_out: right_border_touched,
     on_top_out: top_border_touched,
     on_bottom_out: bottom_border_touched,
     
     on_collect_finished: (stim) => {
       stim.playback.set(0);
       let new_vel = generate_random_velocities(1, 30, 0, Math.PI)[0]
       stim.playback.setVelocity({x : new_vel[0], y : new_vel[1]})
       //let new_pos = get_border_pos(50); // new random position at the border of the display
       let new_pos = stim_positions.next(); // new random position in the display 
       stim.style.marginLeft = new_pos[0] + 'px'
       stim.style.marginTop = new_pos[1] + 'px'
       tween({ from: 0, to: 1, duration: 1500 }).start((v) => stim.style.opacity = v) // nice fading /default: 1000
     },
 
   };
 
   //Toast-Targets
   var targets_2 = {
     type: "target_2",
     amount: 15,
     images: ["VCS_resized_180.svg"], //or blue shape? 
     scale: 0.2,
     //cycle_images : {offset  : 55},
     positions: stim_positions, 
     collectible: false,
     points: 1, //or more? 
     trial_ends_when_all_collected : false, //do we need this? true --> false 
     // The line below assigns a list of animations (generated from random velocities) to the elements
     animations: generate_random_velocities(20, 30).map((vel) =>
       physics({ velocity: { x: vel[0], y: vel[1] }, loop: Infinity })
     ),
     on_left_out: left_border_touched,
     on_right_out: right_border_touched,
     on_top_out: top_border_touched,
     on_bottom_out: bottom_border_touched,
 
     on_collect_finished: (stim) => {
       stim.playback.set(0);
       let new_vel = generate_random_velocities(1, 30, 0, Math.PI)[0]
       stim.playback.setVelocity({x : new_vel[0], y : new_vel[1]})
       //let new_pos = get_border_pos(50); //new random position at the border of the display
       let new_pos = stim_positions.next(); //new random position in the display
       stim.style.marginLeft = new_pos[0] + 'px'
       stim.style.marginTop = new_pos[1] + 'px'
       tween({ from: 0, to: 1, duration: 1500 }).start((v) => stim.style.opacity = v) //nice fading 
     },
 
   };
   
   //Create all variations of patches
   let display_start1_slow = {elements : [distractor_start1, targets_1, targets_2],
                       condition : 'start1_slow',
                       tag: "slow",
                       timeout : 1000 * 38.7 * 2,
                       state_cycle : {states : cycle_list, interval : 90 } //90
                     }
   let display_start2_slow = {elements : [distractor_start2, targets_1, targets_2],
                       condition : 'start2_slow',
                       tag: "slow",
                       timeout : 1000 * 38.7 * 2,
                       state_cycle : {states : cycle_list, interval : 90 } //90
                     }
   let display_start1_medium = {elements : [distractor_start1, targets_1, targets_2],
                       condition : 'start1_medium',
                       tag: "medium",
                       timeout : 1000 * 25.8 * 2,
                       state_cycle : {states : cycle_list, interval : 60 } //60
                     }
   let display_start2_medium = {elements : [distractor_start2, targets_1, targets_2],
                       condition : 'start2_medium',
                       tag: "medium",
                       timeout : 1000 * 25.8 * 2,
                       state_cycle : {states : cycle_list, interval : 60 } //60
                     }                
   let display_start1_fast = {elements : [distractor_start1, targets_1, targets_2],
                       condition : 'start1_fast',
                       tag: "fast",
                       timeout : 1000 * 12.9 * 2,
                       state_cycle : {states : cycle_list, interval : 30 } //30
                     }
   let display_start2_fast = {elements : [distractor_start2, targets_1, targets_2],
                       condition : 'start2_fast',
                       tag: "fast",
                       timeout : 1000 * 12.9 * 2,
                       state_cycle : {states : cycle_list, interval : 30 } //set from 15 to 30 
                     }
   //TODO: Timeout anpassen je nach Geschwindigkeit: slow 38,7 / medium 25,8 / fast 12,9 (--> *2, da immer 2 Durchgänge!)
 
   //Demo-Trials                  
   let demo_trials = [jsPsych.randomization.repeat([display_start1_medium,display_start2_medium],1)[0]] //TODO medium start 1/2!!!//RANDOMISIERT; Punkte werden zurückgesetzt. 
 
   // let trials = jsPsych.randomization.repeat([display], 2); // let's do only 2 patches of this type for testing //old
 
   // Let's start with an empty list
   let trials = []
   let trials_per_block = 2
   for (var j = 0; j < 4; j++){ //TODO: 4!!
     let blocks = [display_start1_slow, display_start2_slow, display_start1_medium, display_start2_medium, display_start1_fast, display_start2_fast]  // <-- TODO: alle Display Varianten einfügen
     blocks = jsPsych.randomization.repeat(blocks, 1) // Shuffle the blocks, so that every participant gets a random order
     for (var i = 0; i < blocks.length; i++) {
       //  @ Laura: an dieser Stelle könntest du einen screen mit Pause in die trials variable pushen //nö, doch nicht :-)
       //for (var j = 0; j < trials_per_block; j++) { //Einrücken und obere for-Schleife rauslöschen, dann wieder alte geblockte unrandomisierte Trial-Folge
         trials.push(blocks[i])
       //}
     }
   }
   //randomized/äußere Klammer neu
 
 
   let point_counter = 0;
   let last_point_counter = 0;
   let last_time = 0;
   let last_eps = null;
   let last_last_eps = null;
   let start_time = null;
   let exp_round = 0;
 
   function update_point_counter(val) {
     point_counter += val;
   }
 
   function readout_point_counter() {
     return point_counter;
   }
 
   // This will create the actual patches of the experiment:
   let patch = {
     virtual_boundary: 100, // How many pixels outside the screen border?
     type: "foraging-patch", // Tells jsPsych to use our foraging pluging
     state_cycle : jsPsych.timelineVariable("state_cycle"),
     background_color : "#7F7F7F",
     images_path : "media/images/foraging-fluctuate/", // path to image folder
     patch_size : [1920, 1080], // in vitual pixels
     elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
     condition: jsPsych.timelineVariable("condition"), // saves condition variable... 
     //timeout: 5000, //1000 * 25.8 *2, 
     timeout: jsPsych.timelineVariable("timeout"),
     travel_time : 1000,
     points_display_html:
       "<div id='points-display-html' class='points-display'><font size=+3 face='Arial' color='#0000AA'>Points: %% </font></div>",
     point_counter_update_function: update_point_counter,
     point_counter_read_out_function: readout_point_counter,
     patch_leaving_animation: tween({ from: { opacity: 1 }, to: { opacity: 0 }, duration: 800 }),
     // This is required to scale the display to fit the (unknown) screen size
     on_load: () => {
       new Scaler(document.getElementById("jspsych-foraging-container"), 1920, 1080, 0);
     
     },
     point_animation: physics({
       from: { opacity: 1 },
       to: { opacity: 0 },
       velocity: { y: -120, opacity: -2.3 },
     }),
     point_indicator: //just for the distractors
     "<div id='point-indicator-html' class='point-indicator'><font size=+4 face='Comic Sans MS' color='#0000AA'>%%</font></div>", //schwarz, früher dunkelblau: 0000AA
     indicate_points: "negative",
   };
 
   //This will create breaks 
   let expbreak = {
     conditional_function: function(){return readout_point_counter},
     type: "html-keyboard-response",
     stimulus: function () {
       var current_points = readout_point_counter();
       var current_time = performance.now();
       var collected_since_last_break = current_points - last_point_counter;
       var duration = current_time - last_time;
       var current_eps = Math.ceil((collected_since_last_break / (duration / 1000)) * 60);
       last_point_counter = current_points;
  
       exp_round++;
 
       var stim =
         "<font size='+1'>" +
         "<b>Awesome! Round " + exp_round + " of 6 is done! Time for a short break. </b></br><br>" + //TODO: Wie viele Durchgänge wird es geben? Antwort: 6 
         "In this round you have achieved a total of " +
         collected_since_last_break + //haben current_points durch collected_since_last_break ersetzt
         " points! <br />" +
         "Your collecting-speed is " +
         current_eps +
         " points per minute!<br /> <br />"; //TODO: macht noch nicht so ganz, was es soll // BEHOBEN MIT JAN! 
       if (last_eps != null) {
         stim +=
           "In the last round it was  " +
           last_eps +
           " points per minute!<br /> <br />";
       }
       if (last_last_eps != null) {
         stim +=
           "In the penultimate round it was " +
           last_last_eps +
           " points per minute!<br /> <br />";
       }
       stim +=
         "*Can you improve your score?* <br /><br /><i>Continue the experiment by pressing any key...</i>"; 
       last_last_eps = last_eps;
       last_eps = current_eps;
       return stim;
     },
     on_finish: function(data) {
       last_time = performance.now(); 
       }
   };
 
   //This will ensure that breaks only appear every x trials
   let counter = 0 
     let conditional_break = {
       timeline: [expbreak],
       conditional_function: function (){
         counter++;
         if((counter) % 4 == 0) { //TODO: set to 4!! 
           return true;
         } else {
             return false;
         }
       }
     }
 
   //CONSENT, DEMOGRAPHICS, GENERAL INFORMATION, FULLSCREEN //
   if (debug == true) {
 
     timeline.push({
       type: "html-button-response",
       stimulus:
         "<font size='+1'>" +
         "<p class='left'>Some general information before you start:<p/>" +
         "<ul>" +
         '<li style="text-align:left;">Please use a <b>desktop or laptop</b> with a mouse for this experiment (no smartphone, tablet or similar).</br> </li>' +
         '<li style="text-align:left;">The experiment will take approximately <b>28 minutes</b>. Please take only breaks when the experiment shows you feedback (e.g., on how many points you reached so far).</br> </li>' + //Dauer!! 
         '<li style="text-align:left;">Make yourself comfortable in front of your computer, just as you would normally use it.</br> </li>' +
         '<li style="text-align:left;">Avoid any disturbances on the PC: Close other programs and browser tabs.</br></li>' +
         '<li style="text-align:left;">Avoid any disturbances around you: Turn off music, TV, etc. and do not allow yourself to be distracted by other people.</br></li>' +
         '<li style="text-align:left;">If you want to quit the experiment, press ESC and close the browser tab. Your data will then be deleted.</br></br></li>' +
         "</ul>",
       choices: ['next'],
     });
 
     // Switch to fullscreen
     timeline.push({
       type: "fullscreen",
       message: "<p>The experiment will now switch to full screen mode.<p>",
       button_label: "next",
       fullscreen_mode: true,
     });
 
   }
 
   //INSTRUCTION
   //let img11 = 'media/images/foraging-fluctuate/display_screenshot.png' /old picture without point indicator 
   let img1 = 'media/images/foraging-fluctuate/display_screenshot_2.png'
   let img2 = 'media/images/foraging-fluctuate/VCS_resized_1.svg'
   let img3 = 'media/images/foraging-fluctuate/VCS_resized_180.svg'
   let gif1 = 'media/images/foraging-fluctuate/shape.gif'
 
   var instructions_1 = { 
     type: "instructions",
     pages: [
       "<font size='+1'>" +
       "<b>Welcome!</b> <br/><br/>" +
       "In this experiment, your task is to collect specific objects as fast as possible. You will soon find out what these are!<br/><br/>" +
       "Here you can see how a display in this experiment will look like:<br/>" +
       //"<image src='media/images/foraging-fluctuate/display_screenshot.png'><br />" +
       "<image src=" +img1+ " style=width:50%><br/><br/>"+ 
       "<b>All</b> objects will move across the screen, <b>some of them</b> will change their shapes continuously.<br/><br/>",
 
       "You can collect the objects by clicking on them with your left mouse button.<br/><br/>" +
       "<b>But be careful:</b> not all objects can be collected.<br/>"+
       "For some you will receive points, for others you will be deducted points. <br/><br/>"+ 
       "<u>Your goal</u> is to collect as many points as possible! It is worth for you to be good: If you are among the top 10% of all participants, you will receive a <b>bonus of 2 pounds</b>.<br/><br/>",  //points??
 
       "<b>Here you can see the two types of objects you should collect:</b><br/>" +
       "<image src= "+img2+" style=width:10%>" +
       "<image src= "+img3+" style=width:10%><br/>" +
       "These will <u>NOT</u> change their shapes throughout the experiment.<br/>"+
       "For every correctely collected object you will receive <b>+1</b> point.<br/><br/><br/><br/>" +
 
       "<b>All other objects in the display can <u>NOT</u> be collected:</b><br/>"+
       "<image src= "+gif1+" height = '65px' width ='65px' ><br>"+ 
       "Please note that these objects change their shapes <u>continiously</u> (see above).<br/>"+
       "For each incorrectly collected object you will be deducted <b>-5</b> points.<br/><br/>",
 
       "Time for practice!<br/>"+ //default: um das Experiment zu starten.
       "Klick <i>'next'</i> - practice-trial starts with the next display!<br/><br/>"
 
     ],
     show_clickable_nav: true,
     button_label_previous: "previous",
     button_label_next: "next"
   };
 
  
 
   var instructions_2 = { 
     type: "instructions",
     pages: [
       "<font size='+1'>" +
       "This display was for practise.<br/><br/>" + 
       "Remember: <b>Your goal is to collect as many points as possible!</b><br/><br/>" ,
 
       "<u>Quick reminder:</u> <br/><br/><br/>"+
       "<b>Objects you should collect:</b><br/>" +
       "<image src= "+img2+" style=width:10%>" + 
       "<image src= "+img3+" style=width:10%><br/>" +
       "<li>Do <u>not</u> change their shapes throughout the experiment</li>"+
       "<li>points: <b>+1</b> </li><br/><br/><br/>" +
 
       "<b>Objects you should <u>not</u> collect (all the rest):</b><br/>"+
       "<image src= "+gif1+" height = '65px' width ='65px' ><br>"+ 
       "<li>Change their shapes <u>continiously</u> throughout the experiment (see above)</li>"+
       "<li>points: <b>-5</b></li><br/>",
 
       "From now on, try to be as fast as possible and to collect as many points as you can.<br/>"+
       "<b>Can you make it into the top 10%?</b><br/><br/>",
       "Ready to go? Click <i>'next'</i> to start the experiment.<br/><br/>"
 
     ],
     show_clickable_nav: true,
     button_label_previous: "previous",
     button_label_next: "next",
     on_finish: () => {
       document.body.style.backgroundColor = "#7f7f7f";
     }
   };
 
  
   timeline.push(instructions_1);
 
   timeline.push({
     timeline: [patch],
     timeline_variables: demo_trials,
   });
 
 
   timeline.push(instructions_2);
 
 
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
 
   
   timeline.push({
     timeline: [patch, conditional_break],
     timeline_variables: trials,
   });
   
 
   timeline.push({
     type: "html-button-response",
     choices: ['next'],
     stimulus: function () {
       return  "<b>Awesome! That's it for collecting!</b><br >" +
       " You have achieved " +
       readout_point_counter() +
       " points! <br ><br >" +
       "If your are among the best 10% of all participants, you will receive the bonus payment via the prolific system. <br >It can take a few weeks until the data collection is finsished. <br > <br >" 
       //"The main experiment is now over.<br ><br >" //+
     },
   });
 
   timeline.push({
     type: "survey-text",
     questions: [{ prompt: "The main experiment is now over. <br ><br ><b>If you have any questions, comments or suggestions, please leave your comments here </b></br>or contact me directly (Laura Weinlich: weinlich@students.uni-marburg.de):" , name: 'Comment', rows: 10, columns: 80 }],
     button_label: 'next',
     placeholder: 'Comment...',  
   });
 
 
   timeline.push({
     type: "html-keyboard-response",
     stimulus:
       "<b>Thank you for your participation! </b>The experiment is now over.</br></br>" +
       "<b>Important:</b> </br>" +
       "Do not close this tab. You will be automatically redirected to prolific.</br></br>" + //TODO: Anpassung an Proflific überprüfen 
       "<i>Wait 10 seconds or press any key...</i></br><br/>" ,
       
     trial_duration: 10000
   });
 
   return timeline;
 }
 
 //export function getPreloadImagePaths() {
   //return [];
 //}
 //TODO: die beiden Zeilen oben löschen!