import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  MousePointer,
} from 'react-feather';
import { Link as RouterLink } from 'react-router-dom';
import { SwapCourseSectionFragment } from 'generated/graphql';
import { getCoursePageRoute, getProfPageRoute } from 'Routes';

import LoadingSpinner from 'components/display/LoadingSpinner';
import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';
import { formatCourseCode, processRating, weekDayLetters } from 'utils/Misc';

// Local shorthand for the deeply nested generated meeting type.
type SwapMeeting = SwapCourseSectionFragment['meetings'][number];

export type SwapPreview = {
  courseId: number;
  courseCode: string;
  section: SwapCourseSectionFragment;
};

export type SwapCandidateCourse = {
  id: number;
  code: string;
  name: string;
  sections: SwapCourseSectionFragment[];
};

export type ProfessorSwapStats = {
  clear?: number | null;
  engaging?: number | null;
  liked?: number | null;
  commentCount?: number | null;
};

export type ScheduleSwapPanelProps = {
  selectedTermId: number;
  selectedCourseId: number | null;
  // Section type ("LEC", "TUT", ...) the user selected on the calendar; only
  // sections of this type are listed (null lists every type).
  sectionType: string | null;
  candidateCourses: SwapCandidateCourse[];
  enrolledSectionIds: number[];
  conflictSectionIds: number[];
  onPreviewChange: (preview: SwapPreview | null) => void;
  onSwitchSection: (sectionId: number) => void;
  professorStatsById?: Record<number, ProfessorSwapStats | undefined>;
  isLoading?: boolean;
};

const getSectionType = (sectionName: string) => sectionName.split(' ')[0];

const getOpenSeats = (section: SwapCourseSectionFragment) =>
  Math.max(section.enrollment_capacity - section.enrollment_total, 0);

const DAY_NAMES: Record<string, string> = {
  M: 'Mon',
  T: 'Tue',
  W: 'Wed',
  Th: 'Thu',
  F: 'Fri',
  S: 'Sat',
  Su: 'Sun',
};

const formatDays = (days: string[]) =>
  weekDayLetters
    .filter((day) => days.includes(day))
    .map((day) => DAY_NAMES[day] ?? day)
    .join(' ');

const isTargetWithin = (
  currentTarget: EventTarget & HTMLDivElement,
  relatedTarget: EventTarget | null,
) => relatedTarget instanceof Node && currentTarget.contains(relatedTarget);

// 24-hour "HH:MM" from seconds since midnight.
const secsTo24hTime = (secs: number) =>
  `${`${Math.floor(secs / 3600)}`.padStart(2, '0')}:${`${Math.floor(
    (secs % 3600) / 60,
  )}`.padStart(2, '0')}`;

const getMeetingTime = (meeting: SwapMeeting) => {
  if (meeting.is_cancelled) {
    return 'Cancelled';
  }
  if (
    meeting.is_tba ||
    meeting.start_seconds === null ||
    meeting.start_seconds === undefined ||
    meeting.end_seconds === null ||
    meeting.end_seconds === undefined
  ) {
    return 'TBA';
  }
  return `${secsTo24hTime(meeting.start_seconds)}–${secsTo24hTime(
    meeting.end_seconds,
  )}`;
};

// Show both UW's section label (e.g. "TUT 101") and the numeric class number
// students need to enter in Quest. Conflicting sections dim with their row.
const SectionName = ({
  sectionName,
  classNumber,
  hasConflict,
}: {
  sectionName: string;
  classNumber: number;
  hasConflict: boolean;
}) => (
  <div className="flex items-baseline gap-2">
    <span
      className={cn(
        'text-sm font-semibold',
        hasConflict ? 'text-dark3' : 'text-dark1',
      )}
    >
      {sectionName}
    </span>
    <span className="text-xs text-dark3" title="Quest class number">
      Class #{classNumber}
    </span>
  </div>
);

const MeetingInstructor = ({
  meeting,
  professorStatsById,
}: {
  meeting: SwapMeeting;
  professorStatsById?: Record<number, ProfessorSwapStats | undefined>;
}) => {
  const professor = meeting.prof;
  // No instructor data — show nothing rather than "Instructor TBA".
  if (!professor || !professor.name) {
    return null;
  }

  const stats = professorStatsById?.[professor.id];

  return (
    <div className="min-w-0">
      {professor.code ? (
        <RouterLink
          className="text-xs font-semibold text-professors underline underline-offset-2"
          to={getProfPageRoute(professor.code)}
        >
          {professor.name}
        </RouterLink>
      ) : (
        <span className="text-xs font-semibold text-dark2">
          {professor.name}
        </span>
      )}
      {stats && (
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-dark2">
          {stats.clear !== undefined && stats.clear !== null && (
            <span>
              <strong className="text-dark1">
                {processRating(stats.clear)}
              </strong>{' '}
              clear
            </span>
          )}
          {stats.engaging !== undefined && stats.engaging !== null && (
            <span>
              <strong className="text-dark1">
                {processRating(stats.engaging)}
              </strong>{' '}
              engaging
            </span>
          )}
          {stats.liked !== undefined && stats.liked !== null && (
            <span>
              <strong className="text-dark1">
                {processRating(stats.liked)}
              </strong>{' '}
              liked
            </span>
          )}
          {stats.commentCount !== undefined && stats.commentCount !== null && (
            <span>
              <strong className="text-dark1">{stats.commentCount}</strong>{' '}
              review{stats.commentCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const MeetingLine = ({
  meeting,
  professorStatsById,
}: {
  meeting: SwapMeeting;
  professorStatsById?: Record<number, ProfessorSwapStats | undefined>;
}) => (
  <div className="grid gap-0.5 text-xs text-dark2">
    <div className="text-sm text-dark1">
      <span>{formatDays(meeting.days) || 'No days listed'}</span>
      <span className="mx-1 text-dark3">·</span>
      <span className="whitespace-nowrap font-semibold tabular-nums">
        {getMeetingTime(meeting)}
      </span>
    </div>
    {meeting.location && <div className="text-dark3">{meeting.location}</div>}
    <MeetingInstructor
      meeting={meeting}
      professorStatsById={professorStatsById}
    />
  </div>
);

const EmptyState = () => (
  <div className="flex min-h-[178px] flex-col items-center justify-center rounded border border-solid border-light3 bg-white px-6 py-8 text-center">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-light2 text-dark3">
      <MousePointer aria-hidden="true" size={18} />
    </div>
    <div className="text-sm font-semibold text-dark1">Select a course</div>
    <div className="mt-2 max-w-[260px] text-sm leading-5 text-dark3">
      Click a class in your schedule to see other sections, prof ratings, and
      swap options.
    </div>
  </div>
);

const ScheduleSectionRow = ({
  course,
  section,
  isEnrolled,
  hasConflict,
  professorStatsById,
  onPreviewChange,
  onSwitchSection,
}: {
  course: SwapCandidateCourse;
  section: SwapCourseSectionFragment;
  isEnrolled: boolean;
  hasConflict: boolean;
  professorStatsById?: Record<number, ProfessorSwapStats | undefined>;
  onPreviewChange: (preview: SwapPreview | null) => void;
  onSwitchSection: (sectionId: number) => void;
}) => {
  const showPreview = () =>
    onPreviewChange({
      courseId: course.id,
      courseCode: course.code,
      section,
    });

  const clearPreview = () => onPreviewChange(null);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!isTargetWithin(event.currentTarget, event.relatedTarget)) {
      clearPreview();
    }
  };

  const openSeats = getOpenSeats(section);

  return (
    <div
      className={cn(
        'border-0 border-l-4 border-t border-solid border-l-transparent border-t-light3 bg-white px-4 py-3 outline-none transition-colors first:border-t-0',
        'focus-within:bg-light1 hover:bg-light1',
        isEnrolled && 'border-l-primary bg-primary/5',
        hasConflict && 'bg-light1/60 text-dark3',
      )}
      onBlur={handleBlur}
      onFocus={showPreview}
      onPointerEnter={showPreview}
      onPointerLeave={clearPreview}
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-1.5">
          <SectionName
            classNumber={section.class_number}
            hasConflict={hasConflict}
            sectionName={section.section_name}
          />
          {section.meetings.length === 0 ? (
            <div className="text-xs text-dark3">No meeting times listed</div>
          ) : (
            section.meetings.map((meeting, index) => (
              <MeetingLine
                key={`${section.id}-${index}`}
                meeting={meeting}
                professorStatsById={professorStatsById}
              />
            ))
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {isEnrolled ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <CheckCircle aria-hidden="true" size={14} />
              Enrolled
            </span>
          ) : hasConflict ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-darkRed">
              <AlertTriangle aria-hidden="true" size={14} />
              Conflicts
            </span>
          ) : (
            <Button
              aria-label={`Choose ${section.section_name}`}
              className="h-7 px-3 text-sm font-bold"
              onClick={() => onSwitchSection(section.id)}
              size="sm"
              type="button"
              variant="accent"
            >
              Choose
            </Button>
          )}
          <div className="whitespace-nowrap text-xs text-dark3">
            <strong
              className={cn(
                'font-semibold tabular-nums',
                openSeats === 0 ? 'text-darkRed' : 'text-dark1',
              )}
            >
              {openSeats === 0 ? 'Full' : openSeats}
            </strong>
            {openSeats > 0 && ` / ${section.enrollment_capacity} open`}
          </div>
        </div>
      </div>
    </div>
  );
};

// Conflicting sections can't be chosen, so they sit collapsed below the
// choosable ones instead of interleaving with them.
const ConflictGroup = ({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-0 border-t border-solid border-light3">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-light1 px-4 py-2.5 font-inter text-xs font-semibold text-dark2 hover:text-dark1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="inline-flex items-center gap-1.5">
          <AlertTriangle aria-hidden="true" size={14} />
          {count} section{count === 1 ? '' : 's'} conflict
          {count === 1 ? 's' : ''} with your schedule
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
          size={16}
        />
      </button>
      {open && (
        <div className="border-0 border-t border-solid border-light3">
          {children}
        </div>
      )}
    </div>
  );
};

const ScheduleSwapPanel = ({
  selectedTermId,
  selectedCourseId,
  sectionType,
  candidateCourses,
  enrolledSectionIds,
  conflictSectionIds,
  onPreviewChange,
  onSwitchSection,
  professorStatsById,
  isLoading = false,
}: ScheduleSwapPanelProps) => {
  const selectedCourse =
    candidateCourses.find((course) => course.id === selectedCourseId) || null;
  const sections = selectedCourse
    ? selectedCourse.sections
        .filter(
          (section) =>
            section.term_id === selectedTermId &&
            (sectionType === null ||
              getSectionType(section.section_name) === sectionType),
        )
        .sort((a, b) => {
          const sectionTypeA = getSectionType(a.section_name);
          const sectionTypeB = getSectionType(b.section_name);
          if (sectionTypeA === sectionTypeB) {
            return a.section_name.localeCompare(b.section_name);
          }
          return sectionTypeA.localeCompare(sectionTypeB);
        })
    : [];

  useEffect(() => {
    onPreviewChange(null);
    return () => onPreviewChange(null);
  }, [onPreviewChange, selectedCourseId, selectedTermId, sectionType]);

  // Enrolled first, then choosable, with conflicts folded away at the bottom.
  const enrolledSections = sections.filter((s) =>
    enrolledSectionIds.includes(s.id),
  );
  const conflictSections = sections.filter(
    (s) =>
      !enrolledSectionIds.includes(s.id) && conflictSectionIds.includes(s.id),
  );
  const openSections = sections.filter(
    (s) =>
      !enrolledSectionIds.includes(s.id) && !conflictSectionIds.includes(s.id),
  );

  const renderRow = (section: SwapCourseSectionFragment) =>
    selectedCourse && (
      <ScheduleSectionRow
        course={selectedCourse}
        hasConflict={conflictSectionIds.includes(section.id)}
        isEnrolled={enrolledSectionIds.includes(section.id)}
        key={section.id}
        onPreviewChange={onPreviewChange}
        onSwitchSection={onSwitchSection}
        professorStatsById={professorStatsById}
        section={section}
      />
    );

  return (
    <aside className="flex min-h-0 w-full flex-col overflow-hidden rounded border border-solid border-light3 bg-white shadow-box tablet:max-w-[360px]">
      {isLoading ? (
        <div className="flex min-h-[178px] items-center justify-center p-4">
          <LoadingSpinner />
        </div>
      ) : !selectedCourse ? (
        <div className="p-4">
          <EmptyState />
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-start justify-between gap-3 border-0 border-b border-solid border-light3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h2 className="m-0 text-md font-semibold">
                  <RouterLink
                    className="text-courses no-underline hover:underline"
                    to={getCoursePageRoute(selectedCourse.code)}
                  >
                    {formatCourseCode(selectedCourse.code)}
                  </RouterLink>
                </h2>
                <span className="text-xs text-dark3">
                  {sections.length} section{sections.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="mb-0 mt-0.5 text-sm text-dark3">
                {selectedCourse.name}
              </p>
            </div>
          </div>
          {sections.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-dark3">
              No sections are listed for this term.
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {enrolledSections.map(renderRow)}
              {openSections.map(renderRow)}
              {openSections.length === 0 && (
                <div className="border-0 border-t border-solid border-light3 px-4 py-4 text-center text-xs text-dark3">
                  {conflictSections.length > 0
                    ? 'No other section fits your schedule.'
                    : 'No other sections to swap into.'}
                </div>
              )}
              {conflictSections.length > 0 && (
                <ConflictGroup
                  // Collapse again when the panel switches course or type.
                  key={`${selectedCourse.id}|${sectionType}|${selectedTermId}`}
                  count={conflictSections.length}
                >
                  {conflictSections.map(renderRow)}
                </ConflictGroup>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default ScheduleSwapPanel;
