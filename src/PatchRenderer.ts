import { PatchElement } from "./PatchElement";

export interface PatchConfig {
  width: number;
  height: number;
  background: string | null;
}

export class PatchRenderer {
  private displayElement: HTMLElement;
  private container: HTMLDivElement | null = null;

  // New: Container for Score and Next Button
  private hudContainer: HTMLDivElement | null = null;

  constructor(displayElement: HTMLElement) {
    this.displayElement = displayElement;
  }

  /**
   * Renders the main container and HUD wrapper.
   * Satisfies FR-P.2 (Patch Size)
   * Satisfies FR-P.3 (Background)
   */
  public renderContainer(width: number, height: number, background: string | null): void {
    this.displayElement.innerHTML = "";

    // Wrapper füllt den ganzen Bildschirm
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "center";
    wrapper.style.alignItems = "center";

    // HUD Container Setup (Overlay)
    // FIX: Absolut positionieren, damit kein grauer Balken entsteht
    this.hudContainer = document.createElement("div");
    this.hudContainer.id = "jspsych-foraging-hud";
    this.hudContainer.style.position = "absolute"; 
    this.hudContainer.style.top = "20px"; // Abstand von oben
    this.hudContainer.style.left = "0";
    this.hudContainer.style.width = "100%"; 
    this.hudContainer.style.padding = "0 40px"; // Abstand links/rechts
    this.hudContainer.style.boxSizing = "border-box";
    this.hudContainer.style.display = "flex";
    this.hudContainer.style.justifyContent = "space-between";
    this.hudContainer.style.alignItems = "center";
    this.hudContainer.style.zIndex = "100"; // Sicherstellen, dass es über allem liegt
    
    // Patch Container Setup
    this.container = document.createElement("div");
    this.container.id = "jspsych-foraging-container";

    // Base Styles
    this.container.style.position = "relative";
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
    this.container.style.border = "none"; // Kein Rahmen

    // Background
    if (background) {
      if (background.startsWith("#") || background.startsWith("rgb") || /^[a-z]+$/i.test(background)) {
        this.container.style.backgroundColor = background;
      } else {
        this.container.style.backgroundImage = `url(${background})`;
        this.container.style.backgroundSize = "cover";
        this.container.style.backgroundPosition = "center";
      }
    }

    // Reihenfolge ist wichtig: Erst Container, dann HUD (aber durch z-index egal)
    wrapper.appendChild(this.container);
    wrapper.appendChild(this.hudContainer);
    this.displayElement.appendChild(wrapper);
  }

  /**
   * Renders the Score Display and Next Button in the HUD.
   * Satisfies FR-F.3 (Points Display HTML)
   * Satisfies FR-C.2 (Next Patch Button)
   */
  public renderHUD(scoreHtml: string, nextButtonHtml: string | null, onNextClick: () => void): void {
    if (!this.hudContainer) return;

    // 1. Render Score
    const scoreDiv = document.createElement("div");
    scoreDiv.id = "jspsych-foraging-score-container";
    scoreDiv.innerHTML = scoreHtml; // Template provided by user (e.g. "Points: <span id='...'>0</span>")
    this.hudContainer.appendChild(scoreDiv);

    // 2. Render Next Button (if provided)
    if (nextButtonHtml) {
      const btnContainer = document.createElement("div");
      btnContainer.innerHTML = nextButtonHtml;

      // Attempt to find a button inside, or make the container clickable
      const btn = btnContainer.querySelector("button") || btnContainer;
      (btn as HTMLElement).style.cursor = "pointer";

      btn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent form submission if applicable
        onNextClick();
      });

      this.hudContainer.appendChild(btnContainer);
    }
  }

  /**
   * Updates the displayed score number.
   * Satisfies FR-F.3 (Update Points Display)
   */
  public updateScoreDisplay(points: number): void {
    // Look for the specific ID defined in the requirement
    const scoreSpan = document.getElementById("jspsych-foraging-score-value");
    if (scoreSpan) {
      scoreSpan.innerText = points.toString();
    }
  }

  /**
   * Adds multiple elements to the patch container.
   * Satisfies FR-E.1 (Display Elements)
   */
  public renderElements(elements: PatchElement[]): void {
    if (!this.container) {
      console.error("Cannot render elements: Container not created yet.");
      return;
    }
    elements.forEach((item) => {
      this.container?.appendChild(item.getElement());
    });
  }

  /**
   * Plays the leaving animation using Web Animations API.
   * Satisfies FR-P.5 (Patch Leaving Animation)
   */
  public animateHide(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.container) {
        console.warn("animateHide called but container is null");
        resolve();
        return;
      }

      console.log("Refactored Foraging Plugin: Starting Fade Out Animation...");

      // Web Animations API - The robust way to animate
      const animation = this.container.animate(
          [
            { opacity: '1', transform: 'scale(1)' },    // Start
            { opacity: '0', transform: 'scale(0.95)' }  // End
          ],
          {
            duration: 500, // 500ms
            easing: 'ease-out',
            fill: 'forwards' // Freeze at the end state (invisible)
          }
      );

      // Resolve the promise only when the animation is truly finished
      animation.onfinish = () => {
        console.log("Refactored Foraging Plugin: Animation Finished.");
        resolve();
      };
    });
  }

  /**
   * Cleans up the display.
   */
  public clear(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    if (this.hudContainer) {
      this.hudContainer.remove();
      this.hudContainer = null;
    }
  }
}