import { ShapeBase } from './base';

export interface Circle extends ShapeBase {
  type: 'circle';
  radius: number;
}

export const createCircle = (x: number, y: number, props: Partial<Circle> = {}): Circle => {
  return {
    id: Date.now().toString(),
    type: 'circle',
    x,
    y,
    width: 80,
    height: 80,
    radius: 40,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    isSelected: false,
    ...props,
  };
};

export const renderCircle = (context: CanvasRenderingContext2D, shape: Circle) => {
  context.beginPath();
  context.arc(
    shape.x + shape.width / 2,
    shape.y + shape.height / 2,
    shape.radius,
    0,
    2 * Math.PI
  );
  if (shape.fill !== 'transparent') {
    context.fill();
  }
  context.stroke();
}; 