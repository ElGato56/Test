/**
 * A jsPsych plugin for foraging tasks
 *
 * @author jeti
 * @version 0.0.2
 * @license MIT
 * 
 */

"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import delay from "delay";
import { setAbsolutePosition, getAudioXPosition, getAudioYPosition} from "../util/Positioning";
import { getForagingPatchPluginInfo } from "./jspsych-foraging-patch-info";
import { pathJoin, attach, attach_html, getAngle } from "../util/Helpers";
import { tween, styler, physics } from "popmotion";
import clonedeep from "lodash.clonedeep";
import has from "lodash.has";
import { Howl } from "howler";
const fclone = require('fclone');



export class ForagingPatchPlugin {
  info =  getForagingPatchPluginInfo();
  
  constructor() {
    this.resetContainer();
  }

  resetContainer() {
    this.container = document.createElement("div");
    this.container.id = "jspsych-foraging-container";
    this.wrapper = document.createElement("div");
    this.wrapper.id = "jspsych-foraging-wrapper";
    this.wrapper.append(this.container);
  }

  /**
   * Appends a child to the plugin's container element
   *
   * @param {Element} element
   */
  appendElement(element) {
    this.container.appendChild(element);
  }
  
  updatePoints(points, template) {
    var el = document.getElementById("points-display-html");
    el.style.pointerEvents = 'none';
    el.outerHTML = template.replace("%%", points);
  }

  cover(DOM_img) {
    if (DOM_img.state == "uncollected") {
      DOM_img.src = DOM_img.covered_image;
      DOM_img.mouseover_state = 'covered';
      if (DOM_img.uncover_sound) { //hinzugefügt wegen loop
        DOM_img.uncover_sound.stop()
      }
    }
  }
  uncover(DOM_img) {
    if (DOM_img.state == "uncollected" && DOM_img.mouseover_state == 'covered') {
      DOM_img.src = DOM_img.mouseover_image;
      DOM_img.mouseover_state = 'uncovered';
      if (DOM_img.uncover_sound) {
        DOM_img.uncover_sound.play()
      }
    }
  }
  


  //uthis.mouseover_sound.play() 


  /**
   * This function returns a DOM objects x and y coordinates after applying
   * translations that may have been set by animations.
   * It also adjusts the position to be the object's center and not its 
   * upper left corner.
   *    *
   * @param {Element} stim_DOM_element
   */
  getActualPosition(stim_DOM_element) {
    const el = document.getElementById(stim_DOM_element);
    const transformStyle = el.style.transform;
    var transform = [0, 0, 0];
    if (transformStyle) { //  & transformStyle != 'none'
      transform = transformStyle.match(/[+-]?\d+(\.\d+)?/g).map(Number);
    }
    let w = el.width;
    let h = el.height;
    return [+ el.offsetLeft + transform[0] + w / 2, + el.offsetTop + transform[1] + h / 2];
  }

  //TODO: Is this needed for anything?
  updateCylceImage(elements) {
     //console.error(elements)
  }

  async trial(display_element, trial) {

    // As a very first thing, print the debug string if there is one:
    if(trial.debug_msg) {
      console.log('%c FORAGING PATCH PLUGIN DEBUG: ' + trial.debug_msg,'background: #222; color: #bada55')
    }

    // Clear the screen
    display_element.innerHTML = "";
    this.resetContainer();
    //this.container.style.cursor = 'none';
    this.container.style.width = trial.patch_size[0] + "px";
    this.container.style.minWidth = trial.patch_size[0] + "px";
    this.container.style.height = trial.patch_size[1] + "px";
    if (trial.patch_size[0] == 0 || trial.patch_size[1] == 0) {
      this.container.style.overflow = "visible";
    } else {
      this.container.style.overflow = "hidden";
    }
    this.container.oncontextmenu = function () {
      return false;
    };
    
    this.container.onmousemove = function(e) {
      let x = getAudioXPosition(e,this)
      let y = getAudioYPosition(e,this)
      //console.log(x + '//' +y)
        if (Math.abs(x)>0.95 | y>0.95 | y<0.25) {
          if (!trial.border_sound.playing()) {
            trial.border_sound.play()
          }
        } else {
          trial.border_sound.stop()
        }
      if (trial.border_sound) {
        trial.border_sound.stereo(x)
        trial.border_sound.volume(y)
      }
      
    }

    // Append the wrapper element which contains `this.container`
    display_element.appendChild(this.wrapper);


    // Patch specific:

    if (trial.backgrounds) {
      var background =
        trial.backgrounds[Math.floor(Math.random() * trial.backgrounds.length)];
      this.container.style.backgroundImage =
        "url('" + pathJoin([trial.images_path, background]) + "')";
    }
    attach(trial.background_color, this.container.style, 'backgroundColor')
    

        
    if (trial.mouse_starts_trial) {
      const mouse_target = document.createElement("img");
      this.container.appendChild(mouse_target);
      mouse_target.style.position = "absolute";
      mouse_target.ondragstart = () => false;
      mouse_target.ondrop = () => false;
      mouse_target.draggable = false;
      setAbsolutePosition(mouse_target, 0, 0);
      mouse_target.src =  pathJoin([trial.images_path, trial.mouse_starts_trial.image])
      let mouse_start = new Promise((resolve, reject) => {mouse_target.addEventListener("mouseover", () => {
        mouse_target.style.visibility = 'hidden';
        setTimeout(resolve,trial.mouse_starts_trial.delay)}
        );},
        { once: true }
      )
      await mouse_start
    }
    if (trial.key_sound_file) {
      trial.key_sound  = new Howl({
        src: [
          pathJoin([trial.audio_path, trial.key_sound_file])
        ]})
    }

    if (trial.border_sound_file) {
      trial.border_sound  = new Howl({
        src: [
          pathJoin([trial.audio_path, trial.border_sound_file])
        ]})
     }

    // Create sounds that are played after the respective
    // timeour occred:
    if (trial.sound_events) {
      for (var i = 0; i < trial.sound_events.length; i++) {
        let sound = new Howl({
          src: [
            pathJoin([trial.audio_path, trial.sound_events[i].sound])
          ]})
        //sound.volume(0.5);
        setTimeout(function(){sound.play()}, trial.sound_events[i].time) 
      }     
    }

    if (trial.on_time_passed) {
      for (var i=0; i<trial.on_time_passed.length; i++){
          // Register all timeouts
          setTimeout(trial.on_time_passed[i][1], trial.on_time_passed[i][0])
      }
    }

    this.elements_to_be_watched = [];
    this.cycled_elements = [];
    this.points_display_html_template = trial.points_display_html;
    this.point_indicator = trial.point_indicator;
    this.indicate_points = trial.indicate_points;

    attach_html(trial.next_patch_click_html, this.container,this) 
    attach_html(trial.points_display_html, this.container, this) 

    
    attach(trial.virtual_boundary, this, 'virtual_boundary', undefined, 0)
    attach(trial.reset_point_counter_on_patch_start, this, 'reset_point_counter_on_patch_start', undefined, false)
    attach(trial.continue_on_keypress, this, 'continue_on_keypress', undefined, false)

    
    if (this.reset_point_counter_on_patch_start) {
      // This is a bit weird: We read out the current state from the client experiment ...
      // ... and subtract it to reach zero. Point system needs to be reworked anyway
      // TODO: resetting points could be default behaviour is no functiona are set
      trial.point_counter_update_function(-trial.point_counter_read_out_function())
    }
    
    attach(trial.crosshair, this.container, 'crosshair', undefined)
    attach(trial.crosshair_speed_factor, this.container, 'crosshair_speed_factor', undefined, 20)
     
    this.crosshair_active = false;

    this.active = true;
 
  

    let mouseX = trial.patch_size[0] / 2
    let mouseY =  trial.patch_size[1] / 2
    this.container.mouseAtGoal = false
    obj = this
    if (this.container.crosshair) {
      this.container.onmousemove = function (e) {
        if (obj.container != e.target) {
          mouseX =  e.offsetX + e.target.offsetLeft;
          mouseY =  e.offsetY + e.target.offsetTop;
        }
        else {
         mouseX = e.offsetX;
         mouseY =  e.offsetY;
        }
      }
      var ch_img = document.createElement("img");
      this.container.appendChild(ch_img);
      ch_img.id = 'Crosshair';
      ch_img.style.position = 'absolute'
      ch_img.style.zIndex = 99999999999
      
      ch_img.src =  pathJoin([trial.images_path, this.container.crosshair])
    
      ch_img.style.left = (trial.patch_size[0] / 2 - ch_img.width / 2 ) + 'px'
      ch_img.style.top = (trial.patch_size[1] / 2 - ch_img.height / 2)+ 'px'
      ch_img.onmouseenter = function(){
        obj.crosshair_active = true
        this.style.pointerEvents = "none";
      }

      setInterval(function(){
        if (obj.crosshair_active) { 
          let current_pos_x = parseInt(ch_img.style.left.replace('px', ''), 10)
          let current_pos_y = parseInt(ch_img.style.top.replace('px', ''), 10)
          let xdist = current_pos_x + ch_img.width / 2 - mouseX
          let ydist = current_pos_y + ch_img.height / 2 - mouseY
          let a2 = xdist*xdist
          let b2 = ydist*ydist
          let distance = Math.sqrt(a2+b2)

          let speed = 0;
          if (distance > obj.container.crosshair_speed_factor*1.5) {
            speed  = obj.container.crosshair_speed_factor
          }
          else {
            speed = Math.sqrt(a2+b2)
          }
      
          obj.container.mouseAtGoal = true
          if (mouseX < current_pos_x - 20 + ch_img.width / 2){
            ch_img.style.left = current_pos_x - speed * Math.cos(getAngle(xdist,ydist)) + 'px'
            obj.container.mouseAtGoal = false
          }
          if (mouseY < current_pos_y - 20 + ch_img.height / 2){
            ch_img.style.top = current_pos_y - speed * Math.sin(getAngle(xdist,ydist)) + 'px'
            obj.container.mouseAtGoal = false
          }
          if (mouseX > current_pos_x + 20 + ch_img.width / 2){
            ch_img.style.left = current_pos_x + speed * -Math.cos(getAngle(xdist,ydist)) + 'px'
            obj.container.mouseAtGoal = false
          }
          if (mouseY > current_pos_y + 20 + ch_img.height / 2){
            ch_img.style.top = current_pos_y + speed  * -Math.sin(getAngle(xdist,ydist)) + 'px'
            obj.container.mouseAtGoal = false
          }
        }              
      }, 50);
      
    }

    attach(trial.mousepointer_image, this.container, 'mousepointer_image', undefined)
    if (this.container.mousepointer_image) {
      var mp_img = document.createElement("img");
      this.container.appendChild(mp_img);
      mp_img.id = 'Mousepointer';
      mp_img.style.position = 'absolute'
      mp_img.style.zIndex = 99999999999
      mp_img.src =  pathJoin([trial.images_path, this.container.mousepointer_image[0]])
      obj.old_mouse_x = 
      this.container.onmousemove = function (e) {
        let mouseX = 0;
        let mouseY = 0;
        if (obj.container != e.target) {
          mouseX =  e.offsetX + e.target.offsetLeft;
          mouseY =  e.offsetY + e.target.offsetTop;
        }
        else {
          mouseX = e.offsetX;
          mouseY =  e.offsetY;
        }
        mp_img.src =  pathJoin([trial.images_path, obj.container.mousepointer_image[+(mouseX > obj.old_mouse_x)]])
        

        mp_img.style.left = mouseX - mp_img.width / 2 +  'px'; // TODO: these values should't be hardcoded
        mp_img.style.top = mouseY - mp_img.height - 5 -10 + 'px';
        obj.old_mouse_x = mouseX;
        } 
      
    }

    
    attach(trial.mousepointer_image, this.container, 'mousepointer_image')
    

    if (this.points_display_html_template) {
      this.points = trial.point_counter_read_out_function();
      this.updatePoints(this.points, this.points_display_html_template);
    }

    this.selections = [];
    this.mouseovers = [];
    let stim_id = 0;
    let pi_id = 0;
    let ends_when_all_collected = [];
    let ends_when_one_collected = [];

    let display = []

    // Element specific :
    this.container.style.visibility = 'hidden'
    for (var e = 0; e < trial.elements.length; e++) {


      let elements = trial.elements[e];
      let obj = this;
      if (has(elements, 'position_seek')) {
        elements.positions.i = elements.position_seek
      }
      
      for (var i = 0; i < elements.amount; i++) {
        var DOM_img = document.createElement("img");
        
        this.container.appendChild(DOM_img);
        DOM_img.id = "Stim_" + stim_id;
        DOM_img.style.position = "absolute";
        DOM_img.ondragstart = () => false;
        DOM_img.ondrop = () => false;
        DOM_img.draggable = false;
        DOM_img.type = elements.type;
        DOM_img.tag = elements.tag;
        if (elements.ensure_all_images) {
          DOM_img.image_index = i % elements.images.length;
        }
        else {
          DOM_img.image_index = Math.floor(Math.random() * elements.images.length);
        }

        if (has(elements, 'scale')) {
          console.error("'scale' is deprecated. Rescale stimuli before loading.")
          //DOM_img.style.scale = elements.scale
          //DOM_img.style.webkitTransform = "scale("+elements.scale+")"
          //DOM_img.style.mozTransform = "scale("+elements.scale+")"
          //DOM_img.style.oTransform = "scale("+elements.scale+")"
        }
        if (has(elements, 'cycle_images')) {
          DOM_img.cycle_images = elements.cycle_images
          this.cycled_elements.push(DOM_img)
        }

        
        
        attach(elements.click_animation, DOM_img, 'click_animation')
        attach(elements.uncover_time, DOM_img, 'uncover_time', 0)
        attach(elements.cover_on_mouseleave, DOM_img, 'cover_on_mouseleave', undefined, true)
        attach(elements.auto_cover_time, DOM_img, 'auto_cover_time', 0)
        attach(elements.collectible_only_if_uncovered, DOM_img, 'collectible_only_if_uncovered', false)
        attach(elements.on_collect_finished, DOM_img, 'on_collect_finished', undefined)
        attach(elements.on_initialize, DOM_img, 'on_initialize', undefined)
        
       
        if (elements.mouseover_sounds) {
          DOM_img.mouseover_sound_index = Math.floor(Math.random() * elements.mouseover_sounds.length); 
        }
        if (elements.click_sounds) {
          DOM_img.click_sound = new Howl({
            src: [
              pathJoin([trial.audio_path, elements.click_sounds[DOM_img.mouseover_sound_index]])
            ]})
        }

        if (elements.collected_click_sounds) {
          DOM_img.collected_click_sounds = new Howl({
            src: [
              pathJoin([trial.audio_path, elements.collected_click_sounds[DOM_img.mouseover_sound_index]])
            ]})
        }  

        
        DOM_img.state = "uncollected";
        DOM_img.mouseover_state = 'covered'
        DOM_img.images = elements.images
        
        DOM_img.covered_image = pathJoin([trial.images_path, elements.images[DOM_img.image_index]])
        DOM_img.src = DOM_img.covered_image
        attach(elements.points, DOM_img, 'points')
        DOM_img.pan_sounds = elements.pan_sounds;
        DOM_img.attenuate_sounds = elements.attenuate_sounds;
        obj = this
        DOM_img.addEventListener("click", async function (e) {
          //wegen loop:
          if (this.uncover_sound) {
            this.uncover_sound.stop();       
         }

          if (elements.collectible_only_if_uncovered && this.mouseover_state == 'covered') {
            return
          }
          if (obj.container.crosshair && obj.container.mouseAtGoal == false) {
            return
          }
          // TODO:  Clean this up ... much of what happens in this should also happen in the else part ...

          
          if (this.click_sound){
                if (this.state != "collected"){

                if (this.pan_sounds) {
                  this.click_sound.stereo(getAudioXPosition(e, this))
                }
                if (this.attenuate_sounds) {
                  this.click_sound.volume(getAudioYPosition(e, this))
                }
                this.click_sound.play() 
                console.log(this.click_sound)
              }             
            }

            if (this.collected_click_sounds){
            
              if (this.state == "collected"){

              if (this.pan_sounds) {
                this.collected_click_sounds.stereo(getAudioXPosition(e, this))
              }
              if (this.attenuate_sounds) {
                this.collected_click_sounds.volume(getAudioYPosition(e, this))
              }
              this.collected_click_sounds.play() 
            }             
          }

          if (this.click_animation) {
            const click_styler = styler(this);
            this.click_animation_playback = this.click_animation.start((v) => click_styler.set(v));
          }
          if (this.state != "collected") {
              this.selection_time = performance.now();            
            if (elements.collectible) {
              this.state = "collected";
            }
            if (this.click_delay) {
              await delay(this.click_delay)
            }
            if (obj.point_indicator && this.points != undefined) {
              if (obj.indicate_points == "both" | (obj.indicate_points == "negative" & this.points < 0) | (obj.indicate_points == "positive" & this.points > 0)  ){
                var pi = document.createElement("div");
                obj.container.appendChild(pi);
                let ps = this.points
                if (ps > 0) {
                  ps = '+' + ps
                }
      
                pi.outerHTML = obj.point_indicator.replace("%%", ps);
                pi = document.getElementById("point-indicator-html");
                pi.id = "Point_indicator_" + pi_id + "_animated";
                pi.style.position = "absolute";
                var pos = obj.getActualPosition(this.id);
                pi.style.left = pos[0] -20 + "px";
                pi.style.top = pos[1] - 40 + "px";
                pi.style.zIndex = 999999999; // Put it in the background!
                pi.style.pointerEvents = "none";
                if (trial.point_animation) {
                  const point_styler = styler(pi);
                  pi.animation = Object.assign(physics(), trial.point_animation);
                  pi.playback = pi.animation.start((v) => point_styler.set(v));
                }
                pi_id++;
              }
            }
            
            this.ist = this.selection_time - obj.last_selection_time;
            this.selection_position = obj.getActualPosition(this.id);
            // The odd assign is required to save DOM relevant attributes!
            obj.selections.push(Object.assign({}, this, { id: this.id }));
            obj.last_selection_time = this.selection_time;
            if (this.points) {
            obj.points = obj.points + this.points;
              if (trial.point_counter_update_function) {
                trial.point_counter_update_function(this.points);
                obj.updatePoints(obj.points, obj.points_display_html_template);
              }
            }
            if (elements.collectible) {
              if (elements.collected_images) {
                this.src = pathJoin([
                  trial.images_path,
                  elements.collected_images[this.image_index],
                ]);
              } else {
                let index;
                for (var i = 0; i < obj.elements_to_be_watched.length; i++) {
                  if (obj.elements_to_be_watched[i] == this) {
                    index = i;
                    break;
                  }
                }
                obj.elements_to_be_watched.splice(index, 1);
                this.remove();
              }
            }
            if (this.on_collect_finished) {
              this.on_collect_finished(this);
            }
          }
          if (elements.on_click) {
            elements.on_click(this)
          }
        });

        if (elements.trial_ends_when_all_collected) {
          ends_when_all_collected.push(
            new Promise(
              (resolve, reject) => {
                DOM_img.addEventListener("click", () => resolve());
              },
              { once: true }
            )
          );
        }
        if (elements.trial_ends_when_one_collected) {
          ends_when_one_collected.push(
            new Promise(
              (resolve, reject) => {
                DOM_img.addEventListener("click", () => resolve());
              },
              { once: true }
            )
          );
        } else {
          ends_when_one_collected.push(
            new Promise(
              (resolve, reject) => {} // this will be never resolved!
            )
          );
        }
        


        if (elements.uncover_sounds) {
          DOM_img.uncover_sound_index = Math.floor(Math.random() * elements.uncover_sounds.length); 
          DOM_img.uncover_sound = new Howl({
            src: [
              pathJoin([trial.audio_path, elements.uncover_sounds[DOM_img.uncover_sound_index]])
            ],
            loop : true //loop hinzugefügt
          })
        }

        if (elements.mouseover_sounds) {
          
          DOM_img.mouseover_sound_index = Math.floor(Math.random() * elements.mouseover_sounds.length); 
          DOM_img.mouseover_sound = new Howl({
            src: [
              pathJoin([trial.audio_path, elements.mouseover_sounds[DOM_img.mouseover_sound_index]])
            ]})

          DOM_img.addEventListener("mouseenter", function (e) {
            if (this.state != "collected") {
              if (this.pan_sounds) {
                this.mouseover_sound.stereo(getAudioXPosition(e, this))
              }
              if (this.attenuate_sounds) {
                this.mouseover_sound.volume(getAudioYPosition(e, this))
              }
              this.mouseover_sound.play() 
            }
          });
        }
        
        if (elements.chirps && elements.chirp_intervals) {
          const elem = DOM_img
          const chirp_fun = function(){
          if (elem.state == "uncollected") {
            let chirp = elements.chirps[Math.floor(Math.random() * elements.chirps.length)]
             let sound = new Howl({
              src: [
                pathJoin([trial.audio_path, chirp])
              ]})
              if (elem.pan_sounds) {
                sound.stereo(getAudioXPosition(obj.getActualPosition(elem.id), elem))
              }
              if (elem.attenuate_sounds) {
                sound.volume(getAudioYPosition(obj.getActualPosition(elem.id), elem))
              }
              sound.play()


            }
            elem.chirp_time_out = setTimeout(chirp_fun,elements.chirp_intervals())
          }
          if (elem.state == "uncollected") {
            elem.chirp_time_out = setTimeout(chirp_fun,elements.chirp_intervals())
          }

        }


        if (elements.mouseover_images) {
          DOM_img.mouseover_image = pathJoin([
            trial.images_path,
            elements.mouseover_images[DOM_img.image_index],
           
          ]);
          DOM_img.addEventListener("mousemove", async function (e) {
            if (this.uncover_sound) {
              if (this.pan_sounds) {
                this.uncover_sound.stereo(getAudioXPosition(e, this));
              }
              if (this.attenuate_sounds) {
                this.uncover_sound.volume(getAudioYPosition(e, this));
              }
            }
          });
          DOM_img.addEventListener("mouseenter",  async function (e) {
            let timeout = null
            if (this.state == "uncollected") {
              let DOM_img_obj = this
              this.mouse_over_timeout = setTimeout(function(){
                obj.uncover(DOM_img_obj) //.mouseover_state = 'uncovered'
                obj.mouseovers.push([DOM_img_obj.id, performance.now()]); // TODO: This should not depend on whether or not mouseovers have images ....
              }, DOM_img_obj.uncover_time)
            }
            if (this.auto_cover_time > 0) {
              let DOM_img_obj = this
              setTimeout(function(){obj.cover(DOM_img_obj)}, this.auto_cover_time + this.uncover_time)
            }
          });

          obj = this
          DOM_img.addEventListener("mouseleave", function () {
            clearTimeout(this.mouse_over_timeout);
            if (this.cover_on_mouseleave){
               obj.cover(this)
            }
          });



        }
        if (elements.mouseover_collected_images) {
          DOM_img.addEventListener("mouseenter", function () {
            if (this.state == "collected") {
              this.src = pathJoin([
                trial.images_path,
                elements.mouseover_collected_images[this.image_index],
              ])
              obj.mouseovers.push([this.id, performance.now()]);
            }
          });
          DOM_img.addEventListener("mouseleave", function () {
            if (this.state == "collected") {
              this.src = pathJoin([
                trial.images_path,
                elements.collected_images[this.image_index],
              ])
            }
          });
        }

        var p = elements.positions.next();
        setAbsolutePosition(DOM_img, p[0], p[1]);
        if (elements.zIndex) {
          DOM_img.style.zIndex = elements.zIndex;
        }
        else {
          DOM_img.style.zIndex = p[1]; //elements.zIndex;
        }

        if (elements.animation) {
          const ani_styler = styler(DOM_img);
          DOM_img.animation = clonedeep(elements.animation);
          DOM_img.playback = DOM_img.animation.start((v) => ani_styler.set(v));
          DOM_img.id = DOM_img.id + "_animated"; // Mark as animated!
        }
        if (elements.animations) {
          const ani_styler = styler(DOM_img);
          DOM_img.animation_index = Math.floor(
            Math.random() * elements.animations.length
          );
          DOM_img.animation = clonedeep(
            elements.animations[DOM_img.animation_index]
          );
          DOM_img.playback = DOM_img.animation.start((v) => ani_styler.set(v));
          DOM_img.id = DOM_img.id + "_animated"; // Mark as animated!
        }

        // Attach callback functions to the DOM object
        
        if (elements.on_left_out) {
          DOM_img.on_left_out = elements.on_left_out;
        }
        if (elements.on_right_out) {
          DOM_img.on_right_out = elements.on_right_out;
        }
        if (elements.on_top_out) {
          DOM_img.on_top_out = elements.on_top_out;
        }
        if (elements.on_bottom_out) {
          DOM_img.on_bottom_out = elements.on_bottom_out;
        }
        // If any cb func was set, we need to push the element into the list of watched elements
        if (
          DOM_img.on_left_out ||
          DOM_img.on_right_out ||
          DOM_img.on_top_out ||
          DOM_img.on_bottom_out
        ) {
          this.elements_to_be_watched.push(DOM_img);
        }
        if (DOM_img.on_initialize) {
          DOM_img.on_initialize()
        }
        this.appendElement(DOM_img);
        display.push({
          'image' : DOM_img.src.split(/[\\/]/).pop(),
          'position' : this.getActualPosition(DOM_img.id)

        })
        stim_id++;
      }
    }

    // Reset all Position generators
    for (var e = 0; e < trial.elements.length; e++) {
      if (trial.elements[e].positions.on_patch_done == "reset") {
        trial.elements[e].positions.reset();
      } else if (trial.elements[e].positions.on_patch_done == "rewind") {
        trial.elements[e].positions.rewind();
      }
    }
    this.container.style.visibility = 'visible'

    this.patch_start_time = performance.now();
    this.last_selection_time = this.patch_start_time;
    
    // Disable all mouse stuff if the patch is no longer active
    var obj = this;
    function handler(e) {
      if (!obj.active) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
    this.container.addEventListener("click", handler, true);
    this.container.addEventListener("mouseenter", handler, true);
    const timer = setInterval(
      function (obj) {
        for (var e = 0; e < obj.elements_to_be_watched.length; e++) {
          let current_element = obj.elements_to_be_watched[e];
          let position = obj.getActualPosition(current_element.id);
          if (trial.debug) {
            console.log(obj.getActualPosition(current_element.id))
          }
          
          if (current_element.on_left_out && position[0] < -obj.virtual_boundary) {
            current_element.on_left_out(current_element, position);
          }
          if (
            current_element.on_right_out &&
            position[0] > trial.patch_size[0] + obj.virtual_boundary
          ) {
            current_element.on_right_out(current_element, position);
          }
          if (current_element.on_top_out && position[1] < -obj.virtual_boundary) {
            current_element.on_top_out(current_element, position);
          }
          if (
            current_element.on_bottom_out &&
            position[1] > trial.patch_size[1] + obj.virtual_boundary
          ) {
            current_element.on_bottom_out(current_element, position);
          }
        }
      },
      300,
      this
    );

    let nextClicked;
    if (trial.next_patch_click_html) {
      var el = document.getElementById("next-patch-click-html");
      nextClicked = new Promise((resolve, reject) => {
        el.addEventListener(
          "click",
          function (e) {
            resolve();
          },
          { once: true }
        );
      });
    } else {
      nextClicked = new Promise((resolve, reject) => {}); // this will be never resolved!
    }

    if (ends_when_all_collected.length == 0) {
      ends_when_all_collected.push(
        new Promise((resolve, reject) => {}) // this will be never resolved!
      );
    }
    let patch_timeout;
    if (trial.timeout) {
      // checking if timeout is wanted if yes ...
      patch_timeout = delay(trial.timeout); // a promise that will be resolved after the delay
    } else {
      patch_timeout = new Promise((resolve, reject) => {}); // this promise will be never resolved!
    }
    let keyPressed
    let t = this
    if (trial.continue_on_keypress) {
      keyPressed = new Promise((resolve, reject) => {
        document.addEventListener("keydown", function (e) {
          if (trial.continue_on_keypress.includes(e.key)) {
            if (trial.key_sound) {
              trial.key_sound.play()
            }
            t.key = e.key; resolve();}});
      });
    }
    else {
      keyPressed = new Promise((resolve, reject) => {}); // this will be never resolved!
    }
    if (trial.state_cycle) {
      this.state_cycle = trial.state_cycle.states
      this.state = trial.state_cycle.states[0]
      this.state_index = 0
      obj = this
      let start_time = 0
      function set_cycle_timer(interval, desired_interval) {
        obj.state_timer = setInterval(function(){
          let now = performance.now()
          if (obj.state_index == 0) {
            start_time = performance.now()
          }
          let actual_time = performance.now() - start_time
          //console.error('actual time', actual_time)
          
          //if (obj.state_timer_executed_last!=undefined){
            //console.error('delay' + (now - obj.state_timer_executed_last))
            //let error = desired_interval - (now - obj.state_timer_executed_last)
            
            let error = (desired_interval * obj.state_index) - actual_time

            //console.error('error:', error)
            clearInterval(obj.state_timer)
            set_cycle_timer(desired_interval+error, desired_interval)
          //}
          obj.state_index = (obj.state_index+1)%obj.state_cycle.length;
          //console.error('index=' + obj.state_index + '; bild' + obj.state_cycle[obj.state_index] );
          for (var i=0; i < obj.cycled_elements.length; i++) {
           var idx = (obj.state_index +  obj.cycled_elements[i].cycle_images.offset)%obj.state_cycle.length;
           obj.cycled_elements[i].src = pathJoin([trial.images_path,  obj.cycled_elements[i].images[obj.state_cycle[idx]]])
          }
          obj.state_timer_executed_last = now
          },
          interval);
      
        }
        set_cycle_timer(trial.state_cycle.interval, trial.state_cycle.interval)
      }
 
      

      

    await Promise.race([
      // ... patch ends when ...
      keyPressed, // ... keyPressed
      patch_timeout, // ... the timeout occurs
      nextClicked, // ... or next was clicked
      Promise.all(ends_when_all_collected), // ... or all elements in this list is collected
      Promise.race(ends_when_one_collected), // ... or one of the elements in this list is colleced
    ]);

    this.active = false;
    var all = document.getElementsByTagName("*");
    for (var i=0, max=all.length; i < max; i++) {
      if (all[i].chirp_time_out) {
         window.clearInterval(all[i].chirp_time_out) // Do something with the element here
      }
    }


    this.patch_end_time = performance.now();


    if (trial.travel_backgrounds) {
      var travel_backgrounds =
        trial.travel_backgrounds[Math.floor(Math.random() * trial.travel_backgrounds.length)];
      this.container.style.backgroundImage =
        "url('" + pathJoin([trial.images_path, travel_backgrounds]) + "')";
    }

    if (trial.patch_leaving_animation) {
      const pl_styler = styler(this.container);
      var ani = Object.assign(tween(), trial.patch_leaving_animation);
      var pb = ani.start((v) => pl_styler.set(v));
    }
    if (trial.travel_time) {
      await delay(trial.travel_time);
    }

    // Turns out, if the animations are not deleted at the end of the trial,
    // some objects dangle on and the experiment slows down with every trial ...
    // It might be better to fix this elsewhere, however, turning them off is
    // a good workaround:
    var stims = document.querySelectorAll('[id*="animated"]');
    for (var s = 0; s < stims.length; s++) {
      if (stims[s].playback) {
        stims[s].playback.stop();
      }
      if (stims[s].click_animaion_playback) {
        stims[s].click_animaion_playback.stop();
      }
    }

    // Store data!
    let resultData;
    if (trial.demo) {
      resultData = { info: "Data discared in demo mode!" };
    } else {
        resultData = Object.assign({}, trial, {
        display : display,
        final_cycle_state :  this.state_index,
        points: this.points,
        patch_end_time: this.patch_end_time,
        patch_start_time: this.patch_start_time,
        time_in_trial: this.patch_end_time - this.patch_start_time,
        selections: this.selections,
        mouseovers: this.mouseovers,
        key: this.key
      });
    }
 
    if (trial.border_sound) {
      trial.border_sound.stop()
    }
  // Finish trial and log data
    clearInterval(timer);
    clearInterval(obj.state_timer);
    jsPsych.finishTrial(fclone(resultData));
  }
}

const instance = new ForagingPatchPlugin();
jsPsych.plugins["foraging-patch"] = instance;
export default instance;