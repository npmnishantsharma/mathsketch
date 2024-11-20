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