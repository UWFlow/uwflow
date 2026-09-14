import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApolloQueryResult } from '@apollo/client';
import {
  GetUserQuery,
  GetUserQueryVariables,
  UserScheduleFragment,
} from 'generated/graphql';
import moment, { Moment } from 'moment/moment';
import { getCoursePageRoute } from 'Routes';
import { useTheme } from 'styled-components';

import { Calendar, CalendarEvent } from 'components/calendar';
import Button from 'components/input/Button';
import DropdownList from 'components/input/DropdownList';
import {
  BACKEND_ENDPOINT,
  CALENDAR_EXPORT_ENDPOINT,
  GOOGLE_CALENDAR_URL,
} from 'constants/Api';
import { SCHEDULE_UPLOAD_MODAL } from 'constants/Modal';
import useModal from 'hooks/useModal';
import { EventsByDate, ScheduleInterval } from 'types/Common';
import {
  formatCourseCode,
  getDateWithSeconds,
  millisecondsPerDay,
  weekDayLetters,
} from 'utils/Misc';
import { randString } from 'utils/Random';

import {
  ButtonWrapper,
  CalendarWithButtonsWrapper,
  ExportCalendarText,
  ExportCalendarWrapper,
  ProfileCalendarHeading,
  ProfileCalendarText,
  ProfileCalendarWrapper,
  RecentCalendarText,
  RecentCalendarWrapper,
} from './styles/ProfileCalendar';

const getDateRangeString = (start: Moment, end: Moment) => {
  if (start.year() !== end.year()) {
    return `${start.format('MMM Do, YYYY')} - ${end.format('MMM Do, YYYY')}`;
  }
  if (start.month() !== end.month()) {
    return `${start.format('MMM Do')} - ${end.format('MMM Do, YYYY')}`;
  }
  return `${start.format('MMM Do')} - ${end.format('Do, YYYY')}`;
};

const getScheduleRange = (
  schedule: UserScheduleFragment['schedule'],
): [Date, number] => {
  let minTime = new Date();
  let maxTime = new Date();

  schedule.forEach((curr) => {
    const { section } = curr;
    section.exams.forEach((exam) => {
      const examDate = new Date(exam.date);
      if (examDate < minTime) {
        minTime = examDate;
      } else if (examDate > maxTime) {
        maxTime = examDate;
      }
    });

    section.meetings.forEach((meeting) => {
      const meetingStart = new Date(meeting.start_date);
      const meetingEnd = new Date(meeting.end_date);
      if (meetingStart < minTime) {
        minTime = meetingStart;
      } else if (meetingEnd > maxTime) {
        maxTime = meetingEnd;
      }
    });
  });

  // increase date range to be safe
  minTime.setDate(minTime.getDate() - 1);
  maxTime.setDate(maxTime.getDate() + 1);

  // time for one day from milliseconds
  const dayRange =
    Math.round(maxTime.getTime() - minTime.getTime()) / millisecondsPerDay;
  return [minTime, dayRange];
};

// start and end inclusive
const getMomentsWithinRange = (
  start: Moment,
  end: Moment,
  dayOfWeek: string,
) => {
  const currentMoment = start.clone();
  const daysToReturn = [];
  while (currentMoment.isSameOrBefore(end)) {
    if (weekDayLetters[currentMoment.weekday() - 1] === dayOfWeek) {
      daysToReturn.push(currentMoment.clone().startOf('day'));
    }
    currentMoment.add(1, 'day');
  }
  return daysToReturn;
};

// e.g. "LEC 001 · Class #4021" — the class number is what students type into
// Quest, so it rides along with the section label wherever we have it.
const getMeetingSubtitle = ({ section, classNumber }: ScheduleInterval) =>
  classNumber == null ? section : `${section} · Class #${classNumber}`;

const getEventIntervals = (
  startDate: Moment,
  calendarDayRange: number,
  schedule: UserScheduleFragment['schedule'],
) =>
  schedule.reduce((allIntv: ScheduleInterval[], curr) => {
    const { section } = curr;
    section.exams.forEach((exam) => {
      allIntv.push({
        start: getDateWithSeconds(exam.date, exam.start_seconds),
        end: getDateWithSeconds(exam.date, exam.end_seconds),
        courseCode: section.course.code,
        location: exam.location,
        section: `${section.section_name} (Exam)`,
      });
    });

    section.meetings.forEach((meeting) => {
      const meetingStart = moment(meeting.start_date);
      const meetingEnd = moment(meeting.end_date);

      meeting.days.forEach((day: string) => {
        const momentsOfWeekForDay = getMomentsWithinRange(
          startDate.clone(),
          startDate.clone().add(calendarDayRange, 'days'),
          day,
        );
        momentsOfWeekForDay.forEach((momentOfWeekForDay) => {
          if (
            momentOfWeekForDay.isSameOrAfter(meetingStart, 'days') &&
            momentOfWeekForDay.isSameOrBefore(meetingEnd, 'days')
          ) {
            allIntv.push({
              start: momentOfWeekForDay
                .clone()
                .add(meeting.start_seconds, 'seconds'),
              end: momentOfWeekForDay
                .clone()
                .add(meeting.end_seconds, 'seconds'),
              courseCode: section.course.code,
              location: meeting.location,
              section: section.section_name,
              classNumber: section.class_number,
            });
          }
        });
      });
    });

    return allIntv;
  }, []);

const getEventsByDate = (events: ScheduleInterval[]) => {
  const eventsByDate: EventsByDate = {};
  events.forEach((event) => {
    const dateString = event.start.format('YYYY-MM-DD');
    if (!eventsByDate[dateString]) {
      eventsByDate[dateString] = [event];
    } else {
      eventsByDate[dateString].push(event);
    }
  });
  return eventsByDate;
};

const getInitialMonday = (eventsByDate: EventsByDate) => {
  const currentDate = moment();
  const dates = Object.keys(eventsByDate).sort((a, b) =>
    moment(a, 'YYYY-MM-DD').isBefore(moment(b, 'YYYY-MM-DD')) ? -1 : 1,
  );
  const currentWeekMonday = currentDate.startOf('isoWeek');
  if (dates.length === 0) {
    return currentWeekMonday;
  }
  const scheduleFirstDay = moment(dates[0], 'YYYY-MM-DD');
  if (currentDate.isBefore(scheduleFirstDay)) {
    return scheduleFirstDay.startOf('isoWeek');
  }
  return currentWeekMonday;
};

type WeekView = {
  /** Events for the visible week, mapped onto the generic calendar. */
  events: CalendarEvent[];
  /** Header label for each displayed column. */
  dayLabels: string[];
  minHour: number;
  maxHour: number;
  /** Hours of class this week, rounded to the nearest half hour. */
  totalHours: number;
  /** Inclusive date range covered by the displayed columns. */
  rangeStart: Moment;
  rangeEnd: Moment;
};

// All of the per-week math the calendar grid used to own: the dynamic hour
// range, the Saturday-only-if-needed column rule, total class hours, and the
// translation of each ScheduleInterval into a presentational CalendarEvent.
const buildWeekView = (
  weekStart: Moment,
  eventsByDate: EventsByDate,
): WeekView => {
  const dayDates: Moment[] = [];
  for (let i = 0; i < 6; i += 1) {
    dayDates.push(weekStart.clone().add(i, 'days'));
  }

  // Only show Saturday when it actually has events.
  const hasSaturdayEvents =
    eventsByDate[dayDates[5].format('YYYY-MM-DD')] !== undefined;
  const visibleDays = hasSaturdayEvents ? dayDates : dayDates.slice(0, 5);

  // Dynamic time range, widened from the default 9am-5pm by the day's events.
  let minHour = 9;
  let maxHour = 17;
  let totalMinutes = 0;

  visibleDays.forEach((day) => {
    const dayEvents = eventsByDate[day.format('YYYY-MM-DD')] ?? [];
    dayEvents.forEach((event) => {
      if (event.start.hour() <= minHour) {
        minHour = event.start.hour();
        if (event.start.minutes() === 0) {
          minHour -= 1;
        }
      }
      if (event.end.hour() >= maxHour) {
        maxHour = event.end.hour();
        // minutes might be in the middle of the hour
        if (event.end.minutes() > 0) {
          maxHour += 1;
        }
      }
      totalMinutes += Math.abs(
        moment.duration(event.start.diff(event.end)).asMinutes(),
      );
    });
  });

  const events: CalendarEvent[] = visibleDays.flatMap((day, dayIndex) => {
    const dayEvents = eventsByDate[day.format('YYYY-MM-DD')] ?? [];
    return dayEvents.map((event, i) => {
      const isExam = event.section.includes('Exam');
      const courseLink = (
        <RouterLink
          to={getCoursePageRoute(event.courseCode)}
          className="font-semibold text-dark1 no-underline hover:underline"
        >
          {formatCourseCode(event.courseCode)}
        </RouterLink>
      );

      return {
        id: `${day.format('YYYY-MM-DD')}-${i}`,
        dayIndex,
        startMinutes: event.start.hour() * 60 + event.start.minutes(),
        endMinutes: event.end.hour() * 60 + event.end.minutes(),
        // Blocks are coloured per course, so an exam shares its course's hue.
        colorKey: event.courseCode,
        // Exams fold the section into the bold title; meetings show the code
        // as the title with the section and its Quest class number as the
        // muted subtitle line, matching the swap page.
        title: isExam ? (
          <>
            {courseLink}
            <br />
            {event.section}
          </>
        ) : (
          courseLink
        ),
        subtitle: isExam ? undefined : getMeetingSubtitle(event),
        // Compact 24-hour range to match the swap page, e.g. "08:30–09:20".
        timeLabel: `${event.start.format('HH:mm')}–${event.end.format(
          'HH:mm',
        )}`,
        location: event.location,
      };
    });
  });

  return {
    events,
    // Short day-of-week + date, e.g. "Mon 9" (the calendar header band
    // uppercases it to match the swap page's static MON-FRI labels).
    dayLabels: visibleDays.map((day) => day.format('ddd D')),
    minHour,
    maxHour,
    totalHours: Math.round((2 * totalMinutes) / 60) / 2,
    rangeStart: visibleDays[0],
    rangeEnd: visibleDays[visibleDays.length - 1],
  };
};

type ProfileWeekCalendarProps = {
  eventsByDate: EventsByDate;
  initialMonday: Moment;
};

// Owns the week-navigation state and feeds the generic calendar's built-in
// header: the date-range title, the hours-this-week subtitle and the prev /
// next / current-week callbacks.
const ProfileWeekCalendar = ({
  eventsByDate,
  initialMonday,
}: ProfileWeekCalendarProps) => {
  const [weekStart, setWeekStart] = useState(initialMonday);
  const week = buildWeekView(weekStart, eventsByDate);

  return (
    <Calendar
      className="border-b-2 border-light3"
      headerTitle={getDateRangeString(week.rangeStart, week.rangeEnd)}
      headerSubtitle={`(${week.totalHours} hours this week)`}
      onCurrentWeek={() => setWeekStart(initialMonday)}
      onPrevWeek={() => setWeekStart(weekStart.clone().subtract(7, 'days'))}
      onNextWeek={() => setWeekStart(weekStart.clone().add(7, 'days'))}
      dayLabels={week.dayLabels}
      events={week.events}
      minHour={week.minHour}
      maxHour={week.maxHour}
    />
  );
};

type ProfileCalendarProps = {
  schedule: UserScheduleFragment['schedule'];
  secretId: string;
  refetchAll: (
    variables: GetUserQueryVariables,
  ) => Promise<ApolloQueryResult<GetUserQuery>>;
};

const ProfileCalendar = ({
  schedule,
  secretId,
  refetchAll,
}: ProfileCalendarProps) => {
  const [openModal, closeModal] = useModal();
  const theme = useTheme();

  const handleCalendarExport = async (download: boolean) => {
    const response = await fetch(
      `${BACKEND_ENDPOINT}${CALENDAR_EXPORT_ENDPOINT(secretId)}`,
    );
    if (download) {
      window.location.assign(response.url);
    } else {
      // Replace https:// with webcal:// and append random query
      // parameter to avoid cache issues with Google Calendar
      const calendarUrl = response.url
        .replace(/^https:\/\//, 'webcal://')
        .concat(`?noCache=${randString()}`);
      window.open(`${GOOGLE_CALENDAR_URL}${calendarUrl}`, '_blank');
    }
  };

  const scheduleModalProps = {
    onSkip: () => closeModal(SCHEDULE_UPLOAD_MODAL),
    onAfterUploadSuccess: refetchAll,
  };

  const ScheduleModalButton = (
    <Button
      handleClick={() => openModal(SCHEDULE_UPLOAD_MODAL, scheduleModalProps)}
      margin="0"
      padding="8px 24px"
      maxHeight="48px"
      hasShadow={false}
      width="100%"
    >
      Add current / upcoming term
    </Button>
  );

  if (!schedule || schedule.length === 0)
    return (
      <ProfileCalendarWrapper>
        <ProfileCalendarHeading>
          Import your class schedule
        </ProfileCalendarHeading>
        <ProfileCalendarText>
          To export it to Google Calendar, Calendar.app, etc...
        </ProfileCalendarText>
        {ScheduleModalButton}
      </ProfileCalendarWrapper>
    );

  const [minDate, dayRange] = getScheduleRange(schedule);
  const events = getEventIntervals(moment(minDate), dayRange, schedule);
  const eventsByDate = getEventsByDate(events);
  const initialMonday = getInitialMonday(eventsByDate);

  return (
    <CalendarWithButtonsWrapper>
      <ExportCalendarWrapper>
        <ExportCalendarText>Export your calendar</ExportCalendarText>
        <DropdownList
          selectedIndex={-1}
          options={['Google', 'iCalendar']}
          margin="auto 0"
          onChange={(value) => {
            if (value === 0) {
              handleCalendarExport(false);
            } else {
              handleCalendarExport(true);
            }
          }}
          color={theme.primary}
          placeholder="Export as"
        />
      </ExportCalendarWrapper>
      <ProfileWeekCalendar
        eventsByDate={eventsByDate}
        initialMonday={initialMonday}
      />
      <RecentCalendarWrapper>
        <RecentCalendarText>Have a more recent schedule?</RecentCalendarText>
        <ButtonWrapper>{ScheduleModalButton}</ButtonWrapper>
      </RecentCalendarWrapper>
    </CalendarWithButtonsWrapper>
  );
};

export default ProfileCalendar;
