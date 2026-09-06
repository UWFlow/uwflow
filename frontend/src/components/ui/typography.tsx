import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

const headingVariants = cva('m-0 font-anderson font-extrabold text-dark1', {
  variants: {
    size: {
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-4xl',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h2', size, className, ...props }, ref) => {
    const Comp: React.ElementType = as;
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ size }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';

const textVariants = cva('m-0 font-inter text-dark2', {
  variants: {
    size: { xs: 'text-xs', sm: 'text-sm', md: 'text-md', lg: 'text-lg' },
    weight: { regular: 'font-regular', semibold: 'font-semibold' },
    tone: {
      default: 'text-dark2',
      strong: 'text-dark1',
      muted: 'text-dark3',
      danger: 'text-red',
    },
  },
  defaultVariants: { size: 'md', weight: 'regular', tone: 'default' },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ as = 'p', size, weight, tone, className, ...props }, ref) => {
    const Comp: React.ElementType = as;
    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ size, weight, tone }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = 'Text';

export { Heading, Text, headingVariants, textVariants };
