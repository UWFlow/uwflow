import React, { ReactNode, useState } from 'react';

import { cn } from 'lib/utils';

import { Button } from './button';

export interface TourStep {
  heading: string;
  body: ReactNode;
  illustration?: ReactNode;
}

export interface TourContentProps extends React.HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  steps: readonly TourStep[];
  onRequestClose: () => void;
}

// The modal host owns focus trapping, dismissal, and any persistence. Keeping
// this content separate lets existing modals and design-system dialogs reuse it.
export const TourContent = React.forwardRef<HTMLDivElement, TourContentProps>(
  ({ label, steps, onRequestClose, className, ...props }, ref) => {
    const [step, setStep] = useState(0);
    const current = Math.min(step, steps.length - 1);
    if (!steps.length) return null;
    const isLastStep = current === steps.length - 1;

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          'flex w-96 max-w-[90vw] flex-col overflow-hidden rounded-xl bg-white',
          className,
        )}
      >
        {steps[current].illustration}
        <div className="flex flex-col p-lg">
          <div className="mb-sm flex items-center gap-sm text-xs font-semibold uppercase tracking-wide text-primary">
            {label}
          </div>
          <div aria-live="polite" aria-atomic="true">
            <h2 className="mb-sm text-2xl font-semibold text-dark1">
              {steps[current].heading}
            </h2>
            <p className="mb-lg text-sm leading-normal text-dark2">
              {steps[current].body}
            </p>
            <span className="sr-only">
              Step {current + 1} of {steps.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <div className="flex items-center gap-xs" aria-hidden="true">
              {steps.map((item, index) => (
                <span
                  key={item.heading}
                  className={cn(
                    'h-xs rounded-full',
                    index === current ? 'w-5 bg-primary' : 'w-xs bg-light3',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-sm">
              {!isLastStep && (
                <Button variant="subtle" size="sm" onClick={onRequestClose}>
                  Skip
                </Button>
              )}
              <Button
                size="sm"
                onClick={() =>
                  isLastStep ? onRequestClose() : setStep(current + 1)
                }
              >
                {isLastStep ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
TourContent.displayName = 'TourContent';
