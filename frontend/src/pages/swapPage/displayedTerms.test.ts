import { UserScheduleFragment } from 'generated/graphql';

import { getCurrentTermCode, getNextTermCode } from 'utils/Misc';

import { getDisplayedTermPresence } from './displayedTerms';

// Only term_id matters here, but the helper takes real schedule entries, so
// build one with a meeting that has no Mon-Fri day: an online/async section
// still counts as "this term has classes" even though it draws no calendar
// blocks.
const entryInTerm = (
  termId: number,
  days: string[] = ['M', 'W'],
): UserScheduleFragment['schedule'][number] =>
  ({
    user_id: 1,
    section: {
      id: termId * 100,
      term_id: termId,
      section_name: 'LEC 001',
      exams: [],
      meetings: [
        {
          days,
          end_date: '2026-12-03',
          end_seconds: 35400,
          is_cancelled: false,
          location: 'MC 2034',
          prof: null,
          section_id: termId * 100,
          start_date: '2026-09-08',
          start_seconds: 32400,
        },
      ],
      course: { id: 1, code: 'CS135', name: 'Designing Functional Programs' },
    },
  } as unknown as UserScheduleFragment['schedule'][number]);

describe('getDisplayedTermPresence', () => {
  const thisTermCode = getCurrentTermCode();
  const nextTermCode = getNextTermCode();

  it('detects classes in each displayed term independently', () => {
    expect(getDisplayedTermPresence([entryInTerm(thisTermCode)])).toEqual({
      thisHasData: true,
      nextHasData: false,
      nextHasVisibleBlocks: false,
    });
    expect(getDisplayedTermPresence([entryInTerm(nextTermCode)])).toEqual({
      thisHasData: false,
      nextHasData: true,
      nextHasVisibleBlocks: true,
    });
  });

  it('ignores terms the calendar does not display', () => {
    // A returning user whose schedule is entirely past terms.
    expect(getDisplayedTermPresence([entryInTerm(thisTermCode - 10)])).toEqual({
      thisHasData: false,
      nextHasData: false,
      nextHasVisibleBlocks: false,
    });
  });

  it('counts sections with no Mon-Fri meetings', () => {
    expect(getDisplayedTermPresence([entryInTerm(thisTermCode, [])])).toEqual({
      thisHasData: true,
      nextHasData: false,
      nextHasVisibleBlocks: false,
    });
  });

  it('does not count a next term that draws no calendar blocks', () => {
    // Online/async next term: the user has classes, but nothing to click.
    expect(getDisplayedTermPresence([entryInTerm(nextTermCode, [])])).toEqual({
      thisHasData: false,
      nextHasData: true,
      nextHasVisibleBlocks: false,
    });
  });

  it('reports no data for an empty schedule', () => {
    expect(getDisplayedTermPresence([])).toEqual({
      thisHasData: false,
      nextHasData: false,
      nextHasVisibleBlocks: false,
    });
  });
});
