export function getForagingPatchPluginInfo() {
return {
    name: "foraging-patch",
    parameters: {
      patch_leaving_animation: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Patch leaving animation",
        default: null,
        description:
          "Popmotion animation witch is played, when the TS leave the patch",
      },
      timeout: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Timeout",
        default: false,
        description:
          "If attribute is set it defines duration of timeout (duration of patch) in ms otherwise no timeout is used.",
      },
      elements: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Elements in patch",
        default: null,
        description:
          "List of elements objects",
      },
      continue_on_keypress: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Continue on keypress",
        default: null,
        description:
          "A list of keys that terminate the trial",
      },
      points_display_html: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Point display HTML code",
        default: null,
        description: "Displays number of points collected so far",
      },
      condition: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Condition",
        default: null,
        description:
          "Condition name",
      },
      block: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Condition",
        default: 0,
        description: "block number",
      },
      point_counter_read_out_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: "Point counter read out",
        default: null,
        description: "Reads out point count",
      },
      point_counter_update_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: "Point counter update",
        default: null,
        description: "Updates point count",
      },
      on_collection_finish: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: "Function called after element was collected",
        default: null,
        description: "Function that is called when an element is collected. E.g., van be used to reset its position.",
      },
      on_time_passed: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Function called after a certain time hast.",
        default: null,
        description: "Function called after a certain time hast. Pass a list of tuples with time in milliseconds and the function",
      },
      travel_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Travel time",
        default: "1000",
        description: "Time participant needs to wait to get to next patch",
      },
      next_patch_click_html: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Button for next patch",
        default: null,
        description: "Button participant clicks to get to next patch",
      },
      point_animation: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Animation of point counter",
        default: null,
        description: "Animation of point counter",
      },
      point_indicator: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Indicator of scored points",
        default: "",
        description: "Appears next to collected item and indicates how much points this item was worth",
      },
      indicate_points: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Settings of point_indicator",
        default: "both",
        description: "Defines whether positive, negative or both points are indicated.",
      },
      next_when_empty: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Next when empty",
        default: "",
        description: "Array of type names. Move to the next patch when the lists with these types are empty.",
      },
      backgrounds: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Backgrounds",
        default: "",
        description: "Sets background image",
      },
      travel_backgrounds: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Travel backgrounds",
        default: "",
        description: "Background shown when traveling",
      },
      patch_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Patch size",
        default: "1920, 1080",
        description: "Defines size of patch",
      },
      images_path: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Path for images",
        default: "",
        description: "Sets path to image folder",
      },
      condition: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Condition identifier",
        default: "Condition 1",
        description: "String that identifies the condition",
      },
      state_cycle: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "State Cycle",
        default: null,
        description: "Todo",
      },
      tag: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Additional tag",
        default: "",
        description: "String or object to tag trials",
      },
      crosshair_speed_factor: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Speed of the crosshair",
        default: 20,
        description: "Determines how quickly the crosshair follows the mouspointer",
      },
      crosshair: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: "Crosshair image file name",
        default: null,
        description: "Filename of the image to be used as a crosshair",
      },
      mouse_starts_trial: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Mouse target to start the trial",
        default: null,
        description: "Trial starts only once the mouse is over the target",
      },
    },
  };
}