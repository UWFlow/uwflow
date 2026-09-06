type MeetingWithSchedule = {
  days: unknown;
  start_date: unknown;
  end_date: unknown;
  start_seconds?: number | null;
  end_seconds?: number | null;
  location?: string | null;
  prof?: {
    id: number;
    code?: string | null;
    name?: string | null;
  } | null;
  is_closed?: boolean;
  is_cancelled?: boolean;
  is_tba?: boolean;
};

const normalizedDays = (days: unknown) =>
  Array.isArray(days) ? [...days].sort() : days;

const meetingScheduleKey = (meeting: MeetingWithSchedule) =>
  JSON.stringify({
    days: normalizedDays(meeting.days),
    startSeconds: meeting.start_seconds,
    endSeconds: meeting.end_seconds,
    location: meeting.location ?? null,
    profId: meeting.prof?.id ?? null,
    isClosed: meeting.is_closed ?? null,
    isCancelled: meeting.is_cancelled ?? null,
    isTba: meeting.is_tba ?? null,
  });

const earlierDate = <T>(first: T, second: T) =>
  String(first) <= String(second) ? first : second;

const laterDate = <T>(first: T, second: T) =>
  String(first) >= String(second) ? first : second;

/**
 * Collapses meeting rows whose schedule differs only by its active dates.
 * The merged row spans the earliest start and latest end date; differences in
 * days, time, location, professor, or status remain separate schedules.
 */
export const mergeMeetingDateRanges = <T extends MeetingWithSchedule>(
  meetings: readonly T[],
): T[] => {
  const meetingsBySchedule = new Map<string, T>();

  meetings.forEach((meeting) => {
    const key = meetingScheduleKey(meeting);
    const existing = meetingsBySchedule.get(key);

    meetingsBySchedule.set(
      key,
      existing
        ? {
            ...existing,
            start_date: earlierDate(existing.start_date, meeting.start_date),
            end_date: laterDate(existing.end_date, meeting.end_date),
          }
        : { ...meeting },
    );
  });

  return Array.from(meetingsBySchedule.values());
};
