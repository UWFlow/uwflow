import React from 'react';

import { cn } from 'lib/utils';

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: React.ReactNode;
}

const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ content, children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('group relative inline-flex', className)}
      {...props}
    >
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-sm hidden -translate-x-1/2 whitespace-nowrap rounded-card bg-dark1 px-sm py-xs font-inter text-xs text-white shadow-dropdown group-hover:block group-focus-within:block"
      >
        {content}
      </span>
    </span>
  ),
);
Tooltip.displayName = 'Tooltip';

export { Tooltip };
