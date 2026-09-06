import React from 'react';

import { cn } from 'lib/utils';

interface TabsContextValue {
  id: string;
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within Tabs');
  return context;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue = '',
      value: controlledValue,
      onValueChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState(defaultValue);
    const id = React.useId();
    const value = controlledValue ?? uncontrolledValue;
    const setValue = (nextValue: string) => {
      if (controlledValue === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };

    return (
      <TabsContext.Provider value={{ id, value, setValue }}>
        <div ref={ref} className={className} {...props} />
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onKeyDown, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      'flex w-full overflow-hidden rounded-t-card bg-light3 shadow-bottom-box',
      className,
    )}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
      )
        return;
      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]:not(:disabled)',
        ),
      );
      const currentIndex = tabs.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const nextIndex =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
          ? tabs.length - 1
          : (currentIndex +
              (event.key === 'ArrowRight' ? 1 : -1) +
              tabs.length) %
            tabs.length;
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
      event.preventDefault();
    }}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value: triggerValue, className, onClick, ...props }, ref) => {
    const { id, value, setValue } = useTabs();
    const selected = value === triggerValue;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${id}-tab-${triggerValue}`}
        aria-controls={`${id}-panel-${triggerValue}`}
        aria-selected={selected}
        tabIndex={selected ? 0 : -1}
        className={cn(
          'box-border h-16 flex-1 cursor-pointer border-0 border-solid bg-light3 px-sm font-anderson text-xl font-regular text-dark2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
          selected && 'bg-white font-semibold text-dark1',
          !selected && 'hover:brightness-hover',
          className,
        )}
        onClick={(event) => {
          setValue(triggerValue);
          onClick?.(event);
        }}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value: contentValue, className, ...props }, ref) => {
    const { id, value } = useTabs();
    if (value !== contentValue) return null;
    return (
      <div
        ref={ref}
        id={`${id}-panel-${contentValue}`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${contentValue}`}
        className={cn('focus-visible:outline-none', className)}
        {...props}
      />
    );
  },
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsContent, TabsList, TabsTrigger };
