import { PieceStyle } from '@/contexts/ThemeContext';

interface PieceProps {
  x: number;
  y: number;
  color: string;
  style: PieceStyle;
  size?: number;
  opacity?: number;
}

export default function Piece({ x, y, color, style, size = 15, opacity = 1 }: PieceProps) {
  const renderPiece = () => {
    switch (style) {
      case 'circle':
        return (
          <circle
            cx={x}
            cy={y}
            r={size}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );

      case 'square':
        return (
          <rect
            x={x - size}
            y={y - size}
            width={size * 2}
            height={size * 2}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );

      case 'hexagon':
        const hexPoints = getHexagonPoints(x, y, size);
        return (
          <polygon
            points={hexPoints}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );

      case 'triangle':
        const triPoints = getTrianglePoints(x, y, size);
        return (
          <polygon
            points={triPoints}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );

      case 'star':
        const starPoints = getStarPoints(x, y, size);
        return (
          <polygon
            points={starPoints}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );

      case 'diamond':
        const diamondPoints = getDiamondPoints(x, y, size);
        return (
          <polygon
            points={diamondPoints}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );

      default:
        return (
          <circle
            cx={x}
            cy={y}
            r={size}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={opacity}
          />
        );
    }
  };

  return <>{renderPiece()}</>;
}

function getHexagonPoints(x: number, y: number, size: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    points.push([
      x + size * Math.cos(angle),
      y + size * Math.sin(angle),
    ]);
  }
  return points.map(p => p.join(',')).join(' ');
}

function getTrianglePoints(x: number, y: number, size: number): string {
  return [
    [x, y - size * 1.2],
    [x - size, y + size * 0.6],
    [x + size, y + size * 0.6],
  ].map(p => p.join(',')).join(' ');
}

function getStarPoints(x: number, y: number, size: number): string {
  const points: [number, number][] = [];
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push([
      x + radius * Math.cos(angle),
      y + radius * Math.sin(angle),
    ]);
  }
  return points.map(p => p.join(',')).join(' ');
}

function getDiamondPoints(x: number, y: number, size: number): string {
  return [
    [x, y - size * 1.2],
    [x - size * 0.7, y],
    [x, y + size * 1.2],
    [x + size * 0.7, y],
  ].map(p => p.join(',')).join(' ');
}
