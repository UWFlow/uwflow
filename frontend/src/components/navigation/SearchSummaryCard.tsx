import React from 'react';
import { Zap } from 'react-feather';

import { cn } from 'lib/utils';
import { splitByCourseCodes } from 'search/summary';
import { SearchSummary } from 'search/useSearchSummary';

type SearchSummaryCardProps = {
  summary: SearchSummary;
  onCourseClick: (code: string) => void;
};

const SearchSummaryCard = ({
  summary,
  onCourseClick,
}: SearchSummaryCardProps) => {
  const { status, text, courses } = summary;
  if (status === 'idle' || status === 'error') {
    return null;
  }

  const parts = splitByCourseCodes(
    text,
    courses.map((course) => course.code),
  );

  return (
    <div
      className="animate-in fade-in border-0 border-b border-solid border-light3 bg-light1 px-md py-sm font-inter"
      aria-live="polite"
      aria-busy={status !== 'done'}
    >
      <div className="mb-xs flex items-center gap-xs text-xs font-semibold uppercase text-primary">
        <Zap size={12} />
        AI summary
      </div>
      {text === '' ? (
        <div className="flex flex-col gap-xs py-xs">
          <div className="h-sm w-full animate-pulse rounded-card bg-light3" />
          <div className="h-sm w-2/3 animate-pulse rounded-card bg-light3" />
        </div>
      ) : (
        <p
          className={cn(
            'm-0 text-sm text-dark1 transition-opacity duration-hover ease-hover',
            status === 'loading' && 'opacity-50',
          )}
        >
          {parts.map((part, i) =>
            part.code ? (
              <button
                // Parts are positional; the text never reorders.
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 font-inter text-sm font-semibold text-courses hover:underline"
                onClick={() => onCourseClick(part.code as string)}
              >
                {part.text}
              </button>
            ) : (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={i}>{part.text}</React.Fragment>
            ),
          )}
          {status === 'streaming' && (
            <span className="ml-xs inline-block h-md w-[2px] animate-pulse bg-primary align-text-bottom" />
          )}
        </p>
      )}
    </div>
  );
};

export default SearchSummaryCard;
