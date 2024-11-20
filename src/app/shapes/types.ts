export interface ShapeBase {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  isSelected: boolean;
}

export type ShapeType = 
  | 'rectangle' 
  | 'circle' 
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'cloud'
  | 'heart'
  | 'lightning'
  | 'bracket'
  | 'brace'
  | 'infinity';

export interface Rectangle extends ShapeBase {
  type: 'rectangle';
  cornerRadius?: number;
}

export interface Circle extends ShapeBase {
  type: 'circle';
  radius: number;
}

export interface Triangle extends ShapeBase {
  type: 'triangle';
  points: [number, number][];
}

export interface Line extends ShapeBase {
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  dashArray?: number[];
}

export interface Arrow extends ShapeBase {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  headSize: number;
  dashArray?: number[];
}

export interface Diamond extends ShapeBase {
  type: 'diamond';
  points: [number, number][];
}

export interface Pentagon extends ShapeBase {
  type: 'pentagon';
  points: [number, number][];
}

export interface Hexagon extends ShapeBase {
  type: 'hexagon';
  points: [number, number][];
}

export interface Star extends ShapeBase {
  type: 'star';
  points: number;
  innerRadius: number;
  outerRadius: number;
}

export interface Cloud extends ShapeBase {
  type: 'cloud';
  bubbles: number;
  bubbleRadius: number;
}

export interface Heart extends ShapeBase {
  type: 'heart';
  controlPoints: [number, number][];
}

export interface Lightning extends ShapeBase {
  type: 'lightning';
  segments: number;
  zigzagOffset: number;
}

export interface Bracket extends ShapeBase {
  type: 'bracket';
  orientation: 'left' | 'right' | 'top' | 'bottom';
  curvature: number;
}

export interface Brace extends ShapeBase {
  type: 'brace';
  orientation: 'left' | 'right' | 'top' | 'bottom';
  curvature: number;
}

export interface Infinity extends ShapeBase {
  type: 'infinity';
  loopWidth: number;
  loopHeight: number;
}

export type Shape = 
  | Rectangle 
  | Circle 
  | Triangle 
  | Line 
  | Arrow 
  | Diamond 
  | Pentagon 
  | Hexagon 
  | Star 
  | Cloud 
  | Heart 
  | Lightning 
  | Bracket 
  | Brace 
  | Infinity; 