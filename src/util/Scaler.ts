// src/util/Scaler.ts

export class Scaler {
  private _element: HTMLElement;
  private _dimensions: { width: number; height: number };
  private _margin: number;

  constructor(element: HTMLElement, initialWidth: number, initialHeight: number, margin: number) {
    this._element = element;
    this._dimensions = { width: initialWidth, height: initialHeight };
    this._margin = margin;
    this._resizeToWindowSize();
    this._addEventListeners();
  }

  destruct() {
    this._removeEventListeners();
  }

  private _addEventListeners() {
    window.addEventListener("orientationchange", this._resizeToWindowSize);
    window.addEventListener("resize", this._resizeToWindowSize);
  }

  private _removeEventListeners() {
    window.removeEventListener("orientationchange", this._resizeToWindowSize);
    window.removeEventListener("resize", this._resizeToWindowSize);
  }

  private _resize(width: number, height: number) {
    const scale = Math.min(width / this._dimensions.width, height / this._dimensions.height);
    this._element.style.transform = `scale(${scale})`;
    // Optional: Center the container if needed
    // this._element.style.transformOrigin = 'center center';
  }

  private _resizeToWindowSize = () => {
    this._resize(window.innerWidth - this._margin, window.innerHeight - this._margin);
  };
}