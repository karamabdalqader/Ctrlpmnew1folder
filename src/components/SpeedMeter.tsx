import React from 'react';
import { Box, useTheme } from '@mui/material';

interface SpeedMeterProps {
  value: number;
  size?: number;
  thickness?: number;
}

const SpeedMeter: React.FC<SpeedMeterProps> = ({
  value,
  size = 200,
  thickness = 6
}) => {
  const theme = useTheme();
  const radius = (size - thickness) / 2;
  const center = size / 2;

  const getColor = (val: number) => {
    if (val >= 80) return theme.palette.success.main;
    if (val >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Convert angle to radians
  const toRadians = (angle: number) => angle * (Math.PI / 180);

  // Convert polar coordinates to cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = toRadians(angleInDegrees - 90);
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Calculate needle position
  const needleAngle = -90 + (value * 180) / 100;
  const needlePoint = polarToCartesian(center, center, radius - 15, needleAngle);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size
    }}>
      <svg
        width={size}
        height={size}
        style={{
          overflow: 'visible',
        }}
      >
        {/* Tick marks and numbers */}
        {Array.from({ length: 11 }, (_, i) => i * 10).map((tick) => {
          const angle = -90 + (tick * 180) / 100;
          const outerPoint = polarToCartesian(center, center, radius, angle);
          const innerPoint = polarToCartesian(center, center, radius - 10, angle);
          const textPoint = polarToCartesian(center, center, radius - 25, angle);
          
          return (
            <React.Fragment key={tick}>
              <line
                x1={outerPoint.x}
                y1={outerPoint.y}
                x2={innerPoint.x}
                y2={innerPoint.y}
                stroke={theme.palette.text.secondary}
                strokeWidth={1.5}
              />
              <text
                x={textPoint.x}
                y={textPoint.y}
                textAnchor="middle"
                fill={theme.palette.text.secondary}
                style={{ fontSize: '12px' }}
              >
                {tick}
              </text>
            </React.Fragment>
          );
        })}

        {/* Background Arc */}
        <path
          d={`
            M ${thickness / 2} ${center}
            A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${center}
          `}
          fill="none"
          stroke={theme.palette.grey[200]}
          strokeWidth={thickness}
        />

        {/* Colored segments */}
        {[
          { start: 0, end: 60, color: theme.palette.error.main },
          { start: 60, end: 80, color: theme.palette.warning.main },
          { start: 80, end: 100, color: theme.palette.success.main }
        ].map((segment, index) => {
          const startAngle = -90 + (segment.start * 180) / 100;
          const endAngle = -90 + (segment.end * 180) / 100;
          const start = polarToCartesian(center, center, radius, startAngle);
          const end = polarToCartesian(center, center, radius, endAngle);
          
          return (
            <path
              key={index}
              d={`
                M ${start.x} ${start.y}
                A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}
              `}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={needlePoint.x}
          y2={needlePoint.y}
          stroke={theme.palette.text.primary}
          strokeWidth={2}
        />
        
        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r={5}
          fill={theme.palette.text.primary}
        />

        {/* Value text */}
        <text
          x={center}
          y={center + radius - 30}
          textAnchor="middle"
          fill={theme.palette.text.primary}
          style={{ 
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          {value}%
        </text>
      </svg>
    </Box>
  );
};

export default SpeedMeter;
