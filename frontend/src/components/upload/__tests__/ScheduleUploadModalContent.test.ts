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
 * The backend says why a schedule paste failed (see `schedule.Parse` and
 * `scheduleErrorEnum` in flow/api/parse), so each enum maps to one message.
 */
describe('getScheduleError', () => {
  it.each([
    'no_term_schedule',
    'course_selection_schedule',
    'not_registered_schedule',
    'empty_schedule',
    'old_schedule',
  ])('shows the message for %s', (error) => {
    expect(getScheduleError(error)).toBe(SCHEDULE_ERRORS[error]);
    expect(getScheduleError(error)).not.toBe(SCHEDULE_ERRORS.default_schedule);
  });

  it('falls back to the default message for bad_request', () => {
    expect(getScheduleError('bad_request')).toBe(
      SCHEDULE_ERRORS.default_schedule,
    );
  });

  it('falls back to the default message for an unknown enum', () => {
    expect(getScheduleError('internal_error')).toBe(
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
