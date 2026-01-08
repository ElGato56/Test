// src/util/PositionGenerators.ts
import { shuffle } from "./Helpers";

export interface PositionGeneratorOptions {
  columns?: number;
  rows?: number;
  hspacing?: number;
  vspacing?: number;
  hjitter?: number;
  vjitter?: number;
  hoffset?: number;
  voffset?: number;
  on_used_up?: 'nothing' | 'reset' | 'rewind';
  on_patch_done?: 'reset' | 'rewind';
  rejection_function?: (x: number, y: number) => boolean;
  perspective_factor?: number;
  
  // For RandomSparse
  number_of_positions?: number;
  spread?: number;
  dist_max?: number;
  dist_min?: number;
}

export class PositionGenerator {
  positions: number[][] = [];
  i: number = 0;
  on_used_up: string = 'nothing';
  on_patch_done: string = 'reset';
  rejection_function?: (x: number, y: number) => boolean;

  constructor(options: PositionGeneratorOptions) {
    if (options.on_used_up) this.on_used_up = options.on_used_up;
    if (options.on_patch_done) this.on_patch_done = options.on_patch_done;
    this.rejection_function = options.rejection_function;
  }

  generate() {
    // To be implemented by subclasses
  }

  reset() {
    this.generate();
  }

  rewind() {
    this.i = 0;
  }

  next(): { x: number, y: number } | undefined {
    let next_p: number[] | undefined;
    
    if (this.i < this.positions.length) {
      next_p = this.positions[this.i++];
    } else {
      if (this.on_used_up === 'reset') {
        this.reset();
        next_p = this.positions[this.i++];
      } else if (this.on_used_up === 'rewind') {
        this.rewind();
        next_p = this.positions[this.i++];
      } else {
        // Default fallback or undefined behavior
        next_p = [0, 0];
      }
    }

    if (next_p && this.rejection_function) {
      if (this.rejection_function(next_p[0], next_p[1])) {
        return this.next();
      }
    }
    
    return next_p ? { x: next_p[0], y: next_p[1] } : undefined;
  }

  give_back(position: number[]) {
    this.positions.push(position);
    shuffle(this.positions);
  }
}

export class JitteredGridCoordinates extends PositionGenerator {
  columns: number;
  rows: number;
  horizontal_spacing: number;
  vertical_spacing: number;
  horizontal_jitter: number;
  vertical_jitter: number;
  horizontal_offset: number;
  vertical_offset: number;

  constructor(options: PositionGeneratorOptions) {
    super(options);
    this.columns = options.columns || 1;
    this.rows = options.rows || 1;
    this.horizontal_spacing = options.hspacing || 1;
    this.vertical_spacing = options.vspacing || 1;
    this.horizontal_jitter = options.hjitter || 0;
    this.vertical_jitter = options.vjitter || 0;
    this.horizontal_offset = options.hoffset || 0;
    this.vertical_offset = options.voffset || 0;
    
    this.generate();
  }

  generate() {
    this.i = 0;
    this.positions = [];
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        let x_pos = Math.floor((x - this.columns / 2) * this.horizontal_spacing) + this.horizontal_offset;
        x_pos += Math.floor(Math.random() * this.horizontal_jitter - this.horizontal_jitter / 2);
        
        let y_pos = Math.floor((y - this.rows / 2) * this.vertical_spacing) + this.vertical_offset;
        y_pos += Math.floor(Math.random() * this.vertical_jitter - this.vertical_jitter / 2);
        
        this.positions.push([x_pos, y_pos]);
      }
    }
    shuffle(this.positions);
  }
}

export class JitteredPerspectiveGridCoordinates extends PositionGenerator {
  // Reuse properties from JitteredGridCoordinates + perspective
  columns: number;
  rows: number;
  horizontal_spacing: number;
  vertical_spacing: number;
  horizontal_jitter: number;
  vertical_jitter: number;
  horizontal_offset: number;
  vertical_offset: number;
  perspective_factor: number;

  constructor(options: PositionGeneratorOptions) {
    super(options);
    this.columns = options.columns || 1;
    this.rows = options.rows || 1;
    this.horizontal_spacing = options.hspacing || 1;
    this.vertical_spacing = options.vspacing || 1;
    this.horizontal_jitter = options.hjitter || 0;
    this.vertical_jitter = options.vjitter || 0;
    this.horizontal_offset = options.hoffset || 0;
    this.vertical_offset = options.voffset || 0;
    this.perspective_factor = options.perspective_factor || 0.2;

    this.generate();
  }

  generate() {
    this.i = 0;
    this.positions = [];
    let adjustment_factor = 1;
    for (let y = 0; y < this.rows; y++) {
      const adjustment = (this.perspective_factor * this.columns) * y;
      adjustment_factor = adjustment_factor * (1 + this.perspective_factor);
      for (let x = 0; x < this.columns / adjustment_factor; x++) {
        let x_pos = Math.floor((x - this.columns / 2) * this.horizontal_spacing * adjustment_factor) + this.horizontal_offset;
        x_pos += Math.floor(Math.random() * (this.horizontal_jitter * adjustment_factor) - this.horizontal_jitter / 2);
        
        let y_pos = Math.floor((y - this.rows / 2) * this.vertical_spacing) + this.vertical_offset;
        y_pos += Math.floor(Math.random() * this.vertical_jitter - this.vertical_jitter / 2);
        
        this.positions.push([x_pos, y_pos]);
      }
    }
    shuffle(this.positions);
  }
}

export class RandomSparsePositions extends PositionGenerator {
  number_of_positions: number;
  spread: number;
  dist_max: number;
  dist_min: number;

  constructor(options: PositionGeneratorOptions) {
    super(options);
    this.number_of_positions = options.number_of_positions || 1;
    this.spread = options.spread || 400;
    this.dist_max = options.dist_max || 100;
    this.dist_min = options.dist_min || 10;
    this.generate();
  }

  generate() {
    this.i = 0;
    this.positions = [[0, 0]];
    const qs = [[-1, -1], [-1, +1], [+1, +1], [+1, -1]]; // Signs of the quadrants
    let nq = 0; // 'next quadrant'
    let attempts = 0;
    
    while (this.positions.length < this.number_of_positions + 1) {
      attempts += 1;
      if (attempts > 5000) break; // Safety break

      let next_candidate = [
          Math.random() * qs[nq][0] * this.spread, 
          Math.random() * qs[nq][1] * this.spread
      ];
      
      let distances_list = this.positions.map(p => 
        Math.sqrt(Math.pow(p[0] - next_candidate[0], 2) + Math.pow(p[1] - next_candidate[1], 2))
      );

      if (Math.min(...distances_list) >= this.dist_min && Math.max(...distances_list) <= this.dist_max) {
        this.positions.push(next_candidate);
        nq = (nq + 1) % 4; 
      }
    }
    this.positions.shift(); // Remove the initial [0,0] dummy if strictly sparse around center
  }
}