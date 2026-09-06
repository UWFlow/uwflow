import { SCHEDULE_ERRORS } from 'constants/Messages';
import { ScheduleParseResponse } from 'types/Api';

import {
  getScheduleError,
  getScheduleImportOutcome,
  getSchedulePasteError,
} from '../ScheduleUploadModalContent';

const desktopClassTablePaste = `BIOL 110 - Biodiversity, Biomes & Evol
Class Nbr	Section	Component	Days & Times	Room	Instructor	Start/End Date
7046
001
LEC
MW 1:30PM - 2:20PM
STC 1012
Marcel Pinheiro
09/09/2026 - 12/08/2026`;

/**
 * The backend reports only a coarse enum for a failed schedule paste:
 * `empty_schedule` for anything with a term header but no class numbers, and a
 * bare `bad_request` when it could not find a term header at all. Those cases
 * are indistinguishable server side, so the client disambiguates them from the
 * pasted text.
 */
describe('getScheduleError', () => {
  // Quest renders this "Go To" nav entry on every page, including a My Class
  // Schedule page for a term the user has no classes in.
  const questNav = `Go To
Course Selection (Undergrad only)
Search for Classes
Enroll`;

  const emptyTermPaste = `${questNav}
My Class Schedule
Fall 2026 | Undergraduate | University of Waterloo
You are not registered for classes in this term.`;

  describe('empty_schedule', () => {
    it('reports an empty term for a My Class Schedule paste with no enrolments', () => {
      expect(getScheduleError('empty_schedule', emptyTermPaste)).toBe(
        SCHEDULE_ERRORS.not_registered_schedule,
      );
    });

    it('does not mistake the Go To nav link for the Course Selection page', () => {
      expect(getScheduleError('empty_schedule', emptyTermPaste)).not.toBe(
        SCHEDULE_ERRORS.course_selection_schedule,
      );
    });

    it('hints at My Class Schedule when the Course Selection cart was pasted', () => {
      const paste = `${questNav}
 \tCourse Selection\t \t \t|\t \t \tView My Course Selection\t
Fall 2026 | Undergraduate | University of Waterloo
ECE 105 - Classical Mechanics`;

      expect(getScheduleError('empty_schedule', paste)).toBe(
        SCHEDULE_ERRORS.course_selection_schedule,
      );
    });

    it('matches the Course Selection page by its own heading', () => {
      // Some pastes carry only the heading, without the tab bar.
      const paste = `My Course Selection
Groupbox
Fall 2026
Undergraduate
Subject	Catalog	Description	Component	Priority	Campus`;

      expect(getScheduleError('empty_schedule', paste)).toBe(
        SCHEDULE_ERRORS.course_selection_schedule,
      );
    });

    it('does not mistake the Enrollment Dates page for Course Selection', () => {
      // "Course Selection Session" is a row label on Enrollment Dates.
      const paste = `Enrollment Dates
Fall 2026 | Undergraduate | University of Waterloo
Open Enrollment Dates by Session
Session	Begins On	Last Date to Enroll
Regular Academic Session
2026 July 29
Course Selection Session
2026 July 29`;

      expect(getScheduleError('empty_schedule', paste)).toBe(
        SCHEDULE_ERRORS.empty_schedule,
      );
    });

    it('falls back to the generic empty-schedule message', () => {
      expect(
        getScheduleError('empty_schedule', 'Fall 2026 | Undergraduate'),
      ).toBe(SCHEDULE_ERRORS.empty_schedule);
    });
  });

  describe('bad_request', () => {
    it('explains the missing term header for an unrecognized paste', () => {
      const paste = `AFM 462 - Topics: Taxation
3422
001
LEC
M 1:00PM - 2:50PM
09/09/2026 - 12/08/2026`;

      expect(getScheduleError('bad_request', paste)).toBe(
        SCHEDULE_ERRORS.no_term_schedule,
      );
    });

    it('recognizes a Quest class table copied without its term', () => {
      expect(getScheduleError('bad_request', desktopClassTablePaste)).toBe(
        SCHEDULE_ERRORS.class_table_schedule,
      );
    });

    it('falls back to the generic message when a term header is present', () => {
      expect(getScheduleError('bad_request', emptyTermPaste)).toBe(
        SCHEDULE_ERRORS.default_schedule,
      );
    });
  });

  it('passes through enums that map directly to a message', () => {
    expect(getScheduleError('old_schedule', emptyTermPaste)).toBe(
      SCHEDULE_ERRORS.old_schedule,
    );
  });

  it('falls back to the default message for an unknown enum', () => {
    expect(getScheduleError('internal_error', emptyTermPaste)).toBe(
      SCHEDULE_ERRORS.default_schedule,
    );
  });
});

describe('getSchedulePasteError', () => {
  it('detects the table-only paste before it reaches the backend', () => {
    expect(getSchedulePasteError(desktopClassTablePaste)).toBe(
      SCHEDULE_ERRORS.class_table_schedule,
    );
  });

  it('allows the same desktop table when its term header is included', () => {
    expect(
      getSchedulePasteError(
        `Fall 2026 | Undergraduate\n${desktopClassTablePaste}`,
      ),
    ).toBeNull();
  });

  it('detects any schedule table marker when the term header is absent', () => {
    const markers = [
      'Class Nbr',
      'Section',
      'Component',
      'Days & Times',
      'Room',
      'Instructor',
      'Start/End Date',
    ];

    markers.forEach((marker) => {
      expect(
        getSchedulePasteError(
          `BIOL 110 - Biodiversity, Biomes & Evol\n${marker}`,
        ),
      ).toBe(SCHEDULE_ERRORS.class_table_schedule);
    });
  });
});

/**
 * `/parse/schedule` answers 200 for a partial import and a total one alike, so
 * the difference has to be derived from the counts. Getting this wrong in the
 * 'failed' direction strands users on the swap page, whose blocking overlay
 * only lifts once a schedule is on the account.
 *
 * The cases below are one per *response shape*, not one per branch — three of
 * them reach the same early return, which is the point. `failed_classes` can
 * arrive as `[]`, as `null` (Go marshals a nil slice that way), or not at all
 * (the parse-only response carries TermId/Classes and no counts), and all three
 * have to read as a clean import. Testing only `[]` would let either of the
 * other two regress into a spurious error, which is the exact bug this fixes.
 */
describe('getScheduleImportOutcome', () => {
  it('treats a clean import as imported', () => {
    expect(
      getScheduleImportOutcome({
        sections_imported: 8,
        failed_classes: [],
      }),
    ).toEqual({ kind: 'imported', failedClasses: [] });
  });

  it('lets a partial import through with the classes that failed', () => {
    // Seven of eight matched a section: the schedule is on the account.
    expect(
      getScheduleImportOutcome({
        sections_imported: 8,
        failed_classes: [7587],
      }),
    ).toEqual({ kind: 'imported', failedClasses: [7587] });
  });

  it('fails when every parsed class missed', () => {
    // The whole-term miss, e.g. the paste's term header disagreeing with its
    // class numbers. Nothing was written, so there is nothing to show.
    expect(
      getScheduleImportOutcome({
        sections_imported: 3,
        failed_classes: [7587, 7588, 7589],
      }),
    ).toEqual({ kind: 'failed', failedClasses: [7587, 7588, 7589] });
  });

  it('treats a null failed_classes as a clean import', () => {
    // Go marshals an empty slice as null rather than [].
    expect(
      getScheduleImportOutcome({
        sections_imported: 4,
        failed_classes: null,
      } as unknown as ScheduleParseResponse),
    ).toEqual({ kind: 'imported', failedClasses: [] });
  });

  it('treats the parse-only response as a clean import', () => {
    // The parse-only endpoint answers with TermId/Classes and no counts.
    expect(
      getScheduleImportOutcome({
        TermId: 1269,
        Classes: [{ Number: 7587, Location: 'MC 4020' }],
      } as unknown as ScheduleParseResponse),
    ).toEqual({ kind: 'imported', failedClasses: [] });
  });
});
