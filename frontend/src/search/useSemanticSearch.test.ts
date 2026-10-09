import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { SemanticSearchCourse } from 'types/Api';

import useSemanticSearch from './useSemanticSearch';

const mockMakeGETRequest = jest.fn();

jest.mock('utils/Api', () => ({
  makeGETRequest: (...args: unknown[]) => mockMakeGETRequest(...args),
}));

const renderHook = (initialQuery: string) => {
  const result: { current: SemanticSearchCourse[] } = { current: [] };
  let query = initialQuery;

  const Test = () => {
    result.current = useSemanticSearch(query);
    return null;
  };

  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root;

  act(() => {
    root = createRoot(container);
    root.render(React.createElement(Test));
  });

  return {
    result,
    rerender: (nextQuery: string) => {
      query = nextQuery;
      act(() => {
        root.render(React.createElement(Test));
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const flushDebounce = async () => {
  await act(async () => {
    jest.runAllTimers();
  });
};

describe('useSemanticSearch', () => {
  beforeAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockMakeGETRequest.mockReset();
    mockMakeGETRequest.mockResolvedValue([
      { courses: [{ id: 1, code: 'cs135', name: 'Functional', score: 0.5 }] },
      200,
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces the request and formats course codes', async () => {
    const { result, rerender, unmount } = renderHook('lear');
    rerender('learn functional programming');
    await flushDebounce();

    expect(mockMakeGETRequest).toHaveBeenCalledTimes(1);
    expect(mockMakeGETRequest.mock.calls[0][0]).toContain(
      '/search/semantic?q=learn%20functional%20programming',
    );
    expect(result.current).toEqual([
      { id: 1, code: 'CS 135', name: 'Functional', score: 0.5 },
    ]);
    unmount();
  });

  it('skips short queries', async () => {
    const { result, unmount } = renderHook('cs');
    await flushDebounce();

    expect(mockMakeGETRequest).not.toHaveBeenCalled();
    expect(result.current).toEqual([]);
    unmount();
  });

  it('hides results that belong to an earlier query', async () => {
    const { result, rerender, unmount } = renderHook('machine learning');
    await flushDebounce();
    expect(result.current).toHaveLength(1);

    rerender('machine learning courses');
    expect(result.current).toEqual([]);
    unmount();
  });

  it('returns no results when the request fails', async () => {
    mockMakeGETRequest.mockRejectedValue(new Error('offline'));
    const { result, unmount } = renderHook('machine learning');
    await flushDebounce();

    expect(result.current).toEqual([]);
    unmount();
  });
});
