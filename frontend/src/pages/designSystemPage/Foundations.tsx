import React from 'react';

import { Heading, Text } from 'components/ui/typography';
import { cn } from 'lib/utils';

import { Example, ExampleGroup, Section } from './Showcase';

const colorScales = [
  {
    name: 'Surfaces',
    colors: [
      ['white', 'bg-white'],
      ['light1', 'bg-light1'],
      ['light2', 'bg-light2'],
    ],
  },
  {
    name: 'Text And Borders',
    colors: [
      ['dark1', 'bg-dark1'],
      ['dark2', 'bg-dark2'],
      ['dark3', 'bg-dark3'],
      ['light4', 'bg-light4'],
      ['light3', 'bg-light3'],
    ],
  },
  {
    name: 'Brand',
    colors: [
      ['primaryExtraDark', 'bg-primaryExtraDark'],
      ['primaryDark', 'bg-primaryDark'],
      ['primary', 'bg-primary'],
    ],
  },
  { name: 'Courses', colors: [['courses', 'bg-courses']] },
  { name: 'Professors', colors: [['professors', 'bg-professors']] },
  {
    name: 'Accent',
    colors: [
      ['accentDark', 'bg-accentDark'],
      ['accent', 'bg-accent'],
    ],
  },
  {
    name: 'Schedule',
    colors: [
      ['lecture', 'bg-lecture'],
      ['lab', 'bg-lab'],
      ['tutorial', 'bg-tutorial'],
    ],
  },
  {
    name: 'Status',
    colors: [
      ['darkRed', 'bg-darkRed'],
      ['red', 'bg-red'],
    ],
  },
  {
    name: 'Social',
    colors: [
      ['google', 'bg-google'],
      ['facebook', 'bg-facebook'],
    ],
  },
] as const;

const spacingScale = [
  ['xs', 'p-xs'],
  ['sm', 'p-sm'],
  ['md', 'p-md'],
  ['lg', 'p-lg'],
  ['xl', 'p-xl'],
] as const;
const radiusScale = [
  ['none', 'rounded-none'],
  ['card', 'rounded-card'],
  ['md', 'rounded-md'],
  ['lg', 'rounded-lg'],
  ['xl', 'rounded-xl'],
  ['full', 'rounded-full'],
] as const;
const shadowScale = [
  ['box', 'shadow-box'],
  ['bottom-box', 'shadow-bottom-box'],
  ['dark-box', 'shadow-dark-box'],
  ['dropdown', 'shadow-dropdown'],
] as const;
const titleCase = (value: string) =>
  value
    .split('-')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');

const TokenTooltip = ({ id, name }: { id: string; name: string }) => (
  <span
    id={id}
    className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-sm -translate-x-1/2 whitespace-nowrap rounded bg-dark1 px-sm py-xs text-xs font-semibold text-white opacity-0 shadow-dropdown transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    role="tooltip"
  >
    {name}
  </span>
);

export const Colors = () => (
  <Section title="Colors">
    <div className="grid gap-sm">
      {colorScales.map((scale) => (
        <div
          className="grid items-center gap-[2px] tablet:grid-cols-[150px_1fr] tablet:gap-sm"
          key={scale.name}
        >
          <h3 className="m-0 font-anderson text-xl font-semibold text-dark2">
            {scale.name}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-sm">
            {scale.colors.map(([name, className]) => {
              const tooltipId = `${scale.name
                .toLowerCase()
                .split(' ')
                .join('-')}-${name}`;
              return (
                <button
                  aria-describedby={tooltipId}
                  aria-label={name}
                  className={cn(
                    'group relative h-16 rounded-card border border-solid border-light3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    className,
                  )}
                  key={name}
                  type="button"
                >
                  <TokenTooltip id={tooltipId} name={name} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </Section>
);

export const Typography = () => (
  <Section title="Typography">
    <div className="grid gap-lg">
      <div className="grid gap-[2px]">
        <h3 className="m-0 font-anderson text-xl font-semibold text-dark2">
          Heading
        </h3>
        <div className="grid gap-xs">
          <Heading size="xl">This Is An XL Heading</Heading>
          <Heading size="lg">This Is An LG Heading</Heading>
          <Heading size="md">This Is An MD Heading</Heading>
          <Heading size="sm">This Is An SM Heading</Heading>
        </div>
      </div>
      <div className="grid gap-[2px]">
        <h3 className="m-0 font-anderson text-xl font-semibold text-dark2">
          Body
        </h3>
        <div className="grid gap-xs">
          {(['lg', 'md', 'sm', 'xs'] as const).flatMap((size) =>
            (['regular', 'semibold'] as const).map((weight) => (
              <Text
                key={`${size}-${weight}`}
                size={size}
                tone="strong"
                weight={weight}
              >
                This Is Body {size.toUpperCase()} ·{' '}
                {weight === 'regular' ? 'Regular' : 'Semibold'}
              </Text>
            )),
          )}
        </div>
      </div>
    </div>
  </Section>
);

export const Spacing = () => (
  <Section title="Spacing">
    <ExampleGroup title="Scale">
      {spacingScale.map(([name, className]) => (
        <Example key={name} label={name.toUpperCase()}>
          <span className={cn('inline-flex rounded-card bg-light2', className)}>
            <span className="block h-xl w-xl rounded-card bg-primary" />
          </span>
        </Example>
      ))}
    </ExampleGroup>
  </Section>
);
export const BorderRadius = () => (
  <Section title="Border Radius">
    <ExampleGroup title="Scale">
      {radiusScale.map(([name, className]) => (
        <Example key={name} label={titleCase(name)}>
          <span className={cn('block h-16 w-16 bg-primary', className)} />
        </Example>
      ))}
    </ExampleGroup>
  </Section>
);
export const Shadows = () => (
  <Section title="Shadows">
    <ExampleGroup title="Scale">
      {shadowScale.map(([name, className]) => (
        <Example key={name} label={titleCase(name)}>
          <span
            className={cn('block h-16 w-24 rounded-card bg-white', className)}
          />
        </Example>
      ))}
    </ExampleGroup>
  </Section>
);
