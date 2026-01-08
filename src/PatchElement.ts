import { Howl } from "howler";
import { animate } from "popmotion";

/**
 * Interface for the object returned by animate().
 * In Popmotion v11, animate() returns an object with a stop() method.
 */
interface AnimationPlayback {
  stop: () => void;
}

/**
 * Represents a single interactable object in the foraging patch.
 * Refactored from legacy 'Positioning.js' and element generation logic.
 */
export interface LegacyElementConfig {
  id?: string;
  image: string;

  // Satisfies FR-E.4 (Amount Definition)
  amount?: number;

  x?: number;
  y?: number;
  w?: number;
  h?: number;
  width?: number;
  height?: number;

  // Satisfies FR-E.6 (Collectible Definition)
  collectible?: boolean;

  // Satisfies FR-E.8 (Collected Image)
  collected_image?: string;

  // Satisfies FR-E.9 (Mouseover Image)
  mouseover_image?: string;

  // Satisfies FR-E.10 (Mouseover Sound)
  mouseover_sounds?: string | string[];

  // Satisfies FR-E.11 (Click Sound)
  click_sounds?: string | string[];

  // Satisfies FR-E.12 (Points Definition)
  points?: number;

  // New Data Fields for Logging (FR-D.5)
  type?: string;
  tag?: string;

  // Animation configuration (Popmotion v11 object)
  animation?: any;
}

export class PatchElement {
  private element: HTMLElement;
  public config: LegacyElementConfig;
  private imagePath: string;
  private audioPath: string;
  private isCollected: boolean = false;

  // Audio objects
  private clickSound: Howl | null = null;
  private hoverSound: Howl | null = null;

  // Animation objects
  private playback: AnimationPlayback | null = null;

  constructor(config: LegacyElementConfig, imagePath: string = "", audioPath: string = "") {
    this.config = config;
    this.imagePath = imagePath;
    this.audioPath = audioPath;
    this.element = this.createDOM();

    this.initializeAudio();
    this.bindHoverEvents();
    this.initializeAnimation();
  }

  /**
   * Initialize Howler audio objects.
   */
  private initializeAudio(): void {
    const resolveAudio = (src: string | string[]) => {
      const file = Array.isArray(src) ? src[0] : src;
      const cleanPath = this.audioPath.endsWith('/') || this.audioPath === "" ? this.audioPath : this.audioPath + '/';
      return cleanPath + file;
    };

    if (this.config.click_sounds) {
      this.clickSound = new Howl({ src: [resolveAudio(this.config.click_sounds)] });
    }

    if (this.config.mouseover_sounds) {
      this.hoverSound = new Howl({ src: [resolveAudio(this.config.mouseover_sounds)] });
    }
  }

  /**
   * Creates the DOM element with correct positioning.
   * Satisfies FR-E.1 (Display Elements)
   * Satisfies FR-E.3 (Positioning)
   */
  private createDOM(): HTMLElement {
    const el = document.createElement("img");

    const cleanPath = this.imagePath.endsWith('/') || this.imagePath === "" ? this.imagePath : this.imagePath + '/';
    el.src = this.imagePath ? cleanPath + this.config.image : this.config.image;

    // Set ID (Legacy often generated IDs like 'stimulus-1')
    el.id = this.config.id || `foraging-element-${Math.random().toString(36).substr(2, 9)}`;

    // Apply visual styles
    el.style.position = "absolute";
    // Legacy positioning often assumed center-based coordinates (x=0 is center)
    // We might need to adjust this depending on if legacy used top-left (0,0) or center (0,0)
    // For now, we assume standard CSS absolute positioning (left/top).
    el.style.left = `${this.config.x}px`;
    el.style.top = `${this.config.y}px`;

    // Handle Dimensions
    const width = this.config.width || this.config.w || 50;
    const height = this.config.height || this.config.h || 50;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    // Centering transform (common in visual experiments to make x/y the center of the object)
    el.style.transform = "translate(-50%, -50%)";
    el.style.cursor = "pointer";
    
    // Note: CSS transitions removed to prevent conflict with Physics engine

    el.ondragstart = () => false;

    return el;
  }

  /**
   * Initializes Popmotion animation if provided in config.
   * Uses native Popmotion v11 'animate' function.
   */
  private initializeAnimation(): void {
    if (this.config.animation) {
      try {
        // Pass the config object directly to animate().
        // We attach our own onUpdate handler to apply the styles to the DOM.
        this.playback = animate({
           ...this.config.animation,
           onUpdate: (latest: any) => {
             this.applyStyles(latest);
           }
        });
      } catch (e) {
        console.error("Failed to start Popmotion animation for element:", this.config.id, e);
      }
    }
  }

  /**
   * Helper to apply Popmotion values to the DOM element.
   * Replicates the style setting functionality.
   */
  private applyStyles(values: any) {
    if (!this.element) return;
    
    // We strictly maintain the centering transform needed for the layout logic
    let transform = "translate(-50%, -50%)"; 
    
    // Append physics transforms
    if (values.x !== undefined) transform += ` translateX(${values.x}px)`;
    if (values.y !== undefined) transform += ` translateY(${values.y}px)`;
    if (values.rotate !== undefined) transform += ` rotate(${values.rotate}deg)`;
    if (values.scale !== undefined) transform += ` scale(${values.scale})`;

    this.element.style.transform = transform;

    if (values.opacity !== undefined) {
      this.element.style.opacity = values.opacity;
    }
  }

  /**
   * Stops the active animation.
   * Critical for preventing memory leaks when trials end.
   */
  public stopAnimation(): void {
    if (this.playback) {
      this.playback.stop();
      this.playback = null;
    }
  }

  /**
   * Binds mouseover/mouseleave for images and sounds.
   */
  private bindHoverEvents(): void {
    const el = this.element as HTMLImageElement;
    const cleanPath = this.imagePath.endsWith('/') || this.imagePath === "" ? this.imagePath : this.imagePath + '/';

    this.element.addEventListener("mouseenter", () => {
      if (this.isCollected) return;

      if (this.hoverSound) {
        this.hoverSound.play();
      }

      if (this.config.mouseover_image) {
        el.src = cleanPath + this.config.mouseover_image;
      }
    });

    this.element.addEventListener("mouseleave", () => {
      if (this.isCollected) return;
      el.src = cleanPath + this.config.image;
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Binds a click listener to the element.
   */
  public bindClick(callback: (item: PatchElement) => void): void {
    this.element.addEventListener("mousedown", (e) => {
      if (e.button === 0 && !this.isCollected) {
        if (this.clickSound) {
          this.clickSound.play();
        }
        callback(this);
      }
    });
  }

  /**
   * Changes the visual state of the element to 'collected'.
   */
  public setCollected(): void {
    this.isCollected = true;
    
    // Stop physics so the collected state remains stable
    this.stopAnimation();

    const el = this.element as HTMLImageElement;

    if (this.config.collected_image) {
      const cleanPath = this.imagePath.endsWith('/') || this.imagePath === "" ? this.imagePath : this.imagePath + '/';
      el.src = cleanPath + this.config.collected_image;
      el.style.cursor = "default";
    } else {
      el.style.opacity = "0";
      // el.style.transform = "translate(-50%, -50%) scale(0.5)";
    }
    el.style.pointerEvents = "none";
  }

  public getPoints(): number {
    return this.config.points || 0;
  }
}