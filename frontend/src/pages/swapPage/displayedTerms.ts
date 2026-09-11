import { UserScheduleFragment } from 'generated/graphql';

import { getCurrentTermCode, getNextTermCode } from 'utils/Misc';

const DAY_LETTERS = ['M', 'T', 'W', 'Th', 'F'];
// Visible hour range of the grid: 8am to 10pm.
export const GRID_START_HOUR = 8;
export const GRID_END_HOUR = 22;

// Mon-Fri day columns for a meeting, keeping only meetings that start within
// the visible hour range.
export const toDayIndexes = (
  days: string[],
  startSeconds: number,
): number[] => {
  const startHour = startSeconds / 3600;
  if (startHour < GRID_START_HOUR || startHour >= GRID_END_HOUR) return [];
  return days.map((d) => DAY_LETTERS.indexOf(d)).filter((col) => col !== -1);
};

const hasVisibleBlocks = (
  entry: UserScheduleFragment['schedule'][number],
): boolean =>
  entry.section.meetings.some(
    (m) =>
      m.start_seconds != null &&
      m.end_seconds != null &&
      toDayIndexes(m.days as string[], m.start_seconds).length > 0,
  );

// Whether the schedule has classes in each of the two terms the swap calendar
// shows (current + next). Drives the default term in SwapCalendar and the
// "Import your schedule from Quest" empty-state prompt in SwapPage, so it sits
// outside the component that both of them can reach. Sections carry their own
// term_id, so this never has to infer a term from meeting dates.
//
// `*HasData` counts any enrolled section (an online/async course still means
// "you have a schedule"); `nextHasVisibleBlocks` counts only sections that draw
// a clickable block on the grid, since defaulting to a term with nothing to
// click would strand the user on an empty calendar.
export const getDisplayedTermPresence = (
  schedule: UserScheduleFragment['schedule'],
) => {
  const thisTermCode = getCurrentTermCode();
  const nextTermCode = getNextTermCode();
  return {
    thisHasData: schedule.some(
      (entry) => entry.section.term_id === thisTermCode,
    ),
    nextHasData: schedule.some(
      (entry) => entry.section.term_id === nextTermCode,
    ),
    nextHasVisibleBlocks: schedule.some(
      (entry) =>
        entry.section.term_id === nextTermCode && hasVisibleBlocks(entry),
    ),
  };
};
