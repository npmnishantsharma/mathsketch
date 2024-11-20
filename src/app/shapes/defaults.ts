import { Shape, ShapeType } from './types';

export const defaultShapeProps: Record<ShapeType, Partial<Shape>> = {
  rectangle: {
    width: 100,
    height: 60,
    cornerRadius: 0,
  },
  circle: {
    width: 80,
    height: 80,
    radius: 40,
  },
  triangle: {
    width: 80,
    height: 80,
    points: [[40, 0], [0, 80], [80, 80]],
  },
  line: {
    width: 100,
    height: 2,
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 0,
  },
  arrow: {
    width: 100,
    height: 2,
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 0,
    headSize: 10,
  },
  diamond: {
    width: 80,
    height: 80,
    points: [[40, 0], [80, 40], [40, 80], [0, 40]],
  },
  pentagon: {
    width: 80,
    height: 80,
    points: [[40, 0], [80, 30], [65, 80], [15, 80], [0, 30]],
  },
  hexagon: {
    width: 80,
    height: 80,
    points: [[20, 0], [60, 0], [80, 40], [60, 80], [20, 80], [0, 40]],
  },
  star: {
    width: 80,
    height: 80,
    points: 5,
    innerRadius: 20,
    outerRadius: 40,
  },
  cloud: {
    width: 100,
    height: 60,
    bubbles: 6,
    bubbleRadius: 15,
  },
  heart: {
    width: 80,
    height: 80,
    controlPoints: [[40, 20], [20, 0], [0, 20], [40, 80]],
  },
  lightning: {
    width: 60,
    height: 100,
    segments: 4,
    zigzagOffset: 15,
  },
  bracket: {
    width: 20,
    height: 100,
    orientation: 'left',
    curvature: 20,
  },
  brace: {
    width: 30,
    height: 100,
    orientation: 'left',
    curvature: 20,
  },
  infinity: {
    width: 100,
    height: 40,
    loopWidth: 30,
    loopHeight: 20,
  },
};

export const createShape = (type: ShapeType, x: number, y: number, props: Partial<Shape> = {}): Shape => {
  return {
    id: Date.now().toString(),
    type,
    x,
    y,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    rotation: 0,
    opacity: 1,
    isSelected: false,
    ...defaultShapeProps[type],
    ...props,
  } as Shape;
}; 