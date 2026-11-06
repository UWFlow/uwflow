import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'react-feather';
import { FixedSizeList as List } from 'react-window';
import fuzzysort from 'fuzzysort';
import useOnClickOutside from 'use-onclickoutside';

import { cn } from 'lib/utils';
import { formatCourseCode } from 'utils/Misc';

export type PickerCourse = {
  code: string;
  name: string;
};

type CoursePickerProps = {
  ariaLabel: string;
  courses: PickerCourse[];
  selectedCode: string;
  onSelect: (code: string) => void;
  // Opens the menu toward the panel's interior: the first picker sits at the
  // panel's left edge, the second near its right edge.
  align?: 'left' | 'right';
  searchable?: boolean;
};

const ROW_HEIGHT = 44;
const MAX_ROWS = 7;

// Swap-page course selector: code + name rows, a focused search box, and the
// current course scrolled into view. The term's course list runs to thousands,
// so rows are virtualized.
const CoursePicker = ({
  ariaLabel,
  courses,
  selectedCode,
  onSelect,
  align = 'left',
  searchable = false,
}: CoursePickerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const searchTargets = useMemo(
    () =>
      courses.map((course) => ({
        course,
        // Match "math137", "MATH 137", or words from the name.
        key: `${course.code} ${formatCourseCode(course.code)} ${course.name}`,
      })),
    [courses],
  );

  const results = useMemo(() => {
    if (!query.trim()) return courses;
    return fuzzysort
      .go(query, searchTargets, { key: 'key', limit: 100, threshold: -10000 })
      .map((result) => result.obj.course);
  }, [query, courses, searchTargets]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    setQuery('');
    if (restoreFocus) triggerRef.current?.focus();
  };

  useOnClickOutside(wrapperRef, () => open && close(false));

  // On open (and while typing), point the active row at the current course
  // when it's listed, else the best match.
  useEffect(() => {
    if (!open) return;
    const selected = results.findIndex(({ code }) => code === selectedCode);
    const next = query.trim() || selected === -1 ? 0 : selected;
    setActiveIndex(next);
    listRef.current?.scrollToItem(next, 'center');
  }, [open, query, results, selectedCode]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const choose = (code: string) => {
    onSelect(code);
    close(true);
  };

  const moveActive = (delta: number) => {
    if (results.length === 0) return;
    const next = (activeIndex + delta + results.length) % results.length;
    setActiveIndex(next);
    listRef.current?.scrollToItem(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (results[activeIndex]) choose(results[activeIndex].code);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    }
  };

  const listboxId = `${ariaLabel.replace(/\s+/g, '-').toLowerCase()}-options`;

  return (
    <div className="relative min-w-0" ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${ariaLabel}: ${formatCourseCode(selectedCode)}`}
        className={cn(
          'flex max-w-full cursor-pointer items-center gap-0.5 rounded border-none bg-transparent px-1.5 py-1 font-inter text-md font-semibold text-courses transition-colors hover:bg-light1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          open && 'bg-light1',
        )}
        onClick={() => (open ? close(false) : setOpen(true))}
        onKeyDown={(event) => {
          if (!open && event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          } else if (open) {
            handleKeyDown(event);
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="truncate">{formatCourseCode(selectedCode)}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
          size={16}
        />
      </button>
      {open && (
        <div
          className={cn(
            'absolute top-full z-20 mt-1 w-[320px] overflow-hidden rounded border border-solid border-light3 bg-white shadow-box',
            align === 'left' ? 'left-0' : 'right-0',
          )}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-0 border-b border-solid border-light3 px-3">
              <Search aria-hidden="true" className="text-dark3" size={16} />
              <input
                aria-activedescendant={
                  results[activeIndex]
                    ? `${listboxId}-${results[activeIndex].code}`
                    : undefined
                }
                aria-controls={listboxId}
                aria-label={`Search ${ariaLabel.toLowerCase()}`}
                className="h-10 min-w-0 flex-1 border-none bg-transparent font-inter text-sm text-dark1 outline-none placeholder:text-dark3"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by code or name"
                ref={searchRef}
                role="combobox"
                aria-expanded="true"
                value={query}
              />
            </div>
          )}
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-dark3">
              No courses match “{query}”
            </div>
          ) : (
            <div aria-label={ariaLabel} id={listboxId} role="listbox">
              <List
                height={Math.min(results.length, MAX_ROWS) * ROW_HEIGHT}
                itemCount={results.length}
                itemKey={(index) => results[index].code}
                itemSize={ROW_HEIGHT}
                ref={listRef}
                width="100%"
              >
                {({ index, style }) => {
                  const course = results[index];
                  const isSelected = course.code === selectedCode;
                  return (
                    <div
                      aria-selected={isSelected}
                      className={cn(
                        'box-border flex cursor-pointer items-center gap-2 px-3',
                        index === activeIndex && 'bg-light1',
                      )}
                      id={`${listboxId}-${course.code}`}
                      onClick={() => choose(course.code)}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      style={style}
                    >
                      <span className="w-[76px] shrink-0 truncate text-sm font-semibold text-courses">
                        {formatCourseCode(course.code)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-dark2">
                        {course.name}
                      </span>
                      {isSelected && (
                        <Check
                          aria-hidden="true"
                          className="shrink-0 text-primary"
                          size={14}
                        />
                      )}
                    </div>
                  );
                }}
              </List>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursePicker;
