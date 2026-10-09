import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TextDecoder, TextEncoder } from 'util';

import useSearchSummary, { SearchSummary } from './useSearchSummary';

const renderHook = (initialQuery: string) => {
  const result: { current: SearchSummary | null } = { current: null };
  let query = initialQuery;

  const Test = () => {
    result.current = useSearchSummary(query);
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
    result: result as { current: SearchSummary },
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

/*
 * A fetch response whose body yields the given chunks one read at a time.
 * Reads after the last chunk wait on `release`, so tests can observe the
 * mid-stream state.
 */
const streamResponse = (chunks: string[], hold = false) => {
  const encoder = new TextEncoder();
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let i = 0;
  const reader = {
    read: async () => {
      if (i < chunks.length) {
        i += 1;
        return { done: false, value: encoder.encode(chunks[i - 1]) };
      }
      if (hold) {
        await held;
      }
      return { done: true, value: undefined };
    },
  };
  return {
    response: { ok: true, status: 200, body: { getReader: () => reader } },
    release,
  };
};

const flush = async () => {
  await act(async () => {
    jest.runAllTimers();
  });
  // Let the stream's chained reads settle.
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await Promise.resolve();
    });
  }
};

describe('useSearchSummary', () => {
  const mockFetch = jest.fn();

  beforeAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    (globalThis as any).TextDecoder = TextDecoder;
    (globalThis as any).fetch = mockFetch;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('streams text across chunk boundaries', async () => {
    const { response, release } = streamResponse(
      [
        'event: courses\ndata: [{"code":"CS 116","name":"Intro"}]\n\nevent: delta\nda',
        'ta: "Try "\n\nevent: delta\ndata: "CS 116."\n\n',
      ],
      true,
    );
    mockFetch.mockResolvedValue(response);

    const { result, unmount } = renderHook('easy cs courses');
    expect(result.current.status).toBe('loading');
    await flush();

    expect(result.current).toEqual({
      status: 'streaming',
      text: 'Try CS 116.',
      courses: [{ code: 'CS 116', name: 'Intro' }],
    });
    unmount();
    release();
  });

  it('keeps the previous answer while the next one loads', async () => {
    mockFetch.mockResolvedValueOnce(
      streamResponse([
        'event: courses\ndata: []\n\nevent: delta\ndata: "Old"\n\nevent: done\ndata: null\n\n',
      ]).response,
    );
    const { result, rerender, unmount } = renderHook('easy cs courses');
    await flush();
    expect(result.current.status).toBe('done');

    rerender('easy cs courses online');
    expect(result.current).toMatchObject({ status: 'loading', text: 'Old' });
    unmount();
  });

  it('aborts the superseded request', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { rerender, unmount } = renderHook('easy cs courses');
    await flush();
    const { signal } = mockFetch.mock.calls[0][1];

    rerender('easy math courses');
    expect(signal.aborted).toBe(true);
    unmount();
  });

  it('hides the card when nothing matched or the request fails', async () => {
    mockFetch.mockResolvedValueOnce(
      streamResponse([
        'event: courses\ndata: []\n\nevent: done\ndata: null\n\n',
      ]).response,
    );
    const { result, rerender, unmount } = renderHook('easy cs courses');
    await flush();
    expect(result.current.status).toBe('idle');

    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    rerender('easy math courses');
    await flush();
    expect(result.current.status).toBe('idle');
    unmount();
  });

  it('skips lookups that autocomplete handles', async () => {
    const { result, unmount } = renderHook('cs 135');
    await flush();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    unmount();
  });
});
