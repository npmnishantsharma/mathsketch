import { ShapeBase } from './base';

export interface Triangle extends ShapeBase {
  type: 'triangle';
  points: [number, number][];
}

export const createTriangle = (x: number, y: number, props: Partial<Triangle> = {}): Triangle => {
  return {
    id: Date.now().toString(),
    type: 'triangle',
    x,
    y,
    width: 80,
    height: 80,
    points: [[40, 0], [0, 80], [80, 80]],
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    isSelected: false,
    ...props,
  };
};

export const renderTriangle = (context: CanvasRenderingContext2D, shape: Triangle) => {
  context.beginPath();
  context.moveTo(shape.x + shape.points[0][0], shape.y + shape.points[0][1]);
  shape.points.slice(1).forEach(point => {
    context.lineTo(shape.x + point[0], shape.y + point[1]);
  });
  context.closePath();
  if (shape.fill !== 'transparent') {
    context.fill();
  }
  context.stroke();
}; 