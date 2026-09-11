import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, MousePointer } from 'react-feather';
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
  <div className="flex flex-col gap-xs">
    <span
      className={cn(
        'text-sm font-semibold',
        hasConflict ? 'text-dark3' : 'text-dark1',
      )}
    >
      {sectionName}
    </span>
    <span className={cn('text-xs', hasConflict ? 'text-dark3' : 'text-dark2')}>
      Quest class number:{' '}
      <strong className="font-semibold">{classNumber}</strong>
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
          className="text-sm font-semibold text-professors underline underline-offset-2"
          to={getProfPageRoute(professor.code)}
        >
          {professor.name}
        </RouterLink>
      ) : (
        <span className="text-sm font-semibold text-dark2">
          {professor.name}
        </span>
      )}
      {stats && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-dark2">
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
  <div className="grid gap-1 text-xs text-dark2">
    <div className="text-dark1">
      <span>{formatDays(meeting.days) || 'No days listed'}</span>
      <span className="mx-1">·</span>
      <span>{getMeetingTime(meeting)}</span>
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
      <div className="mb-2 flex items-start justify-between gap-2">
        <SectionName
          classNumber={section.class_number}
          hasConflict={hasConflict}
          sectionName={section.section_name}
        />
        {isEnrolled && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <CheckCircle aria-hidden="true" size={14} />
            Enrolled
          </span>
        )}
        {!isEnrolled && hasConflict && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-darkRed">
            <AlertTriangle aria-hidden="true" size={14} />
            Conflicts
          </span>
        )}
      </div>
      <div className="grid gap-2">
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
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-xs text-dark2">
          <strong
            className={cn(
              'font-semibold',
              openSeats === 0 ? 'text-darkRed' : 'text-dark1',
            )}
          >
            {openSeats}
          </strong>{' '}
          of {section.enrollment_capacity} {openSeats === 0 ? 'seats' : 'open'}
        </div>
        {!isEnrolled && !hasConflict && (
          <Button
            className="h-8 font-bold"
            onClick={() => onSwitchSection(section.id)}
            size="sm"
            type="button"
            variant="accent"
          >
            Choose section
          </Button>
        )}
      </div>
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

  return (
    <aside className="w-full overflow-hidden rounded border border-solid border-light3 bg-white shadow-box tablet:max-w-[360px]">
      {isLoading ? (
        <div className="flex min-h-[178px] items-center justify-center p-4">
          <LoadingSpinner />
        </div>
      ) : !selectedCourse ? (
        <div className="p-4">
          <EmptyState />
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3 border-0 border-b border-solid border-light3 px-4 py-3">
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
            <div>
              {sections.map((section) => (
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
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default ScheduleSwapPanel;
