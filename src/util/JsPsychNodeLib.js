import "jspsych/plugins/jspsych-call-function";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-survey-multi-choice";
import "jspsych/plugins/jspsych-survey-text";
import "jspsych/plugins/jspsych-html-slider-response";
const pbl = require('prompt-boxes');

export function getSoundCheckNode() { 
   const sound_check_sound = {
    type: "call-function",
    func: function () {
      new Howl({ src: "media/audio/sounds/tone2.mp3" }).play();
    },
   };

  const sound_check_text = {
    type: "html-button-response",
    stimulus:
      "<b>Haben Sie einen Ton (deutlich) gehört?</b><br/> " +
      "Falls nein, überprüfen Sie ihre Sound-Einstellungen <br/>" +
      "(Lautsprecher/Kopfhörer angeschlossen? Ton aus? Lautstärke?) <br/>" +
      'und drücken Sie "Wiederholen". Sollten Sie das Problem nicht lösen können, <br/>' +
      "brechen Sie das Experiment bitte ab. ",
    choices: ["Wiederholen", "Ich habe den Ton gehört, weiter!"],
  };

  var loop_node = {
    timeline: [sound_check_sound, sound_check_text],
    loop_function: function (data) {
      const data_array = data.values();
      const len = data_array.length;
      if (0 == data_array[len - 1].button_pressed) {
        return true;
      } else {
        return false;
      }
    },
  };
  return loop_node
}

export function getDoNotReloadToastNode() {
  const toast = {
    type: "call-function",
    func: function () {
      const pb = new pbl({
        attrPrefix: 'pb',
        toasts: {
          direction: 'top',       
          max: 5,                
          allowClose: false,      
        }
      });
      pb.error('Bitte NICHT die Seite neu laden oder schließen. Sie werden zu Prolific weitergeleitet, sobald die Daten übertragen sind!',
      { duration: 0,});
    }
  }
  return toast
}




/** SOUND VERIFICATION 1 

export function getSoundVerificationNode() { 
  var sound_verification_sound = {
    type: 'call-function',
    func: function () {
      var list_testwords = ['klirr','click','chirp'];
      var current_testword = jsPsych.randomization.sampleWithoutReplacement(list_testwords, 1)
      new Howl({ src: "media/audio/sounds/'+current_testword+'.mp3" }).play();
    console.log('The current testword is '+current_testword);
    }
   }
  }


  var sound_verification_response = {
    type: 'survey-text',
    questions: [
      {prompt: "Welches Wort haben Sie gehört? Tippen Sie es in das Textfeld ein:"}
    ],
    on_finish: function(data){
      if(jsPsych.data.getDataByTimelineNode.toUpperCase(sound_verification_response) === current_testword.toUpperCase()){
      /** oder: jsPsych.data.get().last(1).toUpperCase === current_testword.toUpperCase(); 
        data.correct = true;
      } else {
        data.correct = false;
      }
    }
  }

  var number_false = jsPsych.data.get().filter({trial_type:'survey-text',correct:false}).count();
    console.log('Number of false answers: '+number_false);


  var feedback = {
    type: 'html-keyboard-response',
    stimulus: function(){
      if(data.correct = true) {
        return "<p>Der Ton scheint zu funktionieren! Dann geht es jetzt weiter mit dem Experiment.</p>";
      } else if (number_false < 5 && data.correct == true) {
        return "<p>Die Eingabe entsprach nicht dem abgespielten Wort. Bitte versuchen Sie es erneut.</p>";
      } else {
        return "<p>Der Ton scheint nicht zu funktionieren! Das Experiment wird beendet.</p>"
      }
    }
  }
  
  var loop_node = {
    timeline: [sound_verification_sound, sound_verification_response, number_false, feedback],
    loop_function: function (data) {
      if (data.correct == true) {
        /** oder: (jsPsych.data.getDataByTimelineNode.toUpperCase(sound_verification_response) === current_testword.toUpperCase())   
        return false;
      } else if (number_false < 5 && data.correct == true) {
        return true;
      } else {  
        jatos.endStudy(); /** funktioniert das? 
      }
    }
  }  */





/* SOUND VERIFICATION 2 */

export function getSoundVerificationNode() { 
  var sound_verification_sound = {
    type: 'call-function',
    func: function () {
      var list_testwords = ['klirr','click','chirp'];
      var current_testword = jsPsych.randomization.sampleWithoutReplacement(list_testwords, 1)
      new Howl({ src: "media/audio/sounds/'+current_testword+'.mp3" }).play();
    console.log('The current testword is '+current_testword);
    },
   };
  };


  
//   var number_false = 0
//   var sound_verification_response = {
//     type: 'survey-text',
//     questions: [
//       {prompt: "Welches Wort haben Sie gehört? Tippen Sie es in das Textfeld ein:"}
//     ],
//     on_finish: function(data){
//       if(jsPsych.data.getDataByTimelineNode.toUpperCase(sound_verification_response) === current_testword.toUpperCase()){
//       /** oder: jsPsych.data.get().last(1).toUpperCase === current_testword.toUpperCase();   */
//         data.correct == true;
//       } else {
//         data.correct == false;
//       }
//       if(data.correct == false) {
//         number_false++;
//         /**console.log('Number of false answers: '+number_false);*/
//       }

//     }
//   }

//   var feedback = {
//     type: 'html-keyboard-response',
//     stimulus: function(){
//       var all_data = jsPsych.data.get()
//       var data = all_data[all_data.length - 1]
//       if(data.correct == true) {
//         return "<p>Der Ton scheint zu funktionieren! Dann geht es jetzt weiter mit dem Experiment.</p>";
//       } else if (number_false < 5 && data.correct == true) {
//         return "<p>Die Eingabe entsprach nicht dem abgespielten Wort. Bitte versuchen Sie es erneut.</p>";
//       } else {
//         return "<p>Der Ton scheint nicht zu funktionieren! Das Experiment wird beendet.</p>"
//       }
//     }
//   };
  
//   var loop_node = {
//     timeline: [sound_verification_sound, sound_verification_response, number_false, feedback],
//     loop_function: function (data) {
//       var all_data = jsPsych.data.get()
//       var data = all_data[all_data.length - 1]
//       if (data.correct == true) {
//         /** oder: (jsPsych.data.getDataByTimelineNode.toUpperCase(sound_verification_response) === current_testword.toUpperCase()) */  
//         return false;
//       } else if (number_false < 5 && data.correct == true) {
//         return true;
//       } else {  
//         jatos.endStudy(); /** funktioniert das?   */
//       }
//     },
//   };
//   return loop_node
// }

