// src/util/TimelineNodes.ts
import { Howl } from "howler";
import CallFunctionPlugin from "@jspsych/plugin-call-function";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
// import SurveyTextPlugin from "@jspsych/plugin-survey-text"; 
// import pbl from 'prompt-boxes'; // Disabled to avoid dependency issues

/**
 * Creates a loop that plays a tone and asks if the user heard it.
 */
export function getSoundCheckNode() {
  const sound_check_sound = {
    type: CallFunctionPlugin,
    func: function () {
      new Howl({ src: ["media/audio/sounds/tone2.mp3"] }).play();
    },
  };

  const sound_check_text = {
    type: HtmlButtonResponsePlugin,
    stimulus:
      "<b>Haben Sie einen Ton (deutlich) gehört?</b><br/> " +
      "Falls nein, überprüfen Sie ihre Sound-Einstellungen <br/>" +
      "(Lautsprecher/Kopfhörer angeschlossen? Ton aus? Lautstärke?) <br/>" +
      'und drücken Sie "Wiederholen". Sollten Sie das Problem nicht lösen können, <br/>' +
      "brechen Sie das Experiment bitte ab. ",
    choices: ["Wiederholen", "Ich habe den Ton gehört, weiter!"],
  };

  const loop_node = {
    timeline: [sound_check_sound, sound_check_text],
    loop_function: function (data: any) {
      // In v7, data.values() returns the array of data objects
      const lastTrial = data.values().slice(-1)[0]; 
      if (lastTrial.response === 0) { // 'Wiederholen' is index 0
        return true;
      } else {
        return false;
      }
    },
  };
  return loop_node;
}

/**
 * Toast notification prevention.
 * Refactored to standard alert for simplicity, or uncomment pbl if installed.
 */
export function getDoNotReloadToastNode() {
  const toast = {
    type: CallFunctionPlugin,
    func: function () {
      // Fallback if 'prompt-boxes' is not available
      console.warn('Bitte NICHT die Seite neu laden oder schließen!');
      
      /* // If you install 'prompt-boxes' via npm:
      const pb = new pbl({
        attrPrefix: 'pb',
        toasts: { direction: 'top', max: 5, allowClose: false }
      });
      pb.error('Bitte NICHT die Seite neu laden!', { duration: 0 });
      */
    }
  }
  return toast;
}

// NOTE: getSoundVerificationNode (Sound Verification 2) logic was commented out 
// in your original file or incomplete. I have omitted it here to ensure clean compilation.
// If you need it, it requires importing @jspsych/plugin-survey-text and fixing the logic 
// similar to getSoundCheckNode above.