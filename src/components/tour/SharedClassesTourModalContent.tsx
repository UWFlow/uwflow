import React from 'react';
import { Mail, Users } from 'react-feather';

import { TourContent } from 'components/ui/tour';
import { cn } from 'lib/utils';

export type SharedClassesTourModalContentProps = {
  onRequestClose: () => void;
};

// Light tints for the sample avatars, matching the section colors used
// elsewhere. One-off decorative sizes stay as fixed values.
const AVATAR =
  'flex h-7 w-7 items-center justify-center rounded-full text-xs ' +
  'font-semibold text-dark1';

const CalendarIllustration = () => (
  <div
    className="flex items-center justify-center gap-lg border-b border-light2 bg-[#fafbfc] px-lg py-lg"
    aria-hidden
  >
    <div className="flex items-center">
      <span className={cn(AVATAR, 'bg-lecture')}>AZ</span>
      <span className={cn(AVATAR, 'bg-tutorial -ml-2')}>JK</span>
      <span className={cn(AVATAR, 'bg-lab -ml-2')}>MP</span>
    </div>
    <div className="flex w-[86px] flex-col gap-xs">
      <div className="text-center text-xs font-semibold tracking-[0.06em] text-dark3">
        WED
      </div>
      <div className="flex h-24 flex-col gap-xs rounded-md border border-light2 bg-white px-sm py-sm">
        <div
          className="rounded-card border-l-[3px] border-l-primary px-xs py-xs text-xs font-semibold text-dark1 shadow-[0_0_0_2px_theme(colors.primary)]"
          style={{ background: '#eef4ff' }}
        >
          CS 241
        </div>
        <div
          className="rounded-card border-l-[3px] px-xs py-xs text-xs font-semibold text-dark1"
          style={{ background: '#efeaff', borderLeftColor: '#6b5bd0' }}
        >
          MATH
        </div>
      </div>
    </div>
  </div>
);

const STEPS = [
  {
    heading: 'See the classes you share',
    illustration: (
      <div
        className="flex min-h-40 items-center justify-center gap-md border-b border-light2 bg-light1 p-lg text-primary"
        aria-hidden
      >
        <Users size={48} />
        <span className="text-lg font-semibold">Your study group</span>
      </div>
    ),
    body:
      'Make a group with friends and instantly see which sections you have ' +
      'together, using the schedule Flow already has. Nothing to fill in.',
  },
  {
    heading: 'Invite by email',
    illustration: (
      <div
        className="flex min-h-40 items-center justify-center gap-md border-b border-light2 bg-light1 p-lg text-primary"
        aria-hidden
      >
        <Mail size={48} />
        <span className="text-lg font-semibold">Invite a friend</span>
      </div>
    ),
    body:
      'Add friends by their UW Flow email. They see the invite and choose to ' +
      'join, and nothing about you is shared until they accept.',
  },
  {
    heading: 'Compare on the calendar',
    illustration: <CalendarIllustration />,
    body:
      'Shared classes use matching course colors in the cards and weekly calendar. ' +
      'On smaller screens, use the class cards to compare your schedules.',
  },
];

/**
 * First-visit tour for the Shared Classes page. The host page persists
 * dismissal (Skip, X, backdrop, or Done) via its onRequestClose override, so
 * the tour only ever shows once.
 */
const SharedClassesTourModalContent = ({
  onRequestClose,
}: SharedClassesTourModalContentProps) => {
  return (
    <TourContent
      label={
        <>
          <Users size={13} /> Shared Classes
        </>
      }
      steps={STEPS}
      onRequestClose={onRequestClose}
    />
  );
};

export default SharedClassesTourModalContent;
