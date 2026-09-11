import React from 'react';

import { cn } from 'lib/utils';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showSteps?: boolean;
  color?: 'primary' | 'course' | 'professor';
}

const colorClasses = {
  primary: {
    fill: 'bg-primary',
    tick: 'bg-primary',
    thumb:
      '[&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:bg-primary',
  },
  course: {
    fill: 'bg-courses',
    tick: 'bg-courses',
    thumb:
      '[&::-moz-range-thumb]:bg-courses [&::-webkit-slider-thumb]:bg-courses',
  },
  professor: {
    fill: 'bg-professors',
    tick: 'bg-professors',
    thumb:
      '[&::-moz-range-thumb]:bg-professors [&::-webkit-slider-thumb]:bg-professors',
  },
};

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      showSteps = false,
      color = 'primary',
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const numericMin = Number(min);
    const numericMax = Number(max);
    const numericStep = Number(step);
    const [internalValue, setInternalValue] = React.useState(
      Number(defaultValue ?? numericMin),
    );
    const currentValue = value === undefined ? internalValue : Number(value);
    const progress =
      ((currentValue - numericMin) / (numericMax - numericMin)) * 100;
    const stepCount = Math.floor((numericMax - numericMin) / numericStep);
    const ticks =
      showSteps && stepCount <= 20 ? Array.from({ length: stepCount + 1 }) : [];

    return (
      <div className={cn('relative h-xl w-full', className)}>
        <div className="absolute left-md right-md top-1/2 h-2 -translate-y-1/2 rounded-full bg-light3 shadow-box" />
        <div
          className={cn(
            'absolute left-md top-1/2 h-2 -translate-y-1/2 rounded-full',
            colorClasses[color].fill,
          )}
          style={{ width: `calc((100% - 32px) * ${progress / 100})` }}
        />
        {ticks.map((_, index) => (
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-solid border-white box-content shadow-box',
              index / stepCount <= progress / 100
                ? colorClasses[color].tick
                : 'bg-light3',
            )}
            key={index}
            style={{
              left: `calc(16px + (100% - 32px) * ${index / stepCount})`,
            }}
          />
        ))}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          className={cn(
            'absolute inset-0 z-20 m-0 h-xl w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:h-xl [&::-moz-range-thumb]:w-xl [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-box [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-12px] [&::-webkit-slider-thumb]:h-xl [&::-webkit-slider-thumb]:w-xl [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-box focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            colorClasses[color].thumb,
          )}
          onChange={(event) => {
            if (value === undefined)
              setInternalValue(Number(event.target.value));
            onChange?.(event);
          }}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export { Slider };
