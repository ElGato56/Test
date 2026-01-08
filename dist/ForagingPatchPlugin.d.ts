import { JsPsych, JsPsychPlugin, TrialType, ParameterType } from "jspsych";
/**
 * Plugin Configuration
 * Refactored from 'jspsych-foraging-patch-info.js'
 */
declare const info: {
    readonly name: "foraging-patch";
    readonly parameters: {
        readonly patch_size: {
            readonly type: ParameterType.INT;
            readonly default: readonly [800, 600];
            readonly array: true;
            readonly description: "Width and height of the patch container.";
        };
        readonly background: {
            readonly type: ParameterType.COMPLEX;
            readonly default: "#f0f0f0";
            readonly description: "Background image, color, or array of options.";
        };
        readonly elements: {
            readonly type: ParameterType.COMPLEX;
            readonly array: true;
            readonly default: readonly [];
            readonly description: "List of objects defining the items on the patch.";
        };
        readonly images_path: {
            readonly type: ParameterType.STRING;
            readonly default: "";
            readonly description: "Base path for images.";
        };
        readonly audio_path: {
            readonly type: ParameterType.STRING;
            readonly default: "";
            readonly description: "Base path for audio files.";
        };
        readonly travel_time: {
            readonly type: ParameterType.INT;
            readonly default: 0;
            readonly description: "Duration (ms) to wait after patch completion.";
        };
        readonly patch_leaving_animation: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
            readonly description: "If true, plays a fade-out animation when the patch is finished.";
        };
        readonly timeout: {
            readonly type: ParameterType.INT;
            readonly default: null;
            readonly description: "Time in ms before trial ends automatically.";
        };
        readonly next_patch_click_html: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: null;
            readonly description: "HTML for a button to end the trial manually.";
        };
        readonly trial_ends_when_all_collected: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
            readonly description: "If true, trial ends when all collectible items are found.";
        };
        readonly point_counter_update_function: {
            readonly type: ParameterType.FUNCTION;
            readonly default: null;
            readonly description: "Function to call when points change.";
        };
        readonly point_counter_read_out_function: {
            readonly type: ParameterType.FUNCTION;
            readonly default: null;
            readonly description: "Function to get current total score at start of trial.";
        };
        readonly points_display_html: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<div style='font-size:20px; font-weight:bold;'>Points: <span id='jspsych-foraging-score-value'>0</span></div>";
            readonly description: "HTML template for score display.";
        };
        readonly condition: {
            readonly type: ParameterType.STRING;
            readonly default: "";
            readonly description: "Experimental condition label to be saved in data.";
        };
    };
};
type Info = typeof info;
declare class ForagingPatchPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "foraging-patch";
        readonly parameters: {
            readonly patch_size: {
                readonly type: ParameterType.INT;
                readonly default: readonly [800, 600];
                readonly array: true;
                readonly description: "Width and height of the patch container.";
            };
            readonly background: {
                readonly type: ParameterType.COMPLEX;
                readonly default: "#f0f0f0";
                readonly description: "Background image, color, or array of options.";
            };
            readonly elements: {
                readonly type: ParameterType.COMPLEX;
                readonly array: true;
                readonly default: readonly [];
                readonly description: "List of objects defining the items on the patch.";
            };
            readonly images_path: {
                readonly type: ParameterType.STRING;
                readonly default: "";
                readonly description: "Base path for images.";
            };
            readonly audio_path: {
                readonly type: ParameterType.STRING;
                readonly default: "";
                readonly description: "Base path for audio files.";
            };
            readonly travel_time: {
                readonly type: ParameterType.INT;
                readonly default: 0;
                readonly description: "Duration (ms) to wait after patch completion.";
            };
            readonly patch_leaving_animation: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
                readonly description: "If true, plays a fade-out animation when the patch is finished.";
            };
            readonly timeout: {
                readonly type: ParameterType.INT;
                readonly default: null;
                readonly description: "Time in ms before trial ends automatically.";
            };
            readonly next_patch_click_html: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: null;
                readonly description: "HTML for a button to end the trial manually.";
            };
            readonly trial_ends_when_all_collected: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
                readonly description: "If true, trial ends when all collectible items are found.";
            };
            readonly point_counter_update_function: {
                readonly type: ParameterType.FUNCTION;
                readonly default: null;
                readonly description: "Function to call when points change.";
            };
            readonly point_counter_read_out_function: {
                readonly type: ParameterType.FUNCTION;
                readonly default: null;
                readonly description: "Function to get current total score at start of trial.";
            };
            readonly points_display_html: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<div style='font-size:20px; font-weight:bold;'>Points: <span id='jspsych-foraging-score-value'>0</span></div>";
                readonly description: "HTML template for score display.";
            };
            readonly condition: {
                readonly type: ParameterType.STRING;
                readonly default: "";
                readonly description: "Experimental condition label to be saved in data.";
            };
        };
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}
export default ForagingPatchPlugin;
