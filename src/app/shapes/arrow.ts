import { ShapeBase } from './base';

export interface Arrow extends ShapeBase {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  headSize: number;
  dashArray?: number[];
}

export const createArrow = (x: number, y: number, props: Partial<Arrow> = {}): Arrow => {
  return {
    id: Date.now().toString(),
    type: 'arrow',
    x,
    y,
    width: 100,
    height: 2,
    startX: x,
    startY: y,
    endX: x + 100,
    endY: y,
    headSize: 10,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    isSelected: false,
    ...props,
  };
};

export const renderArrow = (context: CanvasRenderingContext2D, shape: Arrow) => {
  const dx = shape.endX - shape.startX;
  const dy = shape.endY - shape.startY;
  const angle = Math.atan2(dy, dx);
  
  // Draw the line
  context.beginPath();
  if (shape.dashArray) {
    context.setLineDash(shape.dashArray);
  }
  context.moveTo(shape.startX, shape.startY);
  context.lineTo(shape.endX, shape.endY);
  context.stroke();
  context.setLineDash([]);

  // Draw the arrow head
  context.beginPath();
  context.moveTo(shape.endX, shape.endY);
  context.lineTo(
    shape.endX - shape.headSize * Math.cos(angle - Math.PI / 6),
    shape.endY - shape.headSize * Math.sin(angle - Math.PI / 6)
  );
  context.lineTo(
    shape.endX - shape.headSize * Math.cos(angle + Math.PI / 6),
    shape.endY - shape.headSize * Math.sin(angle + Math.PI / 6)
  );
  context.closePath();
  context.fillStyle = shape.stroke;
  context.fill();
}; 