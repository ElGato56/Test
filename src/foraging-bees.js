/**
 * @title foraging-bees
 * @description Experiment for Expra Foraging
 *
 *
 * @version 1.03-SONA
 *
 * @imageDir images/foraging-bees
 * @audioDir audio/sounds
 */
import "../styles/jspsych-foraging-patch.scss";
import "../styles/main.scss";
import "jspsych/plugins/jspsych-html-keyboard-response";
import "jspsych/plugins/jspsych-instructions";
import "jspsych/plugins/jspsych-html-button-response";
import "jspsych/plugins/jspsych-external-html";
import "jspsych/plugins/jspsych-call-function";
import "jspsych/plugins/jspsych-fullscreen";
import "jspsych/plugins/jspsych-survey-multi-choice";
import "jspsych/plugins/jspsych-survey-text";
import "jspsych/plugins/jspsych-html-slider-response";

import "./plugins/jspsych-foraging-patch";

import {getSoundCheckNode} from './util/JsPsychNodeLib';
import { JitteredGridCoordinates } from "./util/PositionGenerators";
import { Scaler } from "./util/Scaler";
import { tween, physics } from "popmotion";

let debug = false;


/**
 * Creates the experiment's jsPsych timeline.
 * Make sure to import every jsPsych plugin you use (at the top of this file).
 * @param {any} jatosStudyInput When served by JATOS, this is the object defined by the JATOS JSON
 * study input.
 */
export function createTimeline(jatosStudyInput = null) {
  if (typeof jatos  !== 'undefined') {
    var survey_code = jatos.urlQueryParameters['survey_code']
    var completion_url = jatosStudyInput['completion_url']
  }

  // Initialize jsPsych timeline
  let timeline = [];

  let point_counter = 0;
  let last_point_counter = 0;
  let last_time = 0;
  let last_eps = null;
  let last_last_eps = null;
  let start_time = null;

  // This part is related to keeping track of the points. We register these functions with the plugin and
  // the plugin calls them as the participant forages. However, this is going to change to a nicer solution at some point

  function update_point_counter(val) {
    point_counter += val;
  }
  function readout_point_counter() {
    return point_counter;
  }


  let max_targets = 200; // in every block
  let max_targets_block2 = 200;

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

  const flowers_bright = Array.from(Array(19).keys()).map(
    (x) => "flower-bright-" + (x + 1) + ".png"
  );
  const flowers_medium = Array.from(Array(19).keys()).map(
    (x) => "flower-medium-" + (x + 1) + ".png"
  );
  const flowers_dark = Array.from(Array(19).keys()).map(
    (x) => "flower-dark-" + (x + 1) + ".png"
  );
  const flowers_white = Array.from(Array(19).keys()).map(
    (x) => "flower-white-" + (x + 1) + ".png"
  );

  const all_flowers = flowers_bright.concat(flowers_medium, flowers_dark);

  const gras = Array.from(Array(13).keys()).map(
    (x) => "dis-" + (x + 1) + ".png"
  );

  const distractors = {
    type: "distractor",
    images: gras,
    amount: 75,
    positions: stim_positions,
    collectible: false,
    zIndex: -1000,
  };

  const targets = {
    type: "target",
    amount: 15,
    positions: stim_positions,
    collectible: true,
    trial_ends_when_all_collected: true,
    click_delay: 30,
    collectible_only_if_uncovered: true,
    cover_on_mouseleave: false,
    uncover_time: 1000,
    auto_cover_time: 2000,
    images: flowers_white,
    collected_images: flowers_white,
  };

  const targetplus_audiovisual = Object.assign(
    {},
    {
      mouseover_images: flowers_bright,
      uncover_sounds: ["tone1.mp3"],
      points: 3,
    },
    targets
  );
  const targetzero_audiovisual = Object.assign(
    {},
    {
      mouseover_images: flowers_medium,
      uncover_sounds: ["tone2.mp3"],
      points: 1,
    },
    targets
  );
  const targetminus_audiovisual = Object.assign(
    {},
    {
      mouseover_images: flowers_dark,
      uncover_sounds: ["tone3.mp3"],
      points: -1,
    },
    targets
  );

  const targetplus_visual = Object.assign(
    {},
    {
      mouseover_images: flowers_bright,
      uncover_sounds: ["tone1.mp3", "tone2.mp3", "tone3.mp3"],
      points: 3,
    },
    targets
  );
  const targetzero_visual = Object.assign(
    {},
    {
      mouseover_images: flowers_medium,
      uncover_sounds: ["tone1.mp3", "tone2.mp3", "tone3.mp3"],
      points: 1,
    },
    targets
  );
  const targetminus_visual = Object.assign(
    {},
    {
      mouseover_images: flowers_dark,
      uncover_sounds: ["tone1.mp3", "tone2.mp3", "tone3.mp3"],
      points: -1,
    },
    targets
  );

  const targetplus_auditory = Object.assign(
    {},
    { mouseover_images: all_flowers, uncover_sounds: ["tone1.mp3"], points: 3 },
    targets
  );
  const targetzero_auditory = Object.assign(
    {},
    { mouseover_images: all_flowers, uncover_sounds: ["tone2.mp3"], points: 1 },
    targets
  );
  const targetminus_auditory = Object.assign(
    {},
    {
      mouseover_images: all_flowers,
      uncover_sounds: ["tone3.mp3"],
      points: -1,
    },
    targets
  );

  // create all variations of patches
  let display_audiovisual = {
    elements: [
      targetminus_audiovisual,
      targetzero_audiovisual,
      targetplus_audiovisual,
      distractors,
    ],
  };
  let display_visual = {
    elements: [
      targetminus_visual,
      targetzero_visual,
      targetplus_visual,
      distractors,
    ],
  };
  let display_auditory = {
    elements: [
      targetminus_auditory,
      targetzero_auditory,
      targetplus_auditory,
      distractors,
    ],
  };

  let repetitions = 1000; // amount of patches in one block

  let expbreak = {
    type: "html-keyboard-response",
    stimulus: function () {
      var current_points = readout_point_counter();
      var current_time = performance.now();
      var collected_since_last_break = current_points - last_point_counter;
      var duration = current_time - last_time;
      var current_eps = Math.ceil(
        (collected_since_last_break / (duration / 1000)) * 60
      );
      last_point_counter = current_points;
      last_time = current_time;
      var stim =
        "<font size='+2'>" +
        "Supi! <br />" +
        "Du hast insgesamt " +
        current_points +
        " von " +
        "400" +
        " Punkten erreicht! <br />" +
        "Deine Sammelgeschwindigkeit ist " +
        current_eps +
        " Punkte pro Minute!<br /> <br />";
      if (last_eps != null) {
        stim +=
          "Im letzten Durchgang war sie " +
          last_eps +
          " Punkte pro Minute!<br /> <br />";
      }
      if (last_last_eps != null) {
        stim +=
          "Im vorletzten Durchgang war sie " +
          last_last_eps +
          " Punkte pro Minute!<br /> <br />";
      }
      stim +=
        "Schaffst Du es noch schneller zu werden? <br /><br />Weiter mit Tastendruck!";
      last_last_eps = last_eps;
      last_eps = current_eps;
      return stim;
    },
  };


  // Randomly assign participants to target condition visual or auditory
  let participants_condition = Math.random() > 0.5 ? 1 : 0; // can be zero or one

  let trials_block1 = [];
  for (let i = 0; i < repetitions; i++) {
    trials_block1.push(Object.assign({}, display_audiovisual, {condition : participants_condition + 'audiovisual'}));
  }

  // sort blocks to condition with 0 = visual and 1 = auditory
  const participant_zero = Object.assign({},display_visual,  {condition : '0-visual'});
  const participant_one = Object.assign({},display_auditory,  {condition : '1-audio'});

  const participant = [participant_zero, participant_one];

  let trials_block2 = [];
  for (let i = 0; i < repetitions; i++) {
    trials_block2.push(participant[participants_condition]);
  }

  //instructions
  //let img1 =
  var instructions = {
    type: "instructions",
    pages: [
      "<b>Willkommen und vielen Dank für Deine Teilnahme!</b><br/>" +
        "<b>Allgemeine Hinweise:</b><br/>" +
        "Durch Deine Teilnahme unterstützt Du Studierende des Fachbereichs Psychologie in Marburg.<br/> " +
        "Das Experiment dauert etwa 20 Minuten.<br/>" +
        "Bitte vermeide Unterbrechungen und sorge für ein angemessenes Arbeitsumfeld.<br/>" +
        "Bearbeite das Experiment alleine, in einem Durchgang am Stück und ohne dabei Musik zu hören. <br/>" +
        "Schalte bitte Deinen Ton an und stelle sicher, dass dieser gut hörbar ist (z. B. durch Kopfhörer). <br /> " +
        "Es folgt gleich ein kurzer Soundcheck!<br/> " +
        "Geeignete Geräte sind Laptop oder PC. Bitte verwende kein Tablet oder Computer mit Touchscreen. <br />" +
        "Falls Schwierigkeiten bei Verwendung eines Laptop-Touchpads auftreten,<br /> " +
        "schließe bitte eine Maus an.",
    ],
    show_clickable_nav: true,
    button_label_previous: "return",
    button_label_next: "next",
  };

  var sound_check = getSoundCheckNode();
  

  var instructions2 = {
    type: "instructions",
    pages: [
      "<b>Deine Mission:</b><br />" +
        "<image src='media/images/test-shapes/bee100.gif'><br /> " +
        "Liebe Biene, heute hast Du eine sehr wichtige Mission...Pollen zu sammeln! ",

      "<b>Viele schöne Blumen:</b><br />" +
        "<image src='media/images/test-shapes/bee-patch.jpg'><br /> " +
        "In einem Garten findest Du viele Blumen, die Qualität des Pollens ist jedoch nicht immer gleich. ",

      "<b>Nicht alles ist gut ...</b><br />" +
        "<image src='media/images/test-shapes/bee-patch.jpg'><br /> " +
        "Wenn Du Pollen von einer Blume sammelst, bekommst Du Punkte. <br />" +
        "Es gibt aber auch ein paar Blumen mit schlechtem Pollen. Bei denen gibt es Punktabzug!",

      "<b>Wie geht das?</b><br />" +
        "<image src='media/images/test-shapes/bee-flower-example.jpg'><br /> " +
        "Um von einer Blume zu sammeln, musst Du hin fliegen (mit der Maus) und 1 Sekunde über der Blume schweben. <br />" +
        "Dann färbt sich die Blume für etwa zwei Sekunden und ein Ton erklingt.<br >" +
        "Während dieser Zeit kannst Du die Blume anklicken, um die Punkte zu erhalten. <br >" +
        "Wenn Du von einer Blume gesammelt hast, ist sie 'leer' und kann danach nicht mehr abgesammelt werden.",

      "<b>Und dann?</b><br />" +
        "<image src='media/images/test-shapes/bee-patch-next.jpg'><br /> " +
        "Du kannst jederzeit zur nächsten Wiese fliegen (auf 'Weiter' klicken)! <br />" +
        "Du sollst so schnell wie möglich " + (max_targets + max_targets_block2) + " Punkte ersammeln --- dann ist das Experiment vorbei und Deine Mission erfüllt.",

      "<b>Auf ein Neues!</b><br />" +
        "<image src='media/images/test-shapes/bee-patch.jpg'><br /> " +
        "Wenn Du in eine neue Wiese fliegst, sind alle Blumen wieder voll! <br />" +
        "Wenn es also auf einer Wiese zu mühsam wird: Schnell weiter, keine Zeit verlieren!",

      "<b>Und nun los!</b><br />" +
        "Denke daran: Sei so schnell wie möglich! <br />",
    ],
    show_clickable_nav: true,
    button_label_previous: "return",
    button_label_next: "next",
  };

  // This will create the actual patches of the experiment:
  let patch = {
    type: "foraging-patch", // Tells jsPsych to use our foraging pluging
    backgrounds: [
      "bg1.jpg",
      "bg2.jpg",
      "bg3.jpg",
      "bg4.jpg",
      "bg5.jpg",
      "bg6.jpg",
      "bg7.jpg",
      "bg8.jpg",
    ],
    background_color: "#E1E1E1", // RGB 225, 225, 225 in hex
    mousepointer_image: ["bee50l.gif", "bee50r.gif"],
    audio_path: "media/audio/sounds/",
    images_path: "media/images/test-shapes/", // path to image folder
    patch_size: [1920, 1080], // in vitual pixels
    elements: jsPsych.timelineVariable("elements"), // Use element lists from the trial list
    condition: jsPsych.timelineVariable("condition"),
    travel_time: 1000,
    patch_leaving_animation: tween({
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 1000,
    }),
    point_counter_update_function: update_point_counter,
    point_counter_read_out_function: readout_point_counter,
    points_display_html:
      "<div style='top:20px; left: 15px'id='points-display-html' class='points-display'><font size=+4 face='Arial' color='black' > <b>Punkte: %%</b> </font></div>",
    point_indicator:
      "<div id='point-indicator-html' class='point-indicator'><font size=+4 face='Comic Sans MS' color='#0000AA'>%%</font></div>",
    point_animation: physics({
      from: { opacity: 1, y: -60 },
      to: { opacity: 0 },
      velocity: { y: -120, opacity: -1 },
    }),
    next_patch_click_html:
      "<div style='top:20px; left: 1755px' id='next-patch-click-html' class='next-click'><font size=+4 face='Arial' color='black' > <b>Weiter</b>  </font></div>",

    // This is required to scale the display to fit the (unknown) screen size
    on_load: () => {
      new Scaler(
        document.getElementById("jspsych-foraging-container"),
        1920,
        1080,
        0
      );
    },
    on_finish: function () {
      // TODO: experiment ends but feedback text is not shown; edit: is shown via Jatos server but only for a short time
      if (readout_point_counter() >= max_targets) {
        max_targets = max_targets + max_targets_block2;
        jsPsych.endCurrentTimeline();
      }
    },
  };

  let fullscreen = {
    type: "fullscreen",
    message: "Der Versuch geht jetzt in den Vollbildmodus! <br />",
    button_label: 'Weiter', 
    fullscreen_mode: true,
  }

  timeline.push(instructions);
  timeline.push(sound_check);
    // Switch to fullscreen
  timeline.push(fullscreen);
  timeline.push(instructions2);

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
    timeline: [patch, patch, expbreak],
    timeline_variables: trials_block1,
  });

  timeline.push({
    timeline: [patch, patch, expbreak],
    timeline_variables: trials_block2,
  });

  timeline.push({
    type: "html-keyboard-response",
    duration: function () {
      Math.floor((performance.now() - start_time) / 1000 / 60);
    },
    stimulus: function () {
      return (
        "Super! Du hast " +
        readout_point_counter() +
        " Punkte in " +
        Math.floor((performance.now() - start_time) / 1000 / 60) +
        " Minuten gefunden! <br ><br >" +
        " Der Hauptversuch ist zu Ende! <br >" +
        " Jetzt folgen noch vier kurze Fragen. <br >" +
        " Selbst wenn Du diese nicht beantworten möchtest, schicke bitte leere bzw. zufällige Antworten ab. <br >" +
        " Nur dann wird das Ergebnis des ganzen Versuchs korrekt gespeichert.    <br ><br >" +
        " Weiter zu den Fragen mit beliebiger Taste"
      );
    },
  });

  timeline.push({
    type: "survey-text",
    questions: [
      {
        prompt:
          "Ist Dir während des Versuchs etwas aufgefallen? Wenn ja, bitte kurz beschreiben:",
        rows: 5,
        columns: 40,
      },
    ],
    response_ends_trial: true,
  });

  let yesno = ["Ja", "Nein"];

  timeline.push({
    type: "survey-multi-choice",
    questions: [
      {
        prompt:
          "Hast Du bemerkt, dass die Farben und Töne mit den Punkten in Verbindung standen?",
        name: "colorstones",
        options: yesno,
        required: true,
      },
    ],
    response_ends_trial: true,
  });

  timeline.push({
    type: "html-slider-response",
    labels: ["Am Anfang", "Am Ende"],
    stimulus: "Zeitpunkt im Experiment",
    prompt:
      "Falls Du in der vorherigen Frage 'ja' geantwortet hast: <br />" +
      "Gib mit diesem Slider an, wann ungefähr es Dir aufgefallen ist. <br />" +
      "Wenn Du es nicht bemerkt hast, lass den Slider unverändert!<br />",
    response_ends_trial: true,
    min: 0,
    max: 100,
    start: 0,
  });

  let yesyesno = [
    "Ja, die Zuordnung der Töne zu den Punkten hat irgendwann nicht mehr gestimmt",
    "Ja, die Zuordnung der Farben zu den Punkten hat irgendwann nicht mehr gestimmt",
    "Nein, mir ist nichts dergleichen aufgefallen!",
  ];

  timeline.push({
    type: "survey-multi-choice",
    questions: [
      {
        prompt:
          "Hast Du bemerkt, dass die Zuordnung der Puntke sich irgendwann verändert hat?",
        name: "change",
        options: yesyesno,
        required: true,
      },
    ],
    response_ends_trial: true,
  });

  timeline.push({
    type: "html-keyboard-response",
    stimulus:
      "Vielen Dank für Deine Teilnahme! </br></br>" +
      "Der Versuch ist nun beendet! Warte 10 Sek oder drücke eine Taste. <br /><br />" +
      "Schließe dieses Browserfenster/Tab nicht. Du wirst zu SONA weitergeleitet.  Vielen Dank!",
    trial_duration: 10000,
    on_finish: function(){
      let data = jsPsych.data.get()
      console.error(data.json())
      jatos.endStudyAndRedirect(completion_url + '&survey_code=' + survey_code, data.json())
    }
  });

  return timeline;
}

export function getPreloadImagePaths() {
  return [];
}
