import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidTubeChartProps {
  percentage: number;
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'accent';
  height?: number;
}

export const LiquidTubeChart = ({ 
  percentage, 
  label, 
  color = 'primary',
  height = 200 
}: LiquidTubeChartProps) => {
  const colorClasses = {
    primary: 'from-primary via-primary-light to-primary-dark',
    success: 'from-success via-accent-light to-accent',
    warning: 'from-warning via-warning to-warning-light',
    accent: 'from-accent via-success to-accent-light'
  };

  const glowClasses = {
    primary: 'shadow-[0_0_20px_hsl(var(--primary)/0.4)]',
    success: 'shadow-[0_0_20px_hsl(var(--success)/0.4)]',
    warning: 'shadow-[0_0_20px_hsl(var(--warning)/0.4)]',
    accent: 'shadow-[0_0_20px_hsl(var(--accent)/0.4)]'
  };

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div 
        className="relative w-16 rounded-full overflow-hidden border-2 border-border/50 bg-muted/30 backdrop-blur-sm"
        style={{ height: `${height}px` }}
      >
        {/* Liquid fill with animation */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t rounded-full transition-all duration-1000 ease-out",
            colorClasses[color],
            glowClasses[color]
          )}
          style={{ 
            height: `${percentage}%`,
            animation: 'liquidRise 1.5s ease-out'
          }}
        >
          {/* Animated liquid surface */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/20 to-transparent animate-[wave_3s_ease-in-out_infinite]" />
          <div className="absolute top-1 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-transparent animate-[wave_3s_ease-in-out_infinite] delay-300" />
        </div>

        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        {/* Percentage label inside tube */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground mix-blend-difference">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="text-sm font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
        {label}
      </span>
    </div>
  );
};

// Multiple tubes comparison
interface LiquidTubeComparisonProps {
  data: Array<{
    label: string;
    percentage: number;
    color?: 'primary' | 'success' | 'warning' | 'accent';
  }>;
  height?: number;
}

export const LiquidTubeComparison = ({ data, height = 180 }: LiquidTubeComparisonProps) => {
  return (
    <div className="flex justify-around items-end gap-6 p-6 rounded-xl bg-gradient-to-br from-card to-card-hover border border-border/50 backdrop-blur-sm">
      {data.map((item, index) => (
        <LiquidTubeChart
          key={index}
          label={item.label}
          percentage={item.percentage}
          color={item.color}
          height={height}
        />
      ))}
    </div>
  );
};