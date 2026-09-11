import React from 'react';
import { ExternalLink, MousePointer, Repeat } from 'react-feather';

import { TourContent } from 'components/ui/tour';
import { cn } from 'lib/utils';

export type SwapTourModalContentProps = {
  onRequestClose: () => void;
};

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

const CalendarIllustration = () => (
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
);

const STEPS = [
  {
    heading: 'Plan swaps in a sandbox',
    illustration: (
      <div
        className="flex min-h-40 items-center justify-center gap-md border-b border-light2 bg-light1 p-lg text-primary"
        aria-hidden
      >
        <Repeat size={48} />
        <span className="text-lg font-semibold">Try a new schedule</span>
      </div>
    ),
    body:
      'This tool simulates section swaps so you can check whether one is ' +
      'possible before touching Quest — it never changes your enrollment.',
  },
  {
    heading: 'Compare sections',
    illustration: <CalendarIllustration />,
    body:
      'Click any class to see every other section — meeting times, rooms, ' +
      'professor ratings, and open seats. Conflicts and full sections are ' +
      'flagged so you know what would actually work.',
  },
  {
    heading: 'Then make the swap in Quest',
    illustration: (
      <div
        className="flex min-h-40 items-center justify-center gap-md border-b border-light2 bg-light1 p-lg text-primary"
        aria-hidden
      >
        <ExternalLink size={48} />
        <span className="text-lg font-semibold">Finish in Quest</span>
      </div>
    ),
    body:
      "Found a section that fits? UW Flow can't swap it for you — go to " +
      'Quest and make the real change there yourself.',
  },
];

/**
 * First-visit tour for the section-swap page. The host page persists
 * dismissal (Skip, X, or finishing the last step) via its onRequestClose
 * override, so the tour only ever shows once.
 */
const SwapTourModalContent = ({
  onRequestClose,
}: SwapTourModalContentProps) => {
  return (
    <TourContent
      label={
        <>
          <Repeat size={13} /> Swap Class
        </>
      }
      steps={STEPS}
      onRequestClose={onRequestClose}
    />
  );
};

export default SwapTourModalContent;
