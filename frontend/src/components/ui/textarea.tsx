import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

const textareaVariants = cva(
  'h-20 w-full appearance-none resize-none rounded-card border-0 border-solid bg-light2 px-md py-sm text-body text-dark1 shadow-box placeholder:text-dark3 disabled:cursor-not-allowed disabled:text-light4',
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

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, 'aria-invalid': ariaInvalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? (state === 'error' ? true : undefined)}
      className={cn(textareaVariants({ state, className }))}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
