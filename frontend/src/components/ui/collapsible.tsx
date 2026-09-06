import React from 'react';
import { ChevronDown } from 'react-feather';

import { cn } from 'lib/utils';

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
}
const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null,
);

function useCollapsible() {
  const context = React.useContext(CollapsibleContext);
  if (!context)
    throw new Error('Collapsible components must be used within Collapsible');
  return context;
}

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    {
      defaultOpen = false,
      open: controlledOpen,
      onOpenChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const toggle = () => {
      const nextOpen = !open;
      if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    };
    return (
      <CollapsibleContext.Provider value={{ open, toggle }}>
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-card bg-white shadow-box',
            className,
          )}
          {...props}
        />
      </CollapsibleContext.Provider>
    );
  },
);
Collapsible.displayName = 'Collapsible';

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { open, toggle } = useCollapsible();
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      className={cn(
        'relative box-border flex h-16 w-full cursor-pointer items-center justify-center border-0 border-solid bg-white pl-16 pr-16 font-anderson text-xl font-semibold text-dark1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
        className,
      )}
      onClick={(event) => {
        toggle();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
      <span className="absolute right-0 top-0 flex h-16 w-16 items-center justify-center rounded-tr-card bg-light3 text-dark2 hover:brightness-hover">
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'transition-transform duration-300',
            !open && 'rotate-180',
          )}
        />
      </span>
    </button>
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = useCollapsible();
  if (!open) return null;
  return (
    <div ref={ref} className={cn('bg-white p-xl', className)} {...props} />
  );
});
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
