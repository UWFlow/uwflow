import React from 'react';

import { cn } from 'lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, className, ...props }, ref) => {
    const safeMax = max > 0 ? max : 100;
    const safeValue = Math.min(Math.max(value, 0), safeMax);
    const percentage = (safeValue / safeMax) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className={cn(
          'h-md w-full overflow-hidden rounded-card bg-light3 shadow-box',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full bg-primary transition-all',
            percentage >= 100 ? 'rounded-card' : 'rounded-l-card',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress };
