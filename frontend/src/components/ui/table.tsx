import React from 'react';

import { cn } from 'lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-b-card bg-white shadow-box">
    <table
      ref={ref}
      className={cn(
        'w-full border-collapse text-left font-inter text-sm text-dark2',
        className,
      )}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-white text-dark1', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-light1 font-semibold text-dark1', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    sideBar?: 'dark' | 'medium' | 'light' | 'course' | 'professor' | 'status';
  }
>(({ className, children, sideBar, ...props }, ref) => {
  const sideBarClasses = {
    dark: 'border-l-dark2',
    medium: 'border-l-dark3',
    light: 'border-l-light4',
    course: 'border-l-courses',
    professor: 'border-l-professors',
    status: 'border-l-red',
  } as const;
  return (
    <tr
      ref={ref}
      className={cn(
        'border-0 border-b border-solid border-light3 bg-white even:bg-[#fafbfc] last:border-b-0',
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) =>
        index === 0 &&
        sideBar &&
        React.isValidElement<{ className?: string }>(child)
          ? React.cloneElement(child, {
              className: cn(
                'border-0 border-l-8 border-solid',
                sideBarClasses[sideBar],
                child.props.className,
              ),
            })
          : child,
      )}
    </tr>
  );
});
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, scope = 'col', ...props }, ref) => (
  <th
    ref={ref}
    scope={scope}
    className={cn(
      'h-12 px-sm py-md font-semibold first:pl-md first:pr-md last:pl-0 last:pr-md',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('h-12 px-sm py-md first:pl-md last:pr-md', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('p-sm text-sm text-dark3', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
