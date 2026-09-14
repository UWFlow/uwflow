import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import {
  Column,
  PluginHook,
  Row,
  TableInstance,
  TableOptions,
  TableState,
  useSortBy,
  useTable,
} from 'react-table';
import { throttle } from 'lodash';

import { TableSortBy } from 'types/Common';

import {
  HeaderCell,
  HeaderRow,
  HeaderText,
  LoadingRow,
  NoResultsRow,
  SortArrow,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableWrapper,
} from './styles/Table';
import LoadingSpinner from './LoadingSpinner';

// Override type definition due to bug with the manualSortBy table option
type UseTableOverride = {
  (
    options: TableOptions<object> & { manualSortBy: boolean },
    ...plugins: PluginHook<object>[]
  ): TableInstance<object>;
};

// Override type definition due to missing fields
export type ColumnOverride = {
  align?: 'left' | 'right';
  style?: object;
} & Column;

export type TableStateOverride = TableState & {
  sortBy?: TableSortBy[];
};

type TableProps = {
  cellPadding: string;
  columns: Column[];
  data: object[];
  sortable?: boolean;
  manualSortBy?: boolean;
  setTableState?: (state: TableState) => void;
  loading?: boolean;
  doneFetching?: boolean;
  fetchMore?: () => Promise<void> | void;
  initialState?: TableStateOverride;
  fetchOffset?: number;
  showNoResults?: boolean;
  getRowProps?: (row: Row) => { [key: string]: any };
};

const Table = ({
  cellPadding,
  columns,
  data,
  sortable = false,
  manualSortBy = false,
  setTableState = () => {},
  loading = false,
  doneFetching = false,
  fetchMore,
  initialState = {},
  fetchOffset = 400,
  showNoResults = false,
  getRowProps,
}: TableProps) => {
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldFetchMore || !fetchMore || loading || doneFetching) {
      return;
    }

    if (shouldFetchMore) {
      const fetchMorePromise = fetchMore();

      if (!fetchMorePromise) {
        setShouldFetchMore(false);
      } else {
        fetchMorePromise.then(() => {
          setShouldFetchMore(false);
        });
      }
    }
    // eslint-disable-next-line
  }, [shouldFetchMore]);

  const setFetchMore = () => {
    if (loading || shouldFetchMore || !fetchMore) {
      return;
    }

    if (!bottomRef || !bottomRef.current) {
      return;
    }

    const { top } = bottomRef.current.getBoundingClientRect();
    const inView =
      top + fetchOffset >= 0 && top - fetchOffset <= window.innerHeight;
    setShouldFetchMore(inView);
  };

  const throttledSetFetchMore = throttle(setFetchMore, 100);

  useEffect(() => {
    window.document.addEventListener('scroll', () => throttledSetFetchMore());
    return window.document.removeEventListener('scroll', () =>
      throttledSetFetchMore(),
    );
    // eslint-disable-next-line
  }, [loading]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: tableState,
  } = (useTable as UseTableOverride)(
    {
      columns,
      data,
      initialState,
      manualSortBy,
    },
    useSortBy,
  );

  useEffect(() => {
    setTableState(tableState);
    // eslint-disable-next-line
  }, [tableState]);

  const renderRows = () =>
    rows.map((row, index: number) => {
      const additionalRowProps = getRowProps ? getRowProps(row) : {};
      return (
        prepareRow(row),
        (
          <TableRow
            {...{ ...row.getRowProps(), ...additionalRowProps }}
            odd={index % 2 === 1}
          >
            {row.cells.map((cell: any, idx: number) => (
              <TableCell
                {...cell.getCellProps()}
                padding={cellPadding}
                align={cell.column.align}
                style={cell.column.style}
                maxWidth={cell.column.maxWidth}
                key={idx}
              >
                {cell.render('Cell')}
              </TableCell>
            ))}
          </TableRow>
        )
      );
    });

  const isLoading =
    (loading || shouldFetchMore) && !doneFetching && fetchMore !== undefined;

  return (
    <TableWrapper {...getTableProps()}>
      <TableHeader>
        {headerGroups.map((headerGroup, groupIdx: number) => (
          <HeaderRow {...headerGroup.getHeaderGroupProps()} key={groupIdx}>
            {headerGroup.headers.map((column: any, idx: number) => (
              <HeaderCell
                align={column.align}
                minWidth={column.minWidth}
                maxWidth={column.maxWidth}
                {...column.getHeaderProps()}
                key={idx}
              >
                <HeaderText
                  sortable={sortable}
                  {...column.getHeaderProps(
                    sortable && column.getSortByToggleProps(),
                  )}
                >
                  {column.render('Header')}
                </HeaderText>
                {column.isSorted && (
                  <SortArrow
                    {...column.getHeaderProps(
                      sortable && column.getSortByToggleProps(),
                    )}
                    key="arrow"
                  >
                    {column.isSortedDesc ? (
                      <ChevronUp size={14} strokeWidth={4} />
                    ) : (
                      <ChevronDown size={14} strokeWidth={4} />
                    )}
                  </SortArrow>
                )}
              </HeaderCell>
            ))}
          </HeaderRow>
        ))}
      </TableHeader>
      <TableBody {...getTableBodyProps()}>{renderRows()}</TableBody>
      {isLoading && (
        <LoadingRow>
          <LoadingSpinner />
        </LoadingRow>
      )}
      {!isLoading && showNoResults && rows.length === 0 && (
        <NoResultsRow>No results found</NoResultsRow>
      )}
      <div ref={bottomRef} />
    </TableWrapper>
  );
};

export default Table;
