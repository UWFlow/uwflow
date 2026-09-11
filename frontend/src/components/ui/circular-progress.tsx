import React from 'react';

import { cn } from 'lib/utils';

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 96, md: 160, lg: 212 } as const;

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(({ label, value, size = 'lg', className, ...props }, ref) => {
  const dimension = sizes[size];
  const safeValue = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div
      ref={ref}
      aria-label={`${label}: ${
        value === null ? 'Not Available' : `${safeValue}%`
      }`}
      className={cn('relative inline-grid place-items-center', className)}
      role="img"
      style={{ height: dimension, width: dimension }}
      {...props}
    >
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="52"
          stroke="currentColor"
          strokeWidth="10"
          className="text-light3"
        />
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="52"
          pathLength="100"
          stroke="currentColor"
          strokeDasharray={`${safeValue} 100`}
          strokeLinecap="round"
          strokeWidth="9"
          className="text-primary"
        />
      </svg>
      <span className="z-10 grid text-center">
        <strong className="font-anderson text-4xl font-extrabold leading-none text-dark1">
          {value === null ? 'N/A' : `${safeValue}%`}
        </strong>
        <span className="mt-sm font-inter text-sm font-light text-dark2">
          {label}
        </span>
      </span>
    </div>
  );
});
CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
