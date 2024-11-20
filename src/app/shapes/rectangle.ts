import { ShapeBase } from './base';

export interface Rectangle extends ShapeBase {
  type: 'rectangle';
  cornerRadius?: number;
}

export const createRectangle = (x: number, y: number, props: Partial<Rectangle> = {}): Rectangle => {
  return {
    id: Date.now().toString(),
    type: 'rectangle',
    x,
    y,
    width: 100,
    height: 60,
    cornerRadius: 0,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    isSelected: false,
    ...props,
  };
};

export const renderRectangle = (context: CanvasRenderingContext2D, shape: Rectangle) => {
  if (shape.cornerRadius) {
    roundedRect(context, shape.x, shape.y, shape.width, shape.height, shape.cornerRadius);
  } else {
    context.rect(shape.x, shape.y, shape.width, shape.height);
  }
  if (shape.fill !== 'transparent') {
    context.fill();
  }
  context.stroke();
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}; 