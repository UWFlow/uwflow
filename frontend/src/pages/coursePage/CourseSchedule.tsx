import React, { useState } from 'react';
import {
  CourseScheduleFragment,
  GetCourseWithUserDataQuery,
  Prof,
  Section_Meeting,
} from 'generated/graphql';
import moment from 'moment/moment';

import LastUpdatedSchedule from 'components/common/LastUpdatedSchedule';
import CollapsibleContainer from 'components/display/CollapsibleContainer';
import TabContainer from 'components/display/TabContainer';
import Table from 'components/display/Table';
import { SECTION_ORDER } from 'constants/CourseSection';
import { secsToTime, termCodeToDate, weekDayLetters } from 'utils/Misc';
import { mergeMeetingDateRanges } from 'utils/Schedule';

import {
  CourseScheduleWrapper,
  ScheduleTableWrapper,
} from './styles/CourseSchedule';
import { courseScheduleTableColumns } from './CourseScheduleTableColumns';

/*
 * Quest can split one weekly schedule into several meeting rows whose only
 * difference is the active date range. Merge those variants first, then retain
 * the existing time-of-day grouping for the course summary.
 */

type Meeting = Pick<
  Section_Meeting,
  | 'days'
  | 'start_date'
  | 'end_date'
  | 'start_seconds'
  | 'end_seconds'
  | 'location'
  | 'is_closed'
  | 'is_cancelled'
  | 'is_tba'
> & {
  prof?: Pick<Prof, 'id' | 'code' | 'name'> | null;
};

type TimeRange = {
  days: string[];
  startDate: any;
  endDate: any;
};

type InfoGroup = {
  time: string;
  location?: string | null;
  prof?: Pick<Prof, 'id' | 'code' | 'name'> | object;
  timeRanges: TimeRange[];
  cancelled: boolean;
  isTba: boolean;
};

const getInfoGroupings = (meetings: Meeting[]) => {
  const groupedByTimeOfDay = mergeMeetingDateRanges(meetings).reduce(
    (groupings: { [key: string]: InfoGroup }, curr) => {
      const key = `${curr.start_seconds} ${curr.end_seconds}`;
      if (!groupings[key]) {
        groupings[key] = {
          time: `${secsToTime(curr.start_seconds ?? 0)} - ${secsToTime(
            curr.end_seconds ?? 0,
          )}`,
          location: curr.location,
          prof:
            curr.prof && curr.prof.code
              ? {
                  id: curr.prof.id,
                  code: curr.prof.code,
                  name: curr.prof.name,
                }
              : {},
          timeRanges: [],
          cancelled: curr.is_cancelled,
          isTba: curr.is_tba,
        };
      }

      groupings[key].timeRanges.push({
        days: curr.days,
        startDate: curr.start_date,
        endDate: curr.end_date,
      });
      return groupings;
    },
    {},
  );

  const infoGroups: InfoGroup[] = [];

  // Sort timeRanges for each group
  Object.entries(groupedByTimeOfDay).forEach((entry) => {
    entry[1].timeRanges.sort((a, b) => a.startDate - b.startDate);
    infoGroups.push(entry[1]);
  });

  // Merge and sort days of week for timeRanges that occur in the same date range
  infoGroups.forEach((entry) => {
    const newTimeRanges: TimeRange[] = [];
    let newDays: string[] = [];

    entry.timeRanges.forEach((currRange, i) => {
      if (i < entry.timeRanges.length - 1) {
        const nextRange = entry.timeRanges[i + 1];
        if (
          currRange.startDate === nextRange.startDate &&
          currRange.endDate === nextRange.endDate
        ) {
          currRange.days.forEach((day) => {
            if (!newDays.includes(day)) {
              newDays.push(day);
            }
          });
          return;
        }
      }

      currRange.days.forEach((day) => {
        if (!newDays.includes(day) && weekDayLetters.includes(day)) {
          newDays.push(day);
        }
      });

      newDays.sort(
        (a, b) => weekDayLetters.indexOf(a) - weekDayLetters.indexOf(b),
      );
      newTimeRanges.push({
        days: newDays,
        startDate: currRange.startDate,
        endDate: currRange.endDate,
      });
      newDays = [];
    });
    entry.timeRanges = newTimeRanges;
  });

  const numDates = infoGroups.map((group) => group.timeRanges.length);

  return {
    times: infoGroups.map((group, i) =>
      Object({
        time: group.time,
        spaces: numDates[i] - 1,
        cancelled: group.cancelled,
        isTba: group.isTba,
      }),
    ),
    locations: infoGroups.map((group, i) =>
      Object({ location: group.location, spaces: numDates[i] - 1 }),
    ),
    profs: infoGroups.map((group, i) =>
      Object({ prof: group.prof, spaces: numDates[i] - 1 }),
    ),
    dates: infoGroups.map((group) => group.timeRanges),
  };
};

const getStartingTab = (termsOffered: number[]) => {
  for (let i = 0; i < termsOffered.length; i += 1) {
    const term = termsOffered[i];
    const month = term % 10;
    const year = 1900 + Math.floor(term / 10);
    const currentTime = moment();
    const termStart = moment(`${month}-${year}`, 'MM-YYYY');
    const displayStart = termStart.clone().subtract(2, 'months');
    const displayEnd = termStart.clone().add(2, 'months');
    if (currentTime.isBetween(displayStart, displayEnd)) {
      return i;
    }
  }
  return 0;
};

type CourseScheduleProps = {
  courseCode: string;
  courseId: number;
  sections?: CourseScheduleFragment['sections'];
  sectionSubscriptions?: GetCourseWithUserDataQuery['queue_section_subscribed'];
  userEmail?: string | null;
};

const CourseSchedule = ({
  courseCode,
  courseId,
  sections = [],
  sectionSubscriptions = [],
  userEmail = null,
}: CourseScheduleProps) => {
  let termsOffered = sections.reduce((allTerms: number[], curr) => {
    if (!allTerms.includes(curr.term_id)) {
      allTerms.push(curr.term_id);
    }
    return allTerms;
  }, []);

  const hasBell: { [key: number]: boolean } = {};
  termsOffered.forEach((term) => {
    hasBell[term] = sections.some((section) => {
      return (
        section.enrollment_total >= section.enrollment_capacity &&
        section.term_id === term
      );
    });
  });
  termsOffered = termsOffered.sort().reverse();

  const startingTab = getStartingTab(termsOffered);
  const [selectedTerm, setSelectedTerm] = useState(startingTab);

  if (sections.length === 0) {
    return null;
  }

  const subscribedSectionIDs = sectionSubscriptions.map(
    (subscription) => subscription.section_id,
  );

  const sectionsCleanedData = sections
    .map((s) => ({
      section: s.section_name,
      class: s.class_number,
      term: s.term_id,
      enrolled: {
        course_id: courseId,
        course_code: courseCode,
        section_id: s.id,
        filled: s.enrollment_total,
        capacity: s.enrollment_capacity,
        hasBell: hasBell[s.term_id],
        selected: subscribedSectionIDs.includes(s.id),
        userEmail,
      },
      cancelled: sections.reduce((isCancelled, current) => {
        return (
          isCancelled ||
          (current.term_id === s.term_id &&
            current.meetings.reduce((cancelled, cur) => {
              return cancelled || cur.is_cancelled;
            }, false))
        );
      }, false),
      // Every grouping contains a single time of day, location, and instructor
      // and the classes that occur with those parameters.
      ...getInfoGroupings(s.meetings),
    }))
    .sort((a, b) => {
      const sectionTypeA = a.section.split(' ')[0];
      const sectionTypeB = b.section.split(' ')[0];
      if (SECTION_ORDER[sectionTypeA] === SECTION_ORDER[sectionTypeB]) {
        return a.section.localeCompare(b.section);
      }
      return SECTION_ORDER[sectionTypeA] - SECTION_ORDER[sectionTypeB];
    });

  const tabList = termsOffered.map((term) => {
    return {
      title: termCodeToDate(term),
      render: () => (
        <>
          <ScheduleTableWrapper>
            <Table
              cellPadding="4px 0"
              columns={courseScheduleTableColumns}
              data={sectionsCleanedData.filter((c) => c.term === term)}
              getRowProps={(row: any) =>
                row ? { disabled: row.original.cancelled } : {}
              }
            />
          </ScheduleTableWrapper>
        </>
      ),
      onClick: () => null,
    };
  });

  const updatedAt = moment.max(sections.map((s) => moment(s.updated_at)));

  return (
    <CourseScheduleWrapper>
      <CollapsibleContainer
        title="Course Schedule"
        centerHeader={false}
        margin="0"
        headerBorder
        bigTitle
      >
        <TabContainer
          initialSelectedTab={startingTab}
          tabList={tabList}
          contentPadding={'0'}
          borderRadius={false}
          onChange={setSelectedTerm}
        />
      </CollapsibleContainer>
      {tabList.length > 0 && (
        <LastUpdatedSchedule
          margin={'8px 0 32px 0'}
          courseCode={courseCode}
          term={termsOffered[selectedTerm]}
          updatedAt={updatedAt}
        />
      )}
    </CourseScheduleWrapper>
  );
};

export default CourseSchedule;
