// src/util/Helpers.ts

/**
 * Joins path segments and cleans up double slashes.
 */
export function pathJoin(segments: string[]): string {
  return segments.join("/").replace(/\/{2,}/, "/");
}

/**
 * Calculates angle between (0,0) and (x,y).
 */
export function getAngle(x: number, y: number): number {
  return Math.atan2(y, x);
}

const varToString = (varObj: any) => Object.keys(varObj)[0];

/**
 * Legacy parameter attachment helper.
 */
export function attach(
  incoming_parameter: any,
  target_object: any,
  new_name: string | undefined = undefined,
  test_against: any = undefined,
  default_value: any = undefined
) {
  if (incoming_parameter != test_against) {
    if (new_name) {
      target_object[new_name] = incoming_parameter;
    } else {
      target_object[varToString(incoming_parameter)] = incoming_parameter;
    }
  } else {
    if (new_name) {
      target_object[new_name] = default_value;
    } else {
      target_object[varToString(incoming_parameter)] = default_value;
    }
  }
}

/**
 * Helper to attach HTML strings to an object and insert them into the DOM.
 */
export function attach_html(
  incoming_parameter: any,
  target_html_object: HTMLElement,
  target_object: any,
  test_against: any = undefined
) {
  if (incoming_parameter != test_against) {
    target_html_object.insertAdjacentHTML("beforeend", incoming_parameter);
    target_object[varToString(incoming_parameter)] = incoming_parameter;
  }
}

/**
 * Shuffles array in place.
 */
export function shuffle<T>(a: T[]): T[] {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}