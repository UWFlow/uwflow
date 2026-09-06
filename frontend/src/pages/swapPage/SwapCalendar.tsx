import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RotateCcw } from 'react-feather';
import { useQuery } from '@apollo/client';
import * as Sentry from '@sentry/react';
import {
  GetCourseForSwapQuery,
  GetCourseForSwapQueryVariables,
  SwapCourseSectionFragment,
  UserScheduleFragment,
} from 'generated/graphql';
import moment from 'moment/moment';

import {
  Calendar,
  CalendarEvent,
  CalendarEventState,
} from 'components/calendar';
import LastUpdatedSchedule from 'components/common/LastUpdatedSchedule';
import { GET_COURSE_FOR_SWAP } from 'graphql/queries/course/SwapCourse';
import { cn } from 'lib/utils';
import {
  formatCourseCode,
  getCurrentTermCode,
  getNextTermCode,
  termCodeToDate,
} from 'utils/Misc';
import { mergeMeetingDateRanges } from 'utils/Schedule';

import CourseSearchDropdown from './CourseSearchDropdown';
import {
  getDisplayedTermPresence,
  GRID_END_HOUR,
  GRID_START_HOUR,
  toDayIndexes,
} from './displayedTerms';
import EnrolledCourseDropdown from './EnrolledCourseDropdown';
import ScheduleSwapPanel, {
  ProfessorSwapStats,
  SwapCandidateCourse,
  SwapPreview,
} from './ScheduleSwapPanel';
import useScheduleSwaps, {
  DisplayedTerm,
  PlannedSwap,
} from './useScheduleSwaps';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

// 24-hour "HH:MM" from seconds since midnight (`secsToTime` is 12-hour).
const secsTo24hTime = (secs: number) =>
  `${`${Math.floor(secs / 3600)}`.padStart(2, '0')}:${`${Math.floor(
    (secs % 3600) / 60,
  )}`.padStart(2, '0')}`;

// Section "type" is the section_name prefix: "LEC 001" -> "LEC".
const getSectionType = (sectionName: string) => sectionName.split(' ')[0];

// Compact view of the user's schedule, forwarded to Sentry when a rendered
// section has no alternative to swap into (e.g. a lone TST section).
const serializeSchedule = (entries: UserScheduleFragment['schedule']) =>
  entries.map(({ section }) => ({
    course: section.course.code,
    section: section.section_name,
    meetings: section.meetings.map((m) => ({
      days: m.days,
      start: m.start_seconds,
      end: m.end_seconds,
      location: m.location,
    })),
  }));

// The selection a calendar click produces: one course's sections of one type
// (e.g. CS 240's lectures). Swapping only ever replaces this one entry.
type SectionSelection = {
  courseCode: string;
  sectionType: string;
};

const timesOverlap = (s1: number, e1: number, s2: number, e2: number) =>
  s1 < e2 && s2 < e1;

const sectionConflictsWithSchedule = (
  candidate: SwapCourseSectionFragment,
  schedule: UserScheduleFragment['schedule'],
  // Only the entry being replaced (selected course + section type) leaves the
  // schedule on swap; the course's other sections (e.g. its TUT while swapping
  // the LEC) stay enrolled and still count for conflicts.
  excluded: SectionSelection | null,
): boolean => {
  const otherSections = schedule.filter(
    (e) =>
      !(
        excluded &&
        e.section.course.code === excluded.courseCode &&
        getSectionType(e.section.section_name) === excluded.sectionType
      ),
  );

  return candidate.meetings.some((cm) => {
    const cmStart = cm.start_seconds;
    const cmEnd = cm.end_seconds;
    if (cmStart == null || cmEnd == null) return false;
    const cmDays = cm.days as string[];
    return cmDays.some((day) =>
      otherSections.some((e) =>
        e.section.meetings.some((em) => {
          const emDays = em.days as string[];
          return (
            emDays.includes(day) &&
            em.start_seconds != null &&
            em.end_seconds != null &&
            timesOverlap(cmStart, cmEnd, em.start_seconds, em.end_seconds)
          );
        }),
      ),
    );
  });
};

// Map the term's enrolled sections onto generic calendar events. The selected
// course+type renders gold (`selected`), or fades to `dimmed` while a
// candidate section is being previewed from the side panel; other section
// types of the same course stay `default`.
const buildEnrolledEvents = (
  termSections: UserScheduleFragment['schedule'],
  selection: SectionSelection | null,
  isPreviewing: boolean,
  // null disables clicking (demo mode renders a non-interactive schedule).
  onToggleSection: ((code: string, sectionType: string) => void) | null,
): CalendarEvent[] =>
  termSections.flatMap(({ section }) => {
    const courseCode = section.course.code;
    const sectionType = getSectionType(section.section_name);
    const isSelected =
      selection !== null &&
      courseCode === selection.courseCode &&
      sectionType === selection.sectionType;
    let state: CalendarEventState = 'default';
    if (isSelected) state = isPreviewing ? 'dimmed' : 'selected';

    const meetings = mergeMeetingDateRanges(section.meetings);
    return meetings.flatMap((m, meetingIndex) => {
      if (m.start_seconds == null || m.end_seconds == null) return [];
      const startMinutes = m.start_seconds / 60;
      const endMinutes = m.end_seconds / 60;
      const timeLabel = `${secsTo24hTime(m.start_seconds)}–${secsTo24hTime(
        m.end_seconds,
      )}`;
      return toDayIndexes(m.days as string[], m.start_seconds).map(
        (dayIndex) => ({
          id: `${courseCode}-${section.section_name}-${meetingIndex}-${dayIndex}`,
          dayIndex,
          startMinutes,
          endMinutes,
          colorKey: courseCode,
          state,
          title: formatCourseCode(courseCode),
          timeLabel,
          location: m.location,
          subtitle: `${section.section_name} · Class #${section.class_number}`,
          onClick: onToggleSection
            ? () => onToggleSection(courseCode, sectionType)
            : undefined,
        }),
      );
    });
  });

// Ghost blocks for the candidate section previewed from the side panel.
const buildPreviewEvents = (
  section: SwapCourseSectionFragment | null,
): CalendarEvent[] =>
  section
    ? mergeMeetingDateRanges(section.meetings).flatMap((m, meetingIndex) => {
        if (m.start_seconds == null || m.end_seconds == null) return [];
        const startMinutes = m.start_seconds / 60;
        const endMinutes = m.end_seconds / 60;
        return toDayIndexes(m.days as string[], m.start_seconds).map(
          (dayIndex) => ({
            id: `preview-${meetingIndex}-${dayIndex}`,
            dayIndex,
            startMinutes,
            endMinutes,
            colorKey: section.course.code,
            state: 'preview' as const,
          }),
        );
      })
    : [];

type ScheduleEntry = UserScheduleFragment['schedule'][number];

// Bridge a fetched replacement into the schedule-entry shape used by the
// calendar overlay. The fragment is a superset of the schedule entry's section
// selection, so this is a plain (cast-free) re-wrap.
const toScheduleEntry = (
  section: SwapCourseSectionFragment,
  userId: number,
): ScheduleEntry => ({ user_id: userId, section });

/**
 * Enrolled sections for one term, with the user's saved swap plan overlaid.
 * The imported schedule remains the base and is never mutated.
 */
const applyPlannedSwaps = (
  schedule: UserScheduleFragment['schedule'],
  termCode: number,
  plannedSwaps: PlannedSwap[],
): UserScheduleFragment['schedule'] => {
  const base = schedule.filter((entry) => entry.section.term_id === termCode);
  const replacementBySourceId = new Map(
    plannedSwaps.map(({ sourceSectionId, replacementSection }) => [
      sourceSectionId,
      replacementSection,
    ]),
  );

  return base.map((entry) => {
    const replacement = replacementBySourceId.get(entry.section.id);
    return replacement ? toScheduleEntry(replacement, entry.user_id) : entry;
  });
};

type SwapCalendarProps = {
  schedule: UserScheduleFragment['schedule'];
  /** Renders a non-interactive sample schedule (logged-out lock state). */
  demoMode?: boolean;
  /** Keeps saved swap plans isolated to the signed-in user. */
  userId?: number | null;
};

const SwapCalendar = ({
  schedule,
  demoMode = false,
  userId = null,
}: SwapCalendarProps) => {
  const thisTermCode = getCurrentTermCode();
  const nextTermCode = getNextTermCode();
  const thisTermLabel = termCodeToDate(thisTermCode);
  const nextTermLabel = termCodeToDate(nextTermCode);

  // Swapping starts from a click on the grid, so only default to next term when
  // it actually draws blocks — a term of purely online/async sections would
  // open on an empty calendar.
  const { nextHasVisibleBlocks } = getDisplayedTermPresence(schedule);
  const defaultSelectedTerm = nextHasVisibleBlocks
    ? DisplayedTerm.Next
    : DisplayedTerm.Current;
  const [selectedTerm, setSelectedTerm] =
    useState<DisplayedTerm>(defaultSelectedTerm);
  const selectedTermCode =
    selectedTerm === DisplayedTerm.Next ? nextTermCode : thisTermCode;
  // The clicked calendar block's course + section type (e.g. CS 240 / LEC).
  // Selection, the panel's section list, and swapping are all scoped to this
  // one course+type pair.
  const [selection, setSelection] = useState<SectionSelection | null>(null);
  const selectedCourseCode = selection?.courseCode ?? null;
  const selectedSectionType = selection?.sectionType ?? null;
  // Ghost preview while the pointer is over a section row in the panel.
  const [hoveredSection, setHoveredSection] =
    useState<SwapCourseSectionFragment | null>(null);
  const [selectedSwapCourseCode, setSelectedSwapCourseCode] = useState<
    string | null
  >(null);

  const { plannedSwapsByTerm, planSwap, clearSwaps, isPlanSettled } =
    useScheduleSwaps({
      userId,
      demoMode,
      currentTermCode: thisTermCode,
      nextTermCode,
    });

  useEffect(() => {
    setSelectedSwapCourseCode(null);
    setHoveredSection(null);
  }, [selectedCourseCode, selectedSectionType]);

  // Effective schedule for the term: persisted swaps overlay the original
  // imported schedule without modifying it.
  const termSections = useMemo(
    () =>
      applyPlannedSwaps(
        schedule,
        selectedTermCode,
        plannedSwapsByTerm[selectedTerm] ?? [],
      ),
    [schedule, selectedTerm, selectedTermCode, plannedSwapsByTerm],
  );

  // Distinct courses in the user's schedule for this term, for the left
  // selector. Derived from the loaded schedule — no extra query needed.
  const enrolledCourses = useMemo(() => {
    const byCode = new Map<string, { code: string; name: string }>();
    for (const { section } of termSections) {
      if (!byCode.has(section.course.code)) {
        byCode.set(section.course.code, {
          code: section.course.code,
          name: section.course.name,
        });
      }
    }
    return Array.from(byCode.values()).sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }, [termSections]);

  // Sections of the course shown in the panel: the chosen swap target, or the
  // course selected on the calendar while no target is chosen yet.
  const displayCode = selectedSwapCourseCode ?? selectedCourseCode;
  const { loading: sectionsLoading, data: sectionsData } = useQuery<
    GetCourseForSwapQuery,
    GetCourseForSwapQueryVariables
  >(GET_COURSE_FOR_SWAP, {
    variables: { code: displayCode || '', termId: selectedTermCode },
    skip: !displayCode,
  });

  const swapSections = displayCode ? sectionsData?.course_section ?? [] : [];
  const displayedCourse = swapSections[0]?.course;

  // Bridge the panel's id-based API with this page's course-code state.
  const candidateCourses: SwapCandidateCourse[] = displayedCourse
    ? [
        {
          id: displayedCourse.id,
          code: displayedCourse.code,
          name: displayedCourse.name,
          sections: swapSections,
        },
      ]
    : [];

  const enrolledSectionIds = termSections.map((e) => e.section.id);

  // Nested meeting-overlap checks across every candidate × enrolled section.
  const conflictSectionIds = useMemo(
    () =>
      swapSections
        .filter(
          (section) =>
            !enrolledSectionIds.includes(section.id) &&
            sectionConflictsWithSchedule(section, termSections, selection),
        )
        .map((section) => section.id),
    [swapSections, enrolledSectionIds, termSections, selection],
  );

  // Sections of the selected type shown in the panel (mirrors the panel's term
  // + type filter). Used to detect a section code that has nothing to swap into.
  const selectedTypeSections = useMemo(
    () =>
      selectedSectionType === null
        ? []
        : swapSections.filter(
            (section) =>
              section.term_id === selectedTermCode &&
              getSectionType(section.section_name) === selectedSectionType,
          ),
    [swapSections, selectedSectionType, selectedTermCode],
  );

  // "No alternative to swap into": every section of this code is one the user is
  // already enrolled in, so there is literally nothing else to choose. This
  // ignores conflicts on purpose — a conflicting section still counts as an
  // alternative; we only flag codes (e.g. TST) that have no other section at all.
  const hasNoSwapAlternative =
    selectedTypeSections.length > 0 &&
    selectedTypeSections.every((section) =>
      enrolledSectionIds.includes(section.id),
    );

  // Report each (course, code, term) at most once per page session.
  const reportedNoAlternativeRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (
      demoMode ||
      sectionsLoading ||
      !hasNoSwapAlternative ||
      !selectedCourseCode ||
      !selectedSectionType
    ) {
      return;
    }

    const key = `${selectedCourseCode}|${selectedSectionType}|${selectedTermCode}`;
    if (reportedNoAlternativeRef.current.has(key)) {
      return;
    }
    reportedNoAlternativeRef.current.add(key);

    Sentry.captureMessage(
      `Swap section has no alternative to swap into: ${selectedSectionType} for ${selectedCourseCode}`,
      {
        level: 'warning',
        tags: { feature: 'section_swap', sectionCode: selectedSectionType },
        extra: {
          courseCode: selectedCourseCode,
          sectionCode: selectedSectionType,
          termCode: selectedTermCode,
          // The user's schedule for the viewed term, so the case can be reproduced.
          schedule: serializeSchedule(termSections),
        },
      },
    );
  }, [
    demoMode,
    sectionsLoading,
    hasNoSwapAlternative,
    selectedCourseCode,
    selectedSectionType,
    selectedTermCode,
    termSections,
  ]);

  const professorStatsById = useMemo(() => {
    const stats: Record<number, ProfessorSwapStats | undefined> = {};
    for (const section of swapSections) {
      for (const meeting of section.meetings) {
        if (meeting.prof?.rating) {
          stats[meeting.prof.id] = {
            clear: meeting.prof.rating.clear,
            engaging: meeting.prof.rating.engaging,
          };
        }
      }
    }
    return stats;
  }, [swapSections]);

  const updatedAt = useMemo(
    () =>
      swapSections.length > 0
        ? moment.max(swapSections.map((s) => moment(s.updated_at)))
        : null,
    [swapSections],
  );

  const previewSection = hoveredSection;

  const handlePreviewChange = useCallback(
    (preview: SwapPreview | null) =>
      setHoveredSection(preview?.section ?? null),
    [],
  );

  const handleTermChange = useCallback(
    (termId: number) => {
      setSelectedTerm(
        termId === nextTermCode ? DisplayedTerm.Next : DisplayedTerm.Current,
      );
      setSelection(null);
      setSelectedSwapCourseCode(null);
      setHoveredSection(null);
    },
    [nextTermCode],
  );

  const handleCourseChange = useCallback((courseCode: string | null) => {
    setSelectedSwapCourseCode(courseCode);
    setHoveredSection(null);
  }, []);

  // Picking an enrolled course from the left selector retargets the swap to
  // that course, defaulting to its LEC (or first section type in the schedule).
  const handleSelectEnrolledCourse = useCallback(
    (courseCode: string) => {
      const types = termSections
        .filter((e) => e.section.course.code === courseCode)
        .map((e) => getSectionType(e.section.section_name));
      const sectionType = types.includes('LEC') ? 'LEC' : types[0];
      if (sectionType) setSelection({ courseCode, sectionType });
    },
    [termSections],
  );

  const handleResetSwaps = () => {
    clearSwaps();
    setSelection(null);
    setSelectedSwapCourseCode(null);
    setHoveredSection(null);
  };

  // Save a section in the user's swap plan. The new section replaces the
  // entry matching the selected course + section type
  // (LEC↔LEC, TUT↔TUT) — the panel only offers same-type candidates.
  const handleSwitchSection = useCallback(
    (sectionId: number) => {
      const newSection = swapSections.find((s) => s.id === sectionId);
      if (!newSection || !selection) return;

      const base = termSections;
      const replaceIndex = base.findIndex(
        (e) =>
          e.section.course.code === selection.courseCode &&
          getSectionType(e.section.section_name) === selection.sectionType,
      );
      if (replaceIndex === -1) return;

      const currentSectionId = base[replaceIndex].section.id;
      const existingSwap = (plannedSwapsByTerm[selectedTerm] ?? []).find(
        ({ replacementSectionId }) => replacementSectionId === currentSectionId,
      );
      const sourceSectionId = existingSwap?.sourceSectionId ?? currentSectionId;

      planSwap(selectedTerm, sourceSectionId, newSection);
      setHoveredSection(null);
      if (newSection.course.code !== selection.courseCode) {
        // Follow the swapped-in course (keeping the selected section type);
        // the effect on the selection also clears the swap target so the
        // panel shows the new enrolled section.
        setSelection({
          courseCode: newSection.course.code,
          sectionType: selection.sectionType,
        });
      }
    },
    [
      planSwap,
      plannedSwapsByTerm,
      selectedTerm,
      selection,
      swapSections,
      termSections,
    ],
  );

  const events = useMemo(
    () => [
      ...buildEnrolledEvents(
        termSections,
        selection,
        previewSection !== null,
        // Re-clicking the selected course+type deselects; clicking any other
        // block (even another type of the same course) re-selects.
        demoMode
          ? null
          : (courseCode, sectionType) =>
              setSelection((prev) =>
                prev?.courseCode === courseCode &&
                prev.sectionType === sectionType
                  ? null
                  : { courseCode, sectionType },
              ),
      ),
      ...buildPreviewEvents(previewSection),
    ],
    [termSections, selection, previewSection, demoMode],
  );

  const availableTerms = [
    { id: thisTermCode, label: thisTermLabel },
    { id: nextTermCode, label: nextTermLabel },
  ];
  const swapTargetCode = selectedSwapCourseCode ?? selectedCourseCode;
  const hasSwaps = Object.keys(plannedSwapsByTerm).length > 0;

  return (
    <div className="relative z-0 w-screen animate-fade-in">
      <div className="mx-auto box-border flex w-full max-w-[1280px] flex-col px-8 pb-8 pt-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="m-0 font-anderson text-4xl font-extrabold text-dark1 tabletDown:text-3xl">
                Swap Class
              </h1>
              <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-extrabold text-dark1">
                NEW
              </span>
            </div>
            <p className="mb-0 mt-1 font-inter text-md font-regular text-dark2">
              Click any class to compare sections and check if a swap is
              possible — you make the actual change in Quest.
            </p>
          </div>
          <div className="inline-flex shrink-0 rounded border border-solid border-light3 bg-white p-1">
            {availableTerms.map((term) => (
              <button
                className={cn(
                  'h-8 cursor-pointer rounded border-none bg-transparent px-4 text-sm font-semibold text-dark3 transition-colors',
                  selectedTermCode === term.id && 'bg-light2 text-dark1',
                )}
                key={term.id}
                onClick={() => handleTermChange(term.id)}
                type="button"
              >
                {term.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 overflow-hidden rounded border border-solid border-light3 bg-white shadow-box">
            <Calendar
              showHeader={false}
              dayLabels={DAY_LABELS}
              events={events}
              minHour={GRID_START_HOUR}
              maxHour={GRID_END_HOUR - 1}
            />
          </div>

          <div className="flex w-[360px] shrink-0 flex-col gap-3">
            <div className="flex min-w-0 items-center gap-1.5 rounded bg-white px-3 py-2.5 shadow-box">
              {selectedCourseCode ? (
                <>
                  <span className="text-sm font-semibold text-dark1">Swap</span>
                  <EnrolledCourseDropdown
                    key={`${selectedCourseCode}|${selectedSectionType}`}
                    courses={enrolledCourses}
                    selectedCode={selectedCourseCode}
                    onSelect={handleSelectEnrolledCourse}
                  />
                  <span className="text-sm font-semibold text-dark1">with</span>
                  <CourseSearchDropdown
                    key={`${selectedCourseCode}|${selectedSectionType}|${selectedTermCode}`}
                    displayCode={swapTargetCode ?? selectedCourseCode}
                    selectedCode={swapTargetCode}
                    onSelect={handleCourseChange}
                    termId={selectedTermCode}
                  />
                </>
              ) : (
                <span className="text-sm text-dark3">
                  Select a class on your schedule
                </span>
              )}
              {hasSwaps && (
                <button
                  aria-label="Reset swapped sections"
                  className="ml-auto flex shrink-0 cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-inter text-xs font-semibold text-dark2 outline-none transition-colors hover:text-dark1 disabled:cursor-default disabled:text-dark3 disabled:hover:text-dark3"
                  disabled={!isPlanSettled}
                  onClick={handleResetSwaps}
                  title={
                    isPlanSettled
                      ? 'Reset swapped sections'
                      : 'Applying your saved swaps…'
                  }
                  type="button"
                >
                  <RotateCcw aria-hidden="true" size={14} />
                  Reset
                </button>
              )}
            </div>
            {updatedAt && (
              // `updatedAt` comes from the sections of `displayCode` in
              // `selectedTermCode`, so the link points at that exact course
              // and term rather than the whole schedule-of-classes index.
              <LastUpdatedSchedule
                updatedAt={updatedAt}
                courseCode={displayCode ?? undefined}
                term={selectedTermCode}
                fontSize="80%"
                margin="0"
              />
            )}
            <ScheduleSwapPanel
              selectedTermId={selectedTermCode}
              selectedCourseId={displayedCourse?.id ?? null}
              sectionType={selectedSectionType}
              candidateCourses={candidateCourses}
              enrolledSectionIds={enrolledSectionIds}
              conflictSectionIds={conflictSectionIds}
              onPreviewChange={handlePreviewChange}
              onSwitchSection={handleSwitchSection}
              professorStatsById={professorStatsById}
              isLoading={sectionsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapCalendar;
