import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

const inputVariants = cva(
  'h-12 w-full min-w-[152px] appearance-none rounded-card border-0 border-solid bg-light2 px-md py-sm text-body text-dark1 placeholder:font-regular placeholder:text-dark3 disabled:cursor-not-allowed disabled:text-light4',
  {
    variants: {
      state: {
        default: '',
        error: 'border border-red text-red placeholder:text-red',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, 'aria-invalid': ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? (state === 'error' ? true : undefined)}
      className={cn(inputVariants({ state, className }))}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input, inputVariants };
