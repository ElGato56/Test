// src/util/Positioning.ts

/**
 * Sets an absolute position for an element within the container.
 * The screen center is specified as x = 0, y = 0.
 *
 * @param element The element to be positioned absolutely.
 * @param x The x position in pixels, relative to the screen center.
 * @param y The y position in pixels, relative to the screen center.
 */
export function setAbsolutePosition(element: HTMLElement, x = 0, y = 0) {
  element.classList.add("absolute-position");

  // Parse width/height safely. If strictly inline style is missing, try offsetWidth.
  const width = parseFloat(element.style.width) || element.offsetWidth || 0;
  const height = parseFloat(element.style.height) || element.offsetHeight || 0;

  element.style.marginLeft = (x - width / 2.0) + "px";
  element.style.marginTop = (y - height / 2.0) + "px";
}

/**
 * Calculates the stereo panning position (-1 to 1) based on mouse X relative to the object's container.
 * * @param e The mouse event or [x, y] coordinate array.
 * @param object The HTML element reference (used to find the parent container bounds).
 */
export function getAudioXPosition(e: MouseEvent | number[], object: HTMLElement): number {
  const bounds = object.parentElement?.getBoundingClientRect();
  if (!bounds) return 0;

  let x: number;
  if (Array.isArray(e)) {
    x = e[0];
  } else if ('clientX' in e) {
    x = e.clientX;
  } else {
    return 0;
  }

  // Map position within container to -1 (left) to 1 (right)
  return ((x - bounds.left) / (bounds.right - bounds.left) * 2) - 1;
}

/**
 * Calculates the volume attenuation (0 to 1) based on mouse Y relative to the object's container.
 * * @param e The mouse event or [x, y] coordinate array.
 * @param object The HTML element reference.
 */
export function getAudioYPosition(e: MouseEvent | number[], object: HTMLElement): number {
  const bounds = object.parentElement?.getBoundingClientRect();
  if (!bounds) return 0;

  let y: number;
  if (Array.isArray(e)) {
    y = e[1];
  } else if ('clientY' in e) {
    y = e.clientY;
  } else {
    return 0;
  }

  // Map position within container (0 = top/loud, 1 = bottom/quiet)
  return ((y - bounds.top) / (bounds.bottom - bounds.top));
}