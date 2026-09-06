import React from 'react';

import { cn } from 'lib/utils';

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ selected = false, className, ...props }, ref) => (
    <button
      ref={ref}
      aria-pressed={selected}
      className={cn(
        'box-border inline-flex h-lg cursor-pointer items-center rounded-[12px] border-2 border-solid border-primary px-[6px] font-inter text-md font-regular text-primary shadow-box transition-colors hover:brightness-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected && 'bg-primary text-white hover:bg-primaryDark',
        className,
      )}
      type="button"
      {...props}
    />
  ),
);
FilterChip.displayName = 'FilterChip';

export { FilterChip };
