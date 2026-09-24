import React from 'react';
import { ThumbsDown, ThumbsUp } from 'react-feather';

import { cn } from 'lib/utils';

export type ThumbValue = 'up' | 'down' | null;

export interface ThumbToggleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  defaultValue?: ThumbValue;
  value?: ThumbValue;
  onValueChange?: (value: ThumbValue) => void;
  color?: 'primary' | 'course' | 'professor';
}

const selectedClasses = {
  primary: 'border-primary bg-primary',
  course: 'border-courses bg-courses',
  professor: 'border-professors bg-professors',
};

const ThumbToggle = React.forwardRef<HTMLDivElement, ThumbToggleProps>(
  (
    {
      defaultValue = null,
      value: controlledValue,
      onValueChange,
      color = 'primary',
      className,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState<ThumbValue>(defaultValue);
    const value =
      controlledValue === undefined ? uncontrolledValue : controlledValue;
    const update = (nextValue: Exclude<ThumbValue, null>) => {
      const resolved = value === nextValue ? null : nextValue;
      if (controlledValue === undefined) setUncontrolledValue(resolved);
      onValueChange?.(resolved);
    };
    return (
      <div
        ref={ref}
        className={cn('inline-flex h-xl w-[72px]', className)}
        role="group"
        aria-label="Rating"
        {...props}
      >
        {(['up', 'down'] as const).map((option) => {
          const selected = value === option;
          const Icon = option === 'up' ? ThumbsUp : ThumbsDown;
          return (
            <button
              aria-label={option === 'up' ? 'Thumbs Up' : 'Thumbs Down'}
              aria-pressed={selected}
              className={cn(
                'box-border grid h-full w-1/2 cursor-pointer place-items-center border-2 border-solid border-light4 bg-light1 text-dark3 first:rounded-l-[8px] last:-ml-[2px] last:rounded-r-[8px] hover:brightness-hover focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selected && cn(selectedClasses[color], 'z-10 text-white'),
              )}
              key={option}
              onClick={() => update(option)}
              type="button"
            >
              <Icon aria-hidden="true" size={16} strokeWidth={3} />
            </button>
          );
        })}
      </div>
    );
  },
);
ThumbToggle.displayName = 'ThumbToggle';

export { ThumbToggle };
