import React from 'react';
import { cn } from '@/lib/utils';

interface RadialProgressChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'accent';
  label?: string;
  showValue?: boolean;
}

export const RadialProgressChart = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  label,
  showValue = true
}: RadialProgressChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    accent: 'stroke-accent'
  };

  const glowClasses = {
    primary: 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
    success: 'drop-shadow-[0_0_8px_hsl(var(--success)/0.5)]',
    warning: 'drop-shadow-[0_0_8px_hsl(var(--warning)/0.5)]',
    accent: 'drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]'
  };

  return (
    <div className="relative inline-flex flex-col items-center gap-2 group">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000 ease-out",
            colorClasses[color],
            glowClasses[color]
          )}
          style={{
            animation: 'progressDraw 1.5s ease-out'
          }}
        />
      </svg>

      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {percentage}%
          </span>
        </div>
      )}

      {/* Label */}
      {label && (
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      )}
    </div>
  );
};