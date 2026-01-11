import { JsPsych, JsPsychPlugin, TrialType, ParameterType } from "jspsych";
import { PatchRenderer } from "./PatchRenderer";
import { PatchElement, LegacyElementConfig } from "./PatchElement";

/**
 * Plugin Configuration
 * Refactored from 'jspsych-foraging-patch-info.js'
 */
const info = <const>{
  name: "foraging-patch",
  parameters: {
    // Visuals
    patch_size: {
      type: ParameterType.INT,
      default: [800, 600],
      array: true,
      description: "Width and height of the patch container."
    },
    // Satisfies FR-P.3 (Background)
    // Legacy note: legacy experiments might pass an array 'backgrounds'.
    // We accept COMPLLEX to handle strings or arrays.
    background: {
      type: ParameterType.COMPLEX,
      default: "#f0f0f0",
      description: "Background image, color, or array of options."
    },
    // Satisfies FR-E.1 (Element List)
    elements: {
      type: ParameterType.COMPLEX,
      array: true,
      default: [],
      description: "List of objects defining the items on the patch."
    },
    images_path: {
      type: ParameterType.STRING,
      default: "",
      description: "Base path for images."
    },
    audio_path: {
      type: ParameterType.STRING,
      default: "",
      description: "Base path for audio files."
    },
    // Satisfies FR-P.4 (Travel Time)
    travel_time: {
      type: ParameterType.INT,
      default: 0,
      description: "Duration (ms) to wait after patch completion."
    },
    // Satisfies FR-P.5 (Leaving Animation)
    patch_leaving_animation: {
      type: ParameterType.BOOL,
      default: false,
      description: "If true, plays a fade-out animation when the patch is finished."
    },

    // Control
    timeout: {
      type: ParameterType.INT,
      default: null,
      description: "Time in ms before trial ends automatically."
    },
    next_patch_click_html: {
      type: ParameterType.HTML_STRING,
      default: null,
      description: "HTML for a button to end the trial manually."
    },
    trial_ends_when_all_collected: {
      type: ParameterType.BOOL,
      default: false,
      description: "If true, trial ends when all collectible items are found."
    },

    // Scoring
    point_counter_update_function: {
      type: ParameterType.FUNCTION,
      default: null,
      description: "Function to call when points change."
    },
    point_counter_read_out_function: {
      type: ParameterType.FUNCTION,
      default: null,
      description: "Function to get current total score at start of trial."
    },
    points_display_html: {
      type: ParameterType.HTML_STRING,
      default: "<div style='font-size:20px; font-weight:bold;'>Points: <span id='jspsych-foraging-score-value'>0</span></div>",
      description: "HTML template for score display."
    },

    // Data Logging (FR-D.1)
    condition: {
      type: ParameterType.STRING,
      default: "",
      description: "Experimental condition label to be saved in data."
    }
  },
};

type Info = typeof info;

class ForagingPatchPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const renderer = new PatchRenderer(display_element);

    // 1. Initialize Data Recording

    // Satisfies FR-D.2 (Start Time)
    const startTime = performance.now();

    // Satisfies FR-D.3 (Selections Array)
    const selections: any[] = [];

    // Initialize Score
    let currentScore = 0;
    if (trial.point_counter_read_out_function) {
      currentScore = trial.point_counter_read_out_function();
    }

    // 2. Patch Configuration
    const patchSize = [window.innerWidth, window.innerHeight];
    const width = patchSize[0];
    const height = patchSize[1];

    // Legacy Support: Handle if 'background' is an array (random pick) or string
    let bgToUse: string | null = null;
    if (Array.isArray(trial.background)) {
      // Simple random selection if an array is passed
      bgToUse = trial.background[Math.floor(Math.random() * trial.background.length)];
    } else if (typeof trial.background === 'string') {
      bgToUse = trial.background;
    }

    renderer.renderContainer(width, height, bgToUse);

    // 3. Render HUD
    renderer.renderHUD(
        trial.points_display_html || "",
        trial.next_patch_click_html || null,
        () => endTrial()
    );
    renderer.updateScoreDisplay(currentScore);

    // 4. Element Generation
    const generatedElements: PatchElement[] = [];
    const rawConfigs = trial.elements as LegacyElementConfig[];

    let totalCollectibles = 0;
    let collectedCount = 0;
    const padding =  100  ;
    const getRandomPos = (max: number) => Math.floor(Math.random() * (max - (padding * 2))) + padding;

    if (rawConfigs && rawConfigs.length > 0) {
      rawConfigs.forEach((config) => {
        const count = config.amount || 1;
        if (config.collectible) {
          totalCollectibles += count;
        }

        for (let i = 0; i < count; i++) {
          const instanceConfig = { ...config };
          if (instanceConfig.x === undefined) instanceConfig.x = getRandomPos(width);
          if (instanceConfig.y === undefined) instanceConfig.y = getRandomPos(height);

          const element = new PatchElement(instanceConfig, trial.images_path, trial.audio_path || "");

          element.bindClick((clickedItem) => {
            handleElementClick(clickedItem);
          });

          generatedElements.push(element);
        }
      });
      renderer.renderElements(generatedElements);
    }

    // 5. Interaction Logic
    const handleElementClick = (item: PatchElement) => {
      // 5a. Log Interaction Data (FR-D.3, FR-D.4, FR-D.5)
      
      if (item.config.collectible) {
        item.setCollected();
        collectedCount++;
        const points = item.getPoints();

        // Satisfies FR-D.3 (Add to Array)
        // Satisfies FR-D.4 (ID, Time, Position)
        // Satisfies FR-D.5 (Type, Tag, Points)
        selections.push({
          id: item.config.id,
          selection_time: Math.round(performance.now() - startTime),
          selection_position: { x: item.config.x, y: item.config.y },
          type: item.config.type, // FR-D.5
          tag: item.config.tag,   // FR-D.5
          points: points,
          image: item.config.image
        });

        // Scoring
        if (points !== 0) {
          currentScore += points;
          if (trial.point_counter_update_function) {
            trial.point_counter_update_function(points);
          }
          renderer.updateScoreDisplay(currentScore);
        }

        // End Condition
        if (trial.trial_ends_when_all_collected) {
          if (collectedCount >= totalCollectibles) {
            this.jsPsych.pluginAPI.setTimeout(() => endTrial(), 500);
          }
        }
      }
    };

    // 6. End Trial Logic
    let trialEnded = false;

    const endTrial = async () => {
      // Stop all physics animations (important for memory management)
      generatedElements.forEach(el => el.stopAnimation());

      // Check for Leaving Animation
      // Satisfies FR-P.5 (Patch Leaving Animation)
      if (trial.patch_leaving_animation) {
        await renderer.animateHide(); // Wait for 500ms animation
      }
      renderer.clear();

      /**
       * Simulates travel time between patches.
       * Satisfies FR-P.4 (Travel Time)
       */
      const travelTime = trial.travel_time || 0;

      if (travelTime > 0) {
        // Simple feedback for travel time
        display_element.innerHTML = `<div style="
          position: absolute; top: 50%; left: 50%; 
          transform: translate(-50%, -50%); font-size: 24px;">
          Traveling...
        </div>`;

        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.innerHTML = "";
          finish();
        }, travelTime);
      } else {
        finish();
      }
    };

    const finish = () => {
      const endTime = performance.now();

      // Satisfies FR-D.1 (Save Params like condition, timeout)
      // Satisfies FR-D.2 (Start/End Time)
      // Satisfies FR-D.7 (Final Points)
      const trialData = {
        patch_start_time: startTime,
        patch_end_time: endTime,
        duration: endTime - startTime,
        condition: trial.condition,
        timeout: trial.timeout,
        points: currentScore, // Requirement uses 'points'
        selections: selections // FR-D.3
      };

      this.jsPsych.finishTrial(trialData);
    };

    if (trial.timeout && trial.timeout > 0) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        endTrial();
      }, trial.timeout);
    }
  }
}

export default ForagingPatchPlugin;