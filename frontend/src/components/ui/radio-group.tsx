import React from 'react';
import { Check } from 'react-feather';

import { cn } from 'lib/utils';

export type RadioGroupProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement>;

const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <fieldset
      ref={ref}
      className={cn('m-0 flex min-w-0 flex-col gap-sm border-0 p-0', className)}
      {...props}
    />
  ),
);
RadioGroup.displayName = 'RadioGroup';

export type RadioProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & { tone?: 'primary' | 'course' | 'professor' };

const checkedClasses = {
  primary: 'checked:border-primary checked:bg-primary',
  course: 'checked:border-courses checked:bg-courses',
  professor: 'checked:border-professors checked:bg-professors',
};

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, tone = 'primary', ...props }, ref) => (
    <span className="relative inline-flex h-xl w-xl shrink-0">
      <input
        ref={ref}
        type="radio"
        className={cn(
          'peer m-0 h-xl w-xl cursor-pointer appearance-none rounded-full border-[3px] border-solid border-light4 bg-light2 shadow-box transition-all hover:brightness-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checkedClasses[tone],
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute left-[4px] top-[4px] hidden text-white peer-checked:block"
        size={24}
        strokeWidth={3}
      />
    </span>
  ),
);
Radio.displayName = 'Radio';

export { Radio, RadioGroup };
