import type { CalendarEvent } from './Calendar';

// Allocate lanes across each connected group of overlapping meetings. Checking
// only the previous meeting misses long classes spanning several shorter ones.
export const layoutCalendarEvents = (events: CalendarEvent[]) => {
  const placements = new Map<string, { column: number; columns: number }>();
  const days = new Set(events.map((event) => event.dayIndex));
  days.forEach((day) => {
    const ordered = events
      .filter((event) => event.dayIndex === day && event.state !== 'preview')
      .sort((a, b) => a.startMinutes - b.startMinutes);
    let group: { id: string; column: number }[] = [];
    let ends: number[] = [];
    const finishGroup = () => {
      group.forEach(({ id, column }) => {
        placements.set(id, { column, columns: ends.length });
      });
      group = [];
      ends = [];
    };
    ordered.forEach((event) => {
      if (ends.length && ends.every((end) => end <= event.startMinutes)) {
        finishGroup();
      }
      const available = ends.findIndex((end) => end <= event.startMinutes);
      const column = available === -1 ? ends.length : available;
      ends[column] = event.endMinutes;
      group.push({ id: event.id, column });
    });
    finishGroup();
  });
  return placements;
};
