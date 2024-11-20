import { ShapeBase } from './base';

export interface Line extends ShapeBase {
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  dashArray?: number[];
}

export const createLine = (x: number, y: number, props: Partial<Line> = {}): Line => {
  return {
    id: Date.now().toString(),
    type: 'line',
    x,
    y,
    width: 100,
    height: 2,
    startX: x,
    startY: y,
    endX: x + 100,
    endY: y,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    isSelected: false,
    ...props,
  };
};

export const renderLine = (context: CanvasRenderingContext2D, shape: Line) => {
  context.beginPath();
  if (shape.dashArray) {
    context.setLineDash(shape.dashArray);
  }
  context.moveTo(shape.startX, shape.startY);
  context.lineTo(shape.endX, shape.endY);
  context.stroke();
  context.setLineDash([]);
}; 