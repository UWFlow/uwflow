import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

const linkVariants = cva(
  'cursor-pointer font-inter text-md font-semibold underline transition-all duration-hover ease-hover hover:brightness-hover-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  {
    variants: {
      tone: {
        primary: 'text-primary',
        course: 'text-courses',
        professor: 'text-professors',
      },
    },
    defaultVariants: {
      tone: 'primary',
    },
  },
);

interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  asChild?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ asChild = false, className, tone, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <Comp
        ref={ref}
        className={cn(linkVariants({ tone, className }))}
        {...props}
      />
    );
  },
);
Link.displayName = 'Link';

export { Link, linkVariants };
