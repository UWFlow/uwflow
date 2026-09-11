import React, { ReactNode } from 'react';

import { cn } from 'lib/utils';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export const Section = ({ title, children }: SectionProps) => (
  <section className="grid gap-xs">
    <h2 className="m-0 font-anderson text-3xl font-extrabold text-dark1">
      {title}
    </h2>
    {children}
  </section>
);

type ExampleGroupProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export const ExampleGroup = ({
  title,
  children,
  className,
}: ExampleGroupProps) => (
  <div className="grid gap-[2px]">
    {title !== 'Default' && (
      <h3 className="m-0 font-anderson text-xl font-semibold text-dark2">
        {title}
      </h3>
    )}
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] items-start gap-sm',
        className,
      )}
    >
      {children}
    </div>
  </div>
);

export const Example = ({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) => (
  <div className="grid gap-[2px]">
    {label && <h4 className="m-0 text-sm font-semibold text-dark3">{label}</h4>}
    <div className="flex min-h-16 items-center justify-center rounded-lg border border-solid border-light2 bg-white p-sm">
      {children}
    </div>
  </div>
);
