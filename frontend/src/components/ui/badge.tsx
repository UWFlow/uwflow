import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

const badgeVariants = cva(
  'box-border inline-flex items-center rounded-card border-2 border-solid px-sm py-xs font-inter text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'border-light4 bg-light2 text-dark1',
        primary: 'border-primary bg-primary text-white',
        course: 'border-courses bg-courses text-white',
        professor: 'border-professors bg-professors text-white',
        danger: 'border-red bg-red text-white',
        outline: 'border-light3 bg-white text-dark1',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
