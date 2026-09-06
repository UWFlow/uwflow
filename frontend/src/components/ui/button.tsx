import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

// Variants use the GlobalTheme-derived Tailwind tokens (see tailwind.config.js)
// rather than shadcn's semantic CSS variables, matching this project's palette.
const buttonVariants = cva(
  // The browser's default outset <button> border is removed by the
  // Preflight-style `border-width: 0; border-style: solid` base rule in
  // src/index.css, so variants only flip border-width/-color to opt into one.
  'box-border inline-flex cursor-pointer items-center justify-center gap-xs whitespace-nowrap rounded border-0 border-solid font-inter text-md font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:stroke-current',
  {
    variants: {
      variant: {
        default: 'bg-accent text-dark1 hover:bg-accentDark',
        // Gold CTA matching the app's styled-components Button (theme.accent).
        accent: 'bg-accent text-dark1 hover:bg-accentDark',
        destructive: 'bg-red text-white hover:bg-darkRed',
        neutral:
          'h-12 rounded-[8px] bg-dark3 px-xl font-inter text-md font-medium text-light1 shadow-box hover:brightness-hover',
        filter: 'bg-primary text-white shadow-box hover:bg-primaryDark',
        subtle: 'bg-light2 text-dark1 hover:bg-light3',
        // Mirrors the `Link` mixin in constants/Mixins.tsx rather than
        // shadcn's hover-only underline, so Tailwind and styled-components
        // links look the same. Pair with size="inline" for links in prose.
        link: 'bg-transparent font-inter text-md font-semibold text-primary underline transition-all duration-hover ease-hover hover:brightness-hover-dark',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded px-3',
        lg: 'h-11 rounded px-8',
        icon: 'h-10 w-10',
        // Sits inline with surrounding text: no button box of its own.
        inline: 'h-auto p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
