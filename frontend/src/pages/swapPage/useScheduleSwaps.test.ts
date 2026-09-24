import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  GetScheduleSwapsQuery,
  SwapCourseSectionFragment,
} from 'generated/graphql';

import { SCHEDULE_SWAP_ERROR } from 'constants/Messages';

import useScheduleSwaps, { DisplayedTerm } from './useScheduleSwaps';

const mockUseQuery = jest.fn();
const mockUpsertScheduleSwap = jest.fn();
const mockDeleteScheduleSwap = jest.fn();
const mockClearScheduleSwaps = jest.fn();
const mockToast = jest.fn();

jest.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (document: string) => {
    if (document.includes('mutation upsertScheduleSwap')) {
      return [mockUpsertScheduleSwap];
    }
    if (document.includes('mutation deleteScheduleSwap')) {
      return [mockDeleteScheduleSwap];
    }
    if (document.includes('mutation clearScheduleSwaps')) {
      return [mockClearScheduleSwaps];
    }
    throw new Error(`Unexpected mutation: ${document}`);
  },
}));

jest.mock('react-toastify', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

const CURRENT_TERM = 1265;
const NEXT_TERM = 1269;

type HookArgs = {
  userId: number | null;
  demoMode: boolean;
  currentTermCode: number;
  nextTermCode: number;
};

type HookResult = ReturnType<typeof useScheduleSwaps>;

/** Only identity is read from a newly selected replacement. */
const fakeSection = (id: number): SwapCourseSectionFragment =>
  ({ id } as SwapCourseSectionFragment);

const savedSwap = (
  userId: number,
  sourceSectionId: number,
  replacementSection: SwapCourseSectionFragment,
  sourceTermId = CURRENT_TERM,
): GetScheduleSwapsQuery['user_schedule_swap'][number] => ({
  user_id: userId,
  source_section_id: sourceSectionId,
  replacement_section_id: replacementSection.id,
  source_schedule: {
    user_id: userId,
    section: { id: sourceSectionId, term_id: sourceTermId },
  },
  replacement_section: replacementSection,
});

const defaultArgs = (userId: number | null = 42): HookArgs => ({
  userId,
  demoMode: false,
  currentTermCode: CURRENT_TERM,
  nextTermCode: NEXT_TERM,
});

const renderHook = (initialArgs: HookArgs) => {
  const result: { current: HookResult | null } = { current: null };
  let args = initialArgs;

  const Test = () => {
    result.current = useScheduleSwaps(args);
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
    result: result as { current: HookResult },
    rerender: (nextArgs: HookArgs) => {
      args = nextArgs;
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

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useScheduleSwaps', () => {
  const userId = 42;

  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue({
      data: { user_schedule_swap: [] },
      loading: false,
      error: undefined,
    });
    mockUpsertScheduleSwap.mockReset();
    mockUpsertScheduleSwap.mockResolvedValue({});
    mockDeleteScheduleSwap.mockReset();
    mockDeleteScheduleSwap.mockResolvedValue({});
    mockClearScheduleSwaps.mockReset();
    mockClearScheduleSwaps.mockResolvedValue({});
    mockToast.mockReset();

    // React 18 act() only flushes effects when this flag is set.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it('restores backend swaps under the actual term of each source section', () => {
    const currentReplacement = fakeSection(2001);
    const nextReplacement = fakeSection(2002);
    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [
          savedSwap(userId, 1001, currentReplacement),
          savedSwap(userId, 1002, nextReplacement, NEXT_TERM),
        ],
      },
      loading: false,
      error: undefined,
    });

    const { result, unmount } = renderHook(defaultArgs());

    expect(result.current.plannedSwapsByTerm).toEqual({
      [DisplayedTerm.Current]: [
        {
          sourceSectionId: 1001,
          replacementSectionId: 2001,
          replacementSection: currentReplacement,
        },
      ],
      [DisplayedTerm.Next]: [
        {
          sourceSectionId: 1002,
          replacementSectionId: 2002,
          replacementSection: nextReplacement,
        },
      ],
    });
    unmount();
  });

  it('ignores saved rows whose source is not in a displayed schedule term', () => {
    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [savedSwap(userId, 9999, fakeSection(2001), 1261)],
      },
      loading: false,
      error: undefined,
    });

    const { result, unmount } = renderHook(defaultArgs());

    expect(result.current.plannedSwapsByTerm).toEqual({});
    unmount();
  });

  it('optimistically plans a swap and upserts its ID pair', async () => {
    const replacement = fakeSection(2001);
    const { result, unmount } = renderHook(defaultArgs());

    act(() => {
      result.current.planSwap(DisplayedTerm.Current, 1001, replacement);
    });

    expect(result.current.plannedSwapsByTerm).toEqual({
      [DisplayedTerm.Current]: [
        {
          sourceSectionId: 1001,
          replacementSectionId: 2001,
          replacementSection: replacement,
        },
      ],
    });
    await flushPromises();
    expect(mockUpsertScheduleSwap).toHaveBeenCalledWith({
      variables: {
        userId,
        sourceSectionId: 1001,
        replacementSectionId: 2001,
      },
    });
    unmount();
  });

  it('preserves a choice made before the backend restore finishes', async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const hook = renderHook(defaultArgs());
    const localReplacement = fakeSection(2001);

    act(() => {
      hook.result.current.planSwap(
        DisplayedTerm.Current,
        1001,
        localReplacement,
      );
    });

    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [savedSwap(userId, 1001, fakeSection(3001))],
      },
      loading: false,
      error: undefined,
    });
    hook.rerender(defaultArgs());

    expect(hook.result.current.plannedSwapsByTerm).toEqual({
      [DisplayedTerm.Current]: [
        {
          sourceSectionId: 1001,
          replacementSectionId: 2001,
          replacementSection: localReplacement,
        },
      ],
    });
    await flushPromises();
    hook.unmount();
  });

  it('does not overwrite local state after the initial backend restore', () => {
    const originalReplacement = fakeSection(2001);
    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [savedSwap(userId, 1001, originalReplacement)],
      },
      loading: false,
      error: undefined,
    });
    const hook = renderHook(defaultArgs());
    const localReplacement = fakeSection(2002);

    act(() => {
      hook.result.current.planSwap(
        DisplayedTerm.Current,
        1001,
        localReplacement,
      );
    });

    // A cache write or incidental refetch must not rewind a newer local choice.
    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [
          {
            ...savedSwap(userId, 1001, originalReplacement),
            replacement_section_id: localReplacement.id,
          },
        ],
      },
      loading: false,
      error: undefined,
    });
    hook.rerender(defaultArgs());

    expect(hook.result.current.plannedSwapsByTerm).toEqual({
      [DisplayedTerm.Current]: [
        {
          sourceSectionId: 1001,
          replacementSectionId: 2002,
          replacementSection: localReplacement,
        },
      ],
    });
    hook.unmount();
  });

  it('does not resurrect backend rows when reset wins a restore race', async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const hook = renderHook(defaultArgs());

    act(() => hook.result.current.clearSwaps());

    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [savedSwap(userId, 1001, fakeSection(3001))],
      },
      loading: false,
      error: undefined,
    });
    hook.rerender(defaultArgs());

    expect(hook.result.current.plannedSwapsByTerm).toEqual({});
    await flushPromises();
    expect(mockClearScheduleSwaps).toHaveBeenCalledWith({
      variables: { userId },
    });
    hook.unmount();
  });

  it('serializes rapid writes so their backend order matches the choices', async () => {
    let resolveFirst: (() => void) | undefined;
    mockUpsertScheduleSwap
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({});
    const { result, unmount } = renderHook(defaultArgs());

    act(() => {
      result.current.planSwap(DisplayedTerm.Current, 1001, fakeSection(2001));
      result.current.planSwap(DisplayedTerm.Current, 1001, fakeSection(2002));
    });
    await flushPromises();

    expect(mockUpsertScheduleSwap).toHaveBeenCalledTimes(1);
    resolveFirst?.();
    await flushPromises();
    expect(mockUpsertScheduleSwap).toHaveBeenCalledTimes(2);
    expect(mockUpsertScheduleSwap.mock.calls[1][0]).toEqual({
      variables: {
        userId,
        sourceSectionId: 1001,
        replacementSectionId: 2002,
      },
    });
    unmount();
  });

  it('reports a failed write and continues the mutation queue', async () => {
    mockUpsertScheduleSwap
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({});
    const { result, unmount } = renderHook(defaultArgs());

    act(() => {
      result.current.planSwap(DisplayedTerm.Current, 1001, fakeSection(2001));
      result.current.planSwap(DisplayedTerm.Current, 1001, fakeSection(2002));
    });
    await flushPromises();
    await flushPromises();

    expect(mockToast).toHaveBeenCalledWith(SCHEDULE_SWAP_ERROR);
    expect(mockUpsertScheduleSwap).toHaveBeenCalledTimes(2);
    expect(mockUpsertScheduleSwap.mock.calls[1][0]).toEqual({
      variables: {
        userId,
        sourceSectionId: 1001,
        replacementSectionId: 2002,
      },
    });
    unmount();
  });

  it('reverting to the enrolled section deletes the persisted swap', async () => {
    const replacement = fakeSection(2001);
    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [savedSwap(userId, 1001, replacement)],
      },
      loading: false,
      error: undefined,
    });
    const { result, unmount } = renderHook(defaultArgs());

    act(() => {
      result.current.planSwap(DisplayedTerm.Current, 1001, fakeSection(1001));
    });

    expect(result.current.plannedSwapsByTerm).toEqual({});
    await flushPromises();
    expect(mockDeleteScheduleSwap).toHaveBeenCalledWith({
      variables: { userId, sourceSectionId: 1001 },
    });
    unmount();
  });

  it('clears both the local overlay and all persisted swaps', async () => {
    mockUseQuery.mockReturnValue({
      data: {
        user_schedule_swap: [savedSwap(userId, 1001, fakeSection(2001))],
      },
      loading: false,
      error: undefined,
    });
    const { result, unmount } = renderHook(defaultArgs());

    act(() => result.current.clearSwaps());

    expect(result.current.plannedSwapsByTerm).toEqual({});
    await flushPromises();
    expect(mockClearScheduleSwaps).toHaveBeenCalledWith({
      variables: { userId },
    });
    unmount();
  });

  it('keeps demo swaps in memory without writing to the backend', async () => {
    const { result, unmount } = renderHook({
      ...defaultArgs(),
      demoMode: true,
    });

    act(() => {
      result.current.planSwap(DisplayedTerm.Current, 1001, fakeSection(2001));
    });
    await flushPromises();

    expect(mockUseQuery.mock.calls[0][1]).toMatchObject({ skip: true });
    expect(mockUpsertScheduleSwap).not.toHaveBeenCalled();
    expect(mockDeleteScheduleSwap).not.toHaveBeenCalled();
    expect(mockClearScheduleSwaps).not.toHaveBeenCalled();
    unmount();
  });

  it('settles a failed restore and tells the user persistence is unavailable', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('network down'),
    });

    const { result, unmount } = renderHook(defaultArgs());

    expect(result.current.isPlanSettled).toBe(true);
    expect(mockToast).toHaveBeenCalledWith(SCHEDULE_SWAP_ERROR);
    unmount();
  });
});
