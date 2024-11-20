import { Square, Circle, Triangle, ArrowRight, Diamond, Pentagon, Hexagon, Star, Cloud, Heart, Zap, Infinity, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Theme } from "../types";
import { ShapeType } from "../shapes/base";

interface ShapesMenuProps {
  onShapeSelect: (shape: ShapeType) => void;
  theme: Theme;
  currentShape?: ShapeType;
}

const shapes = [
  { type: 'rectangle' as ShapeType, Icon: Square, label: 'Rectangle' },
  { type: 'circle' as ShapeType, Icon: Circle, label: 'Circle' },
  { type: 'triangle' as ShapeType, Icon: Triangle, label: 'Triangle' },
  { type: 'line' as ShapeType, Icon: Minus, label: 'Line' },
  { type: 'arrow' as ShapeType, Icon: ArrowRight, label: 'Arrow' },
  { type: 'diamond' as ShapeType, Icon: Diamond, label: 'Diamond' },
  { type: 'pentagon' as ShapeType, Icon: Pentagon, label: 'Pentagon' },
  { type: 'hexagon' as ShapeType, Icon: Hexagon, label: 'Hexagon' },
  { type: 'star' as ShapeType, Icon: Star, label: 'Star' },
  { type: 'cloud' as ShapeType, Icon: Cloud, label: 'Cloud' },
  { type: 'heart' as ShapeType, Icon: Heart, label: 'Heart' },
  { type: 'lightning' as ShapeType, Icon: Zap, label: 'Lightning' },
  { type: 'infinity' as ShapeType, Icon: Infinity, label: 'Infinity' },
];

export function ShapesMenu({ onShapeSelect, theme, currentShape }: ShapesMenuProps) {
  const CurrentIcon = currentShape ? 
    shapes.find(s => s.type === currentShape)?.Icon || Square : 
    Square;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          style={{ 
            backgroundColor: currentShape ? theme.primary : theme.secondary,
            color: theme.text 
          }}
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        style={{ 
          backgroundColor: theme.background,
          borderColor: theme.primary 
        }}
      >
        <div className="grid grid-cols-3 gap-2 p-2">
          {shapes.map(({ type, Icon, label }) => (
            <Button
              key={type}
              variant="ghost"
              size="icon"
              onClick={() => onShapeSelect(type)}
              style={{ 
                backgroundColor: currentShape === type ? theme.primary : 'transparent',
                color: theme.text 
              }}
              className="h-10 w-10 rounded-lg hover:scale-110 transition-transform"
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 