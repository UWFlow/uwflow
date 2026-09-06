import React, { useState } from 'react';
import { MousePointer, Repeat } from 'react-feather';

import { cn } from 'lib/utils';

export type SwapTourModalContentProps = {
  onRequestClose: () => void;
};

const STEPS = [
  {
    heading: 'Plan swaps in a sandbox',
    body:
      'This tool simulates section swaps so you can check whether one is ' +
      'possible before touching Quest — it never changes your enrollment.',
  },
  {
    heading: 'Compare sections',
    body:
      'Click any class to see every other section — meeting times, rooms, ' +
      'professor ratings, and open seats. Conflicts and full sections are ' +
      'flagged so you know what would actually work.',
  },
  {
    heading: 'Then make the swap in Quest',
    body:
      "Found a section that fits? UW Flow can't swap it for you — go to " +
      'Quest and make the real change there yourself.',
  },
];

type MiniBlockProps = {
  fill: string;
  accent: string;
  highlighted?: boolean;
  offsetTop?: number;
  children: React.ReactNode;
};

const MiniBlock = ({
  fill,
  accent,
  highlighted,
  offsetTop,
  children,
}: MiniBlockProps) => (
  <div
    className={cn(
      'rounded-card border-l-[3px] px-xs py-xs text-xs font-semibold text-dark1',
      highlighted && 'shadow-[0_0_0_2px_#0052cc]',
    )}
    style={{
      background: fill,
      borderLeftColor: accent,
      marginTop: offsetTop ?? 0,
    }}
  >
    {children}
  </div>
);

/**
 * First-visit tour for the section-swap page. The host page persists
 * dismissal (Skip, X, or finishing the last step) via its onRequestClose
 * override, so the tour only ever shows once.
 */
const SwapTourModalContent = ({
  onRequestClose,
}: SwapTourModalContentProps) => {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex w-[400px] max-w-[90vw] flex-col overflow-hidden rounded-xl bg-white">
      {/* Decorative mini-calendar band. Column/dot dimensions are one-off
          layout sizes, kept as fixed values rather than spacing tokens. */}
      <div
        className="flex justify-center gap-md border-b border-light2 bg-[#fafbfc] px-lg py-lg"
        aria-hidden
      >
        <div className="flex w-[76px] flex-col gap-sm">
          <div className="text-center text-xs font-semibold tracking-[0.06em] text-dark3">
            MON
          </div>
          <div className="relative flex h-24 flex-col gap-sm rounded-md border border-light2 bg-white px-sm py-sm">
            <MiniBlock fill="#eef4ff" accent="#0052cc">
              CS 241
            </MiniBlock>
            <MiniBlock fill="#eef4ff" accent="#0052cc" offsetTop={10}>
              MATH
            </MiniBlock>
          </div>
        </div>
        <div className="flex w-[76px] flex-col gap-sm">
          <div className="text-center text-xs font-semibold tracking-[0.06em] text-dark3">
            TUE
          </div>
          <div className="relative flex h-24 flex-col gap-sm rounded-md border border-light2 bg-white px-sm py-sm">
            <MiniBlock fill="#fff7e0" accent="#e8b300" offsetTop={14}>
              STAT
            </MiniBlock>
          </div>
        </div>
        <div className="flex w-[76px] flex-col gap-sm">
          <div className="text-center text-xs font-semibold tracking-[0.06em] text-dark3">
            WED
          </div>
          <div className="relative flex h-24 flex-col gap-sm rounded-md border border-light2 bg-white px-sm py-sm">
            <MiniBlock fill="#eef4ff" accent="#0052cc" highlighted>
              CS 241
            </MiniBlock>
            <MiniBlock fill="#e6f2fb" accent="#2b8fcd" offsetTop={18}>
              ENGL
            </MiniBlock>
            <div className="absolute right-xs top-[26px] text-dark1">
              <MousePointer size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Copy + controls */}
      <div className="flex flex-col px-lg pb-lg pt-lg">
        <div className="mb-sm flex items-center gap-sm text-xs font-bold uppercase tracking-[0.08em] text-accentDark">
          <Repeat size={13} /> Swap Class
        </div>
        <h2 className="mb-sm text-2xl font-bold text-dark1">
          {STEPS[step].heading}
        </h2>
        <p className="mb-lg text-sm leading-normal text-dark2">
          {STEPS[step].body}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            {STEPS.map((_, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={cn(
                  'h-[7px] rounded-card transition-[width] duration-150 ease-in-out',
                  i === step ? 'w-5 bg-primary' : 'w-[7px] bg-light3',
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-md">
            {!isLastStep && (
              <button
                type="button"
                className="cursor-pointer bg-transparent p-0 text-sm text-dark2 hover:text-dark1"
                onClick={onRequestClose}
              >
                Skip
              </button>
            )}
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-primary px-lg py-sm text-sm font-semibold text-white hover:bg-primaryDark"
              onClick={() =>
                isLastStep ? onRequestClose() : setStep(step + 1)
              }
            >
              {isLastStep ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapTourModalContent;
