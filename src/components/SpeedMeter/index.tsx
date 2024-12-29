import React from 'react';
import { Box, useTheme } from '@mui/material';

interface SpeedMeterProps {
  value: number; // 0-100
  size?: number;
  thickness?: number;
  showGradient?: boolean;
}

const SpeedMeter: React.FC<SpeedMeterProps> = ({ 
  value, 
  size = 100, 
  thickness = 6,
  showGradient = true
}) => {
  const theme = useTheme();
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getGradientId = () => `speedMeterGradient-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = getGradientId();

  const getColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Calculate needle rotation (from -90 to 90 degrees)
  const needleRotation = -90 + (180 * value) / 100;

  // Calculate tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);
  const tickLength = thickness * 1.5;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size / 2 + tickLength,
        overflow: 'visible',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: 'translateY(0%)',
          overflow: 'visible',
        }}
      >
        {showGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: theme.palette.error.main }} />
              <stop offset="50%" style={{ stopColor: theme.palette.warning.main }} />
              <stop offset="100%" style={{ stopColor: theme.palette.success.main }} />
            </linearGradient>
          </defs>
        )}

        {/* Tick marks */}
        {ticks.map((tick) => {
          const angle = -90 + (180 * tick) / 100;
          const x1 = size / 2 + (radius + thickness / 2) * Math.cos((angle * Math.PI) / 180);
          const y1 = size / 2 + (radius + thickness / 2) * Math.sin((angle * Math.PI) / 180);
          const x2 = size / 2 + (radius + tickLength + thickness / 2) * Math.cos((angle * Math.PI) / 180);
          const y2 = size / 2 + (radius + tickLength + thickness / 2) * Math.sin((angle * Math.PI) / 180);
          
          return (
            <React.Fragment key={tick}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={theme.palette.text.secondary}
                strokeWidth={thickness / 4}
                strokeLinecap="round"
              />
              <text
                x={x2}
                y={y2 + thickness}
                textAnchor="middle"
                fill={theme.palette.text.secondary}
                style={{ fontSize: `${thickness * 1.5}px` }}
              >
                {tick}
              </text>
            </React.Fragment>
          );
        })}

        {/* Background Arc */}
        <path
          d={`
            M ${thickness / 2} ${size / 2}
            A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}
          `}
          fill="none"
          stroke={theme.palette.grey[200]}
          strokeWidth={thickness}
          strokeLinecap="round"
        />

        {/* Value Arc */}
        <path
          d={`
            M ${thickness / 2} ${size / 2}
            A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}
          `}
          fill="none"
          stroke={showGradient ? `url(#${gradientId})` : getColor(value)}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.3s ease',
          }}
        />

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${needleRotation}deg)`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transition: 'transform 0.3s ease',
          }}
        >
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={thickness * 2}
            stroke={theme.palette.text.primary}
            strokeWidth={thickness / 2}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={thickness * 0.8}
            fill={getColor(value)}
          />
        </g>

        {/* Value Text */}
        <text
          x={size / 2}
          y={size - thickness * 2}
          textAnchor="middle"
          fill={theme.palette.text.primary}
          style={{
            fontSize: `${thickness * 3}px`,
            fontWeight: 'bold',
          }}
        >
          {value}%
        </text>
      </svg>
    </Box>
  );
};

export default SpeedMeter;
