import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@apollo/client';
import {
  ClearScheduleSwapsMutation,
  ClearScheduleSwapsMutationVariables,
  DeleteScheduleSwapMutation,
  DeleteScheduleSwapMutationVariables,
  GetScheduleSwapsQuery,
  GetScheduleSwapsQueryVariables,
  SwapCourseSectionFragment,
  UpsertScheduleSwapMutation,
  UpsertScheduleSwapMutationVariables,
} from 'generated/graphql';

import { SCHEDULE_SWAP_ERROR } from 'constants/Messages';
import {
  CLEAR_SCHEDULE_SWAPS,
  DELETE_SCHEDULE_SWAP,
  UPSERT_SCHEDULE_SWAP,
} from 'graphql/mutations/ScheduleSwap';
import { GET_SCHEDULE_SWAPS } from 'graphql/queries/user/ScheduleSwap';

/** The two term tabs the swap calendar shows. */
export enum DisplayedTerm {
  Current = 'current',
  Next = 'next',
}

/** One planned swap and the current replacement data returned by the backend. */
export type PlannedSwap = {
  sourceSectionId: number;
  replacementSectionId: number;
  replacementSection: SwapCourseSectionFragment;
};

type SwapsByTerm = Partial<Record<DisplayedTerm, PlannedSwap[]>>;
type ScheduleSwapRow = GetScheduleSwapsQuery['user_schedule_swap'][number];

type PendingSwapChange = {
  term: DisplayedTerm;
  replacementSection: SwapCourseSectionFragment | null;
};

const displayedTerms = Object.values(DisplayedTerm);

/**
 * Replaces one source section in the in-memory overlay. A null replacement
 * means the user reverted that source to the enrolled section.
 */
const withSwapChange = (
  swapsByTerm: SwapsByTerm,
  term: DisplayedTerm,
  sourceSectionId: number,
  replacementSection: SwapCourseSectionFragment | null,
): SwapsByTerm => {
  const next: SwapsByTerm = {};

  for (const displayedTerm of displayedTerms) {
    const remaining = (swapsByTerm[displayedTerm] ?? []).filter(
      (swap) => swap.sourceSectionId !== sourceSectionId,
    );
    if (remaining.length > 0) next[displayedTerm] = remaining;
  }

  if (replacementSection !== null) {
    next[term] = [
      ...(next[term] ?? []),
      {
        sourceSectionId,
        replacementSectionId: replacementSection.id,
        replacementSection,
      },
    ];
  }

  return next;
};

/** Group persisted rows by the actual term of their enrolled source section. */
const groupScheduleSwaps = (
  rows: ScheduleSwapRow[],
  currentTermCode: number,
  nextTermCode: number,
): SwapsByTerm => {
  const grouped: SwapsByTerm = {};

  for (const row of rows) {
    const sourceTerm = row.source_schedule.section.term_id;
    const term =
      sourceTerm === currentTermCode
        ? DisplayedTerm.Current
        : sourceTerm === nextTermCode
        ? DisplayedTerm.Next
        : null;
    if (term === null) continue;

    const plannedSwap: PlannedSwap = {
      sourceSectionId: row.source_section_id,
      replacementSectionId: row.replacement_section_id,
      replacementSection: row.replacement_section,
    };
    grouped[term] = [...(grouped[term] ?? []), plannedSwap];
  }

  return grouped;
};

type UseScheduleSwapsArgs = {
  userId: number | null;
  demoMode: boolean;
  currentTermCode: number;
  nextTermCode: number;
};

/**
 * Owns the swap overlay while persisting each source/replacement pair in the
 * backend. The imported schedule remains untouched; saved swaps are restored
 * with fresh section data whenever the page is opened.
 */
const useScheduleSwaps = ({
  userId,
  demoMode,
  currentTermCode,
  nextTermCode,
}: UseScheduleSwapsArgs) => {
  const persistenceEnabled = !demoMode && userId !== null;
  const [swapsByTerm, setSwapsByTerm] = useState<SwapsByTerm>({});
  const restoredRef = useRef(false);
  const changesBeforeRestoreRef = useRef<Map<number, PendingSwapChange>>(
    new Map(),
  );
  const clearedBeforeRestoreRef = useRef(false);
  // Hasura mutations are serialized so rapid choices for the same source
  // cannot arrive out of order and leave an older replacement in the backend.
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());

  const { data, loading, error } = useQuery<
    GetScheduleSwapsQuery,
    GetScheduleSwapsQueryVariables
  >(GET_SCHEDULE_SWAPS, {
    variables: {
      userId: userId ?? 0,
      termIds: [currentTermCode, nextTermCode],
    },
    skip: !persistenceEnabled,
    fetchPolicy: 'network-only',
  });

  const [upsertScheduleSwap] = useMutation<
    UpsertScheduleSwapMutation,
    UpsertScheduleSwapMutationVariables
  >(UPSERT_SCHEDULE_SWAP);
  const [deleteScheduleSwap] = useMutation<
    DeleteScheduleSwapMutation,
    DeleteScheduleSwapMutationVariables
  >(DELETE_SCHEDULE_SWAP);
  const [clearScheduleSwaps] = useMutation<
    ClearScheduleSwapsMutation,
    ClearScheduleSwapsMutationVariables
  >(CLEAR_SCHEDULE_SWAPS);

  const enqueueMutation = (mutation: () => Promise<unknown>) => {
    mutationQueueRef.current = mutationQueueRef.current.then(async () => {
      try {
        await mutation();
      } catch {
        toast(SCHEDULE_SWAP_ERROR);
      }
    });
  };

  // Restore the backend plan once. If the user made a choice before the query
  // returned, replay that choice over the response instead of losing it.
  useEffect(() => {
    if (restoredRef.current) return;
    if (!persistenceEnabled) {
      restoredRef.current = true;
      return;
    }
    if (!data && !error) return;

    let restored = clearedBeforeRestoreRef.current
      ? {}
      : groupScheduleSwaps(
          data?.user_schedule_swap ?? [],
          currentTermCode,
          nextTermCode,
        );
    for (const [sourceSectionId, change] of Array.from(
      changesBeforeRestoreRef.current.entries(),
    )) {
      restored = withSwapChange(
        restored,
        change.term,
        sourceSectionId,
        change.replacementSection,
      );
    }

    setSwapsByTerm(restored);
    changesBeforeRestoreRef.current.clear();
    clearedBeforeRestoreRef.current = false;
    restoredRef.current = true;
  }, [currentTermCode, data, error, nextTermCode, persistenceEnabled]);

  useEffect(() => {
    if (error) toast(SCHEDULE_SWAP_ERROR);
  }, [error]);

  const planSwap = (
    term: DisplayedTerm,
    sourceSectionId: number,
    replacementSection: SwapCourseSectionFragment,
  ) => {
    const isReverting = replacementSection.id === sourceSectionId;
    const nextReplacement = isReverting ? null : replacementSection;

    setSwapsByTerm((prev) =>
      withSwapChange(prev, term, sourceSectionId, nextReplacement),
    );

    if (!restoredRef.current) {
      changesBeforeRestoreRef.current.set(sourceSectionId, {
        term,
        replacementSection: nextReplacement,
      });
    }
    if (!persistenceEnabled || userId === null) return;

    if (isReverting) {
      enqueueMutation(() =>
        deleteScheduleSwap({ variables: { userId, sourceSectionId } }),
      );
      return;
    }

    enqueueMutation(() =>
      upsertScheduleSwap({
        variables: {
          userId,
          sourceSectionId,
          replacementSectionId: replacementSection.id,
        },
      }),
    );
  };

  const clearSwaps = () => {
    setSwapsByTerm({});
    changesBeforeRestoreRef.current.clear();
    if (!restoredRef.current) clearedBeforeRestoreRef.current = true;

    if (!persistenceEnabled || userId === null) return;
    enqueueMutation(() => clearScheduleSwaps({ variables: { userId } }));
  };

  return {
    plannedSwapsByTerm: swapsByTerm,
    planSwap,
    clearSwaps,
    isPlanSettled: !loading || Boolean(error),
  };
};

export default useScheduleSwaps;
