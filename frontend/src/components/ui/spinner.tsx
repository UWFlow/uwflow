import React from 'react';

import LoadingSpinner from 'components/display/LoadingSpinner';
import { cn } from 'lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const spinnerSizes = {
  sm: 24,
  md: 32,
  lg: 48,
} as const;

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ label = 'Loading', size = 'md', className, ...props }, ref) => (
    <span
      ref={ref}
      aria-label={label}
      className={cn('inline-flex', className)}
      role="status"
      {...props}
    >
      <LoadingSpinner
        margin="0"
        size={spinnerSizes[size]}
        strokeWidth={size === 'sm' ? 3 : 4}
      />
    </span>
  ),
);
Spinner.displayName = 'Spinner';

export { Spinner };
