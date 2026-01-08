/**
 * Represents a single interactable object in the foraging patch.
 * Refactored from legacy 'Positioning.js' and element generation logic.
 */
export interface LegacyElementConfig {
    id?: string;
    image: string;
    amount?: number;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    width?: number;
    height?: number;
    collectible?: boolean;
    collected_image?: string;
    mouseover_image?: string;
    mouseover_sounds?: string | string[];
    click_sounds?: string | string[];
    points?: number;
    type?: string;
    tag?: string;
}
export declare class PatchElement {
    private element;
    config: LegacyElementConfig;
    private imagePath;
    private audioPath;
    private isCollected;
    private clickSound;
    private hoverSound;
    constructor(config: LegacyElementConfig, imagePath?: string, audioPath?: string);
    /**
     * Initialize Howler audio objects.
     */
    private initializeAudio;
    /**
     * Creates the DOM element with correct positioning.
     * Satisfies FR-E.1 (Display Elements)
     * Satisfies FR-E.3 (Positioning)
     */
    private createDOM;
    /**
     * Binds mouseover/mouseleave for images and sounds.
     */
    private bindHoverEvents;
    getElement(): HTMLElement;
    /**
     * Binds a click listener to the element.
     */
    bindClick(callback: (item: PatchElement) => void): void;
    /**
     * Changes the visual state of the element to 'collected'.
     */
    setCollected(): void;
    getPoints(): number;
}
