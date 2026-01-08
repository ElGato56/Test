import { PatchElement } from "./PatchElement";
export interface PatchConfig {
    width: number;
    height: number;
    background: string | null;
}
export declare class PatchRenderer {
    private displayElement;
    private container;
    private hudContainer;
    constructor(displayElement: HTMLElement);
    /**
     * Renders the main container and HUD wrapper.
     * Satisfies FR-P.2 (Patch Size)
     * Satisfies FR-P.3 (Background)
     */
    renderContainer(width: number, height: number, background: string | null): void;
    /**
     * Renders the Score Display and Next Button in the HUD.
     * Satisfies FR-F.3 (Points Display HTML)
     * Satisfies FR-C.2 (Next Patch Button)
     */
    renderHUD(scoreHtml: string, nextButtonHtml: string | null, onNextClick: () => void): void;
    /**
     * Updates the displayed score number.
     * Satisfies FR-F.3 (Update Points Display)
     */
    updateScoreDisplay(points: number): void;
    /**
     * Adds multiple elements to the patch container.
     * Satisfies FR-E.1 (Display Elements)
     */
    renderElements(elements: PatchElement[]): void;
    /**
     * Plays the leaving animation using Web Animations API.
     * Satisfies FR-P.5 (Patch Leaving Animation)
     */
    animateHide(): Promise<void>;
    /**
     * Cleans up the display.
     */
    clear(): void;
}
