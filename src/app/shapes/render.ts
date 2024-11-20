import { Shape } from './types';

export const renderShape = (context: CanvasRenderingContext2D, shape: Shape) => {
  context.save();
  context.beginPath();
  context.globalAlpha = shape.opacity;
  context.strokeStyle = shape.stroke;
  context.fillStyle = shape.fill;
  context.lineWidth = shape.strokeWidth;

  // Translate to shape center for rotation
  context.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
  context.rotate((shape.rotation * Math.PI) / 180);
  context.translate(-(shape.x + shape.width / 2), -(shape.y + shape.height / 2));

  switch (shape.type) {
    case 'rectangle':
      if (shape.cornerRadius) {
        roundedRect(context, shape.x, shape.y, shape.width, shape.height, shape.cornerRadius);
      } else {
        context.rect(shape.x, shape.y, shape.width, shape.height);
      }
      break;
      
    case 'circle':
      context.arc(
        shape.x + shape.width / 2,
        shape.y + shape.height / 2,
        shape.radius,
        0,
        2 * Math.PI
      );
      break;

    case 'triangle':
      context.moveTo(shape.x + shape.points[0][0], shape.y + shape.points[0][1]);
      shape.points.slice(1).forEach(point => {
        context.lineTo(shape.x + point[0], shape.y + point[1]);
      });
      context.closePath();
      break;

    // Add more shape rendering logic here...
  }

  if (shape.fill !== 'transparent') {
    context.fill();
  }
  context.stroke();

  // Draw selection outline if selected
  if (shape.isSelected) {
    context.strokeStyle = '#0066ff';
    context.lineWidth = 2;
    context.setLineDash([5, 5]);
    context.strokeRect(
      shape.x - 4,
      shape.y - 4,
      shape.width + 8,
      shape.height + 8
    );
  }

  context.restore();
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
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