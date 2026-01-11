/**
 * @title Foraging Test
 * @description A test experiment for the ForagingPatchPlugin
 * @version 0.8
 * @assets assets/images/foraging-test,assets/audio/sounds
 */



import { initJsPsych } from "jspsych";
import "jspsych/css/jspsych.css";
import "../styles/main.scss";
import "../styles/jspsych-foraging-patch.scss";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import ForagingPatchPlugin from "./ForagingPatchPlugin"; 
import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { linear } from "popmotion"; 

// --- NO IMPORTS. WE USE STRINGS. ---

function expandConfigToElements(config: any, width: number, height: number) {
    const expandedElements: any[] = [];
    const generator = config.positions;
    const amount = config.amount || 1;

    if (generator && generator.reset) generator.reset();

    for (let i = 0; i < amount; i++) {
        let pos: { x: number | undefined; y: number | undefined } | undefined = { x: undefined, y: undefined };
        
        if (generator) {
            pos = generator.next(); 
            if (!pos) pos = { x: Math.random() * width, y: Math.random() * height };
        } else {
             pos = { x: Math.random() * width, y: Math.random() * height };
        }

        const imgIndex = i % config.images.length;
        const image = config.images[imgIndex];
        
        const element = {
            id: `${config.type}-${i}`,
            type: config.type,
            image: image,
            x: pos.x,
            y: pos.y,
            width: 50,
            height: 50,
            collectible: config.collectible,
            points: config.points,
            click_sounds: config.click_sounds,
            mouseover_sounds: config.mouseover_sounds,
            mouseover_image: config.mouseover_images ? config.mouseover_images[imgIndex] : null,
            collected_image: config.collected_images ? config.collected_images[0] : null,
            animation: config.animation
        };
        expandedElements.push(element);
    }
    return expandedElements;
}

export function createTimeline(jatosStudyInput: any = null) {
  const jsPsych = initJsPsych({
    on_finish: () => {}
  });

  let point_counter = 0;
  function update_point_counter(val: number) { point_counter += val; }
  function readout_point_counter() { return point_counter; }

  const timeline: any[] = [];

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: "<p>Welcome to the foraging test!</p><p>Press any key to begin.</p>",
  });

  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: true,
  });

  const stim_positions = new JitteredGridCoordinates({
    columns: 12, rows: 7, hspacing: 150, vspacing: 130, hjitter: 10, vjitter: 10,
    hoffset: 0, voffset: 80, on_used_up: "nothing", on_patch_done: "reset",
  });

  const cloud_positions = new JitteredGridCoordinates({
    columns: 5, rows: 1, hspacing: 300, vspacing: 0, hjitter: 30, vjitter: 0,
    hoffset: 0, voffset: -550, on_used_up: "nothing", on_patch_done: "reset",
  });

  const imgPath = "/assets/images/foraging-test/";
  const audPath = "/assets/audio/sounds/";

  const targetConfig = {
    type: "target",
    amount: 20,
    positions: stim_positions,
    images: ["butterfly1.png", "butterfly2.png"], 
    mouseover_images: ["flower1.png", "flower2.png"], 
    collected_images: ["collected.png"],
    click_sounds: ["beep.mp3"], 
    mouseover_sounds: ["click.mp3"], 
    collectible: true,
    points: 10,
  };

  const distractorConfig = {
    type: "distractor",
    amount: 20,
    positions: stim_positions,
    images: ["flower1.png", "flower2.png"],
    collectible: true, 
    points: -20, 
    animation: {
      from: { rotate: -10, x: -5 },
      to: { rotate: 10, x: 5 },
      duration: 1000,
      elapsed: Math.floor(Math.random() * 1000.0),
      repeat: Infinity,
      repeatType: "mirror"
    },
  };

  const cloudConfig = {
    type: "clouds",
    amount: 3,
    positions: cloud_positions,
    images: ["cloud1.png", "cloud2.png", "cloud3.png", "cloud4.png"],
    collectible: false,
    points: 0,
    animation: { 
        from: { x: -200 }, 
        to: { x: 2120 },
        duration: 40000,
        repeat: Infinity,
        ease: linear 
    }, 
  };

  const patchWidth = 1920;
  const patchHeight = 1080;

  const elementsList = [
      ...expandConfigToElements(targetConfig, patchWidth, patchHeight),
      ...expandConfigToElements(distractorConfig, patchWidth, patchHeight),
      ...expandConfigToElements(cloudConfig, patchWidth, patchHeight)
  ];

  const factors = { timeout: [50000, 100000] };
  const full_design = jsPsych.randomization.factorial(factors, 2);

  const foraging_trial = {
    type: ForagingPatchPlugin,
    // Pass the base paths here
    images_path: imgPath, 
    audio_path: audPath,
    patch_size: [1920, 1080],
    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    timeout: jsPsych.timelineVariable('timeout'),
    elements: elementsList, 
    background: ["background1.svg", "background2.svg", "background3.svg"], 
    points_display_html: "<div style='font-size:24px; font-weight:bold; color:#99AAFF;'>Points: <span id='jspsych-foraging-score-value'>0</span></div>",
    next_patch_click_html: "<div id='next-patch-click-html' class='next-click' style='cursor:pointer;'><font size=+4 face='Comic Sans MS' color='#99AAFF'> Next </font></div>",
    travel_time: 4000,
    patch_leaving_animation: true,
    trial_ends_when_all_collected: true,
    on_load: () => {
       const container = document.getElementById("jspsych-foraging-container");
       if(container) {
         new Scaler(container, 1920, 1080, 0);
       }
    },
  };

  timeline.push({
    timeline: [foraging_trial],
    timeline_variables: full_design,
  });

  return { jsPsych, timeline };
}

export async function run({ assetPaths, input = {} }: any = {}) {
  const { jsPsych, timeline } = createTimeline(input);
  await jsPsych.run(timeline);
}