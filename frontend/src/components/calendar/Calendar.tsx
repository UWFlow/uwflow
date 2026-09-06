import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';

import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';

// Vertical pixels per hour of the day; the single source of truth for the
// time grid and for translating an event's start/end into a pixel offset.
export const HOUR_HEIGHT = 64;
// Height reserved at the top of each day column for its header label.
const HEADER_HEIGHT = 32;
// Width of the left gutter that holds the hour labels.
const TIME_WIDTH = 64;

/**
 * Visual state of an event block:
 * - `default`  — a normal block.
 * - `selected` — emphasised with a gold fill, border and left rail.
 * - `dimmed`   — faded, e.g. existing events while a preview is shown.
 * - `preview`  — a translucent, dashed, slightly blurred "ghost" laid on top;
 *                non-interactive so it never intercepts clicks.
 */
export type CalendarEventState = 'default' | 'selected' | 'dimmed' | 'preview';

export type CalendarEvent = {
  /** Stable identity, used as the React key. */
  id: string;
  /** Column the event belongs to, indexing into `dayLabels`. */
  dayIndex: number;
  /** Minutes since midnight. */
  startMinutes: number;
  endMinutes: number;
  /**
   * What the block's colour is keyed on — the course code. Every event sharing
   * a key gets the same hue; the section type is left to the text label.
   */
  colorKey?: string;
  state?: CalendarEventState;
  /**
   * Side to occupy when sharing a slot with another event. Left unset, the
   * calendar derives this automatically for overlapping non-preview events.
   */
  truncate?: 'left' | 'right';
  title?: ReactNode;
  subtitle?: ReactNode;
  timeLabel?: ReactNode;
  location?: ReactNode;
  onClick?: () => void;
};

export type CalendarProps = {
  /** One label per displayed day, left to right. */
  dayLabels: ReactNode[];
  events: CalendarEvent[];
  /** Inclusive hour bounds of the visible grid. */
  minHour: number;
  maxHour: number;
  /**
   * When false the grid is purely presentational: no hover affordances, no
   * pointer cursor and no click handlers fire. Useful for read-only previews.
   */
  interactive?: boolean;
  /**
   * Built-in navigation header rendered above the grid. Shown by default; pass
   * `showHeader={false}` to drop it entirely (read-only previews, or pages that
   * supply their own chrome).
   */
  showHeader?: boolean;
  /** Primary line at the left of the header, e.g. the visible date range. */
  headerTitle?: ReactNode;
  /** Secondary line under the title, e.g. "(12 hours this week)". */
  headerSubtitle?: ReactNode;
  /** Jump back to the starting week. Its button renders only when provided. */
  onCurrentWeek?: () => void;
  /** Step one week earlier. Its button renders only when provided. */
  onPrevWeek?: () => void;
  /** Step one week later. Its button renders only when provided. */
  onNextWeek?: () => void;
  className?: string;
};

// Soft grid line. (The fainter half-hour line is written inline below so
// Tailwind's JIT scanner can see the full class.)
const GRID_LINE = 'border-light3';

// One hue per course, keyed on `colorKey`: the section type is already spelled
// out in each block's label ("LEC 001"), while the course had no visual
// identifier at all. Full class strings so Tailwind's JIT scanner sees them.
// Gold is left out on purpose (it marks the selected block on the swap page),
// and so is grey — a grey block reads as disabled next to the coloured ones.
const COURSE_COLORS = [
  { rail: 'border-primary', fill: 'bg-[#f0f6ff]', ghost: 'bg-[#f0f6ff]/60' },
  { rail: 'border-[#36b37e]', fill: 'bg-[#ebf9f3]', ghost: 'bg-[#ebf9f3]/60' },
  { rail: 'border-[#6554c0]', fill: 'bg-[#f2f0fc]', ghost: 'bg-[#f2f0fc]/60' },
  { rail: 'border-[#ff8b00]', fill: 'bg-[#fff4e6]', ghost: 'bg-[#fff4e6]/60' },
  { rail: 'border-[#2b8fcd]', fill: 'bg-[#f0fdff]', ghost: 'bg-[#f0fdff]/60' },
  { rail: 'border-[#d83ba0]', fill: 'bg-[#fdeff8]', ghost: 'bg-[#fdeff8]/60' },
  { rail: 'border-[#de350b]', fill: 'bg-[#fdefeb]', ghost: 'bg-[#fdefeb]/60' },
];

// Blocks with no course key (rare — every caller passes a course code).
const DEFAULT_COURSE_COLOR = {
  rail: 'border-dark3',
  fill: 'bg-[#eaecef]',
  ghost: 'bg-[#eaecef]/60',
};

// State -> extra block classes, layered on top of the base block + colour.
const STATE_CLASS: Record<CalendarEventState, string> = {
  default: '',
  // Gold highlight: the fill/border swap to accent tokens happens in
  // renderEvent; the ring thickens the gold border on all four sides.
  selected: 'z-20 ring-1 ring-accentDark',
  dimmed: 'opacity-[0.38]',
  // Ghost: dashed, blurred and lifted above real events; never clickable.
  preview: 'z-30 border-dashed blur-[1px] pointer-events-none',
};

// Week-nav buttons, styled to match the app's `input/Button`: a light, bordered
// face with the Anderson heading font and a brightness(85%) hover. Layered over
// the shared Button's subtle variant (which already supplies the dark text and
// light hover background) via `cn`, so these win over its size defaults.
const NAV_BUTTON_CLASS =
  'ml-1 h-12 rounded-lg border-2 border-solid border-light3 bg-light1 font-anderson text-lg font-semibold transition-all hover:brightness-[0.85]';

// 24-hour gutter labels: "09:00", "10:00", ...
const formatHour = (hour: number) => `${`${hour}`.padStart(2, '0')}:00`;

// Derive left/right placement for overlapping non-preview events within each
// column. Preview ghosts are skipped so they layer cleanly on top, and any
// caller-provided `truncate` is left untouched.
const deriveTruncation = (events: CalendarEvent[]) => {
  const sides: Record<string, 'left' | 'right'> = {};
  const byColumn = new Map<number, CalendarEvent[]>();

  events.forEach((event) => {
    if (event.state === 'preview') return;
    const column = byColumn.get(event.dayIndex) ?? [];
    column.push(event);
    byColumn.set(event.dayIndex, column);
  });

  byColumn.forEach((column) => {
    const ordered = [...column].sort((a, b) => a.startMinutes - b.startMinutes);
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      if (prev.endMinutes > curr.startMinutes) {
        const prevSide = sides[prev.id] ?? (sides[prev.id] = 'left');
        sides[curr.id] = prevSide === 'left' ? 'right' : 'left';
      }
    }
  });

  return sides;
};

/**
 * A purely presentational week-grid calendar. It knows nothing about Moment,
 * Apollo or the schedule shape — callers map their domain onto `CalendarEvent`s
 * and supply `dayLabels` and the visible hour range.
 *
 * The section-swap page reuses this directly:
 * - enrolled classes are `default` events;
 * - the class being swapped is `selected` (gold fill, border and left rail);
 * - while a candidate section is previewed, the enrolled blocks it would
 *   replace become `dimmed`, and the candidate is a `preview` ghost
 *   (translucent + dashed + `blur-[1px]`, non-interactive);
 * - a read-only summary can pass `interactive={false}` to drop all hover and
 *   click affordances.
 */
const Calendar = ({
  dayLabels,
  events,
  minHour,
  maxHour,
  interactive = true,
  showHeader = true,
  headerTitle,
  headerSubtitle,
  onCurrentWeek,
  onPrevWeek,
  onNextWeek,
  className,
}: CalendarProps) => {
  const derivedSides = deriveTruncation(events);
  // Palette slot per course, by alphabetical order of the codes on screen, so
  // every course visible at once gets a different hue.
  const courseKeys = Array.from(
    new Set(
      events.flatMap((event) => (event.colorKey ? [event.colorKey] : [])),
    ),
  ).sort();

  const hours: number[] = [];
  for (let hour = minHour; hour <= maxHour; hour += 1) hours.push(hour);

  const renderEvent = (event: CalendarEvent) => {
    const slot = event.colorKey ? courseKeys.indexOf(event.colorKey) : -1;
    const color =
      slot === -1
        ? DEFAULT_COURSE_COLOR
        : COURSE_COLORS[slot % COURSE_COLORS.length];
    const state = event.state ?? 'default';
    const isPreview = state === 'preview';
    const isSelected = state === 'selected';
    // Preview ghosts overlay full-width and ignore overlap truncation.
    const truncate = isPreview
      ? undefined
      : event.truncate ?? derivedSides[event.id];
    const clickable = interactive && !isPreview && Boolean(event.onClick);

    // Map minutes-since-midnight to a pixel offset within the hour grid.
    const top =
      ((event.startMinutes - minHour * 60) / 60) * HOUR_HEIGHT + HEADER_HEIGHT;
    const height =
      ((event.endMinutes - event.startMinutes) / 60) * HOUR_HEIGHT - 2;

    return (
      <div
        key={event.id}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? event.onClick : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                // Activate with Enter/Space like a native button so the
                // calendar is usable without a mouse.
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  event.onClick?.();
                }
              }
            : undefined
        }
        style={{ top, height }}
        className={cn(
          // Base block: rounded, solid course fill with a thick accent left
          // rail; the text stack is vertically centered but left-aligned, with
          // a little left padding to clear the rail, clipping rather than
          // wrapping when the block is short or narrow.
          'absolute z-10 flex flex-col justify-center overflow-hidden whitespace-nowrap rounded border border-l-4 border-solid pl-1.5 pr-1 leading-tight text-dark1',
          // Selected blocks swap the course fill/accent for the gold tokens
          // (gold border on all four sides plus the thick gold rail). The fill
          // is accent @20% composited on white, opaque like the course fills.
          isSelected
            ? 'border-accentDark bg-[#fff3cc]'
            : [isPreview ? color.ghost : color.fill, color.rail],
          // Outside preview ghosts, only the left rail keeps the saturated
          // accent; the other sides stay transparent like the mockup.
          !isSelected &&
            !isPreview &&
            'border-y-transparent border-r-transparent',
          STATE_CLASS[state],
          // Width / side when sharing a slot with an overlapping event.
          truncate === 'left' && 'left-0 w-[calc(50%-4px)]',
          truncate === 'right' && 'right-1 w-[calc(50%-4px)]',
          !truncate && 'w-[calc(100%-4px)]',
          clickable && 'cursor-pointer',
          // Lift a stacked event clear of its neighbour on hover.
          interactive &&
            !isPreview &&
            truncate &&
            'transition-all hover:z-20 hover:w-[calc(100%-4px)]',
        )}
      >
        {event.title && (
          <div className="w-full truncate text-xs font-semibold">
            {event.title}
          </div>
        )}
        {(event.timeLabel || event.location) && (
          <div className="w-full truncate text-[11px] text-dark2">
            {event.timeLabel}
            {event.timeLabel && event.location && ' · '}
            {event.location}
          </div>
        )}
        {event.subtitle && (
          <div className="w-full truncate text-[10px] text-dark3">
            {event.subtitle}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('relative bg-white', className)}>
      {showHeader && (
        <div className="flex items-end justify-between border-b-2 border-light3 p-4 tablet:px-8">
          <div>
            {headerTitle != null && (
              <div className="font-anderson text-xl font-semibold text-dark1">
                {headerTitle}
              </div>
            )}
            {headerSubtitle != null && (
              <div className="text-base font-normal text-dark2">
                {headerSubtitle}
              </div>
            )}
          </div>
          <div className="flex">
            {onCurrentWeek && (
              <Button
                type="button"
                variant="subtle"
                // "Current Week" is hidden on very small screens, matching the
                // legacy hideSmall behaviour (max-width: 480px).
                className={cn(NAV_BUTTON_CLASS, 'px-8 max-[480px]:hidden')}
                onClick={onCurrentWeek}
                onMouseDown={(e) => e.preventDefault()}
              >
                Current Week
              </Button>
            )}
            {onPrevWeek && (
              <Button
                type="button"
                variant="subtle"
                className={cn(NAV_BUTTON_CLASS, 'w-12 px-0')}
                onClick={onPrevWeek}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronLeft />
              </Button>
            )}
            {onNextWeek && (
              <Button
                type="button"
                variant="subtle"
                className={cn(NAV_BUTTON_CLASS, 'w-12 px-0')}
                onClick={onNextWeek}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronRight />
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="relative">
        {/* Background hour grid; defines the overall height. */}
        <div>
          <div style={{ height: HEADER_HEIGHT }} />
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: HOUR_HEIGHT }}
              className={cn(
                'relative border-0 border-t border-solid px-4',
                GRID_LINE,
                // Fainter solid line halfway down each hour row.
                "after:absolute after:left-16 after:right-0 after:top-1/2 after:-mt-px after:border-t after:border-solid after:border-light2 after:content-['']",
              )}
            >
              <div className="mt-1 text-xs text-dark3">{formatHour(hour)}</div>
            </div>
          ))}
        </div>
        {/* Day columns + positioned events, overlaid on the hour grid. */}
        <div
          style={{ left: TIME_WIDTH }}
          className={cn(
            // overflow-auto lets the columns scroll horizontally on narrow
            // viewports rather than being clipped.
            'absolute inset-y-0 right-0 flex overflow-auto border-0 border-l border-solid',
            GRID_LINE,
          )}
        >
          {dayLabels.map((label, column) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={column}
              className={cn(
                'relative min-w-[136px] flex-1 border-0 border-r border-solid last:border-r-0',
                GRID_LINE,
              )}
            >
              <div className="absolute inset-x-0 top-0 flex h-8 items-center justify-center text-xs uppercase tracking-wide text-dark3">
                {label}
              </div>
              {events
                .filter((event) => event.dayIndex === column)
                .map(renderEvent)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
