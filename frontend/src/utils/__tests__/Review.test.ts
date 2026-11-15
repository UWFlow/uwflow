import { getUserVote, sortReviews } from 'utils/Review';

const review = (id: number, upvotes: number, downvotes: number) => ({
  id,
  upvotes,
  downvotes,
  created_at: `2026-01-0${id}T00:00:00Z`,
});

describe('sortReviews', () => {
  it('ranks by upvotes minus downvotes when sorting by helpfulness', () => {
    const sorted = sortReviews(
      [review(1, 5, 4), review(2, 2, 0), review(3, 0, 3)],
      false,
    );

    expect(sorted.map((r) => r.id)).toEqual([2, 1, 3]);
  });

  it('ranks newest first when sorting by time', () => {
    const sorted = sortReviews(
      [review(1, 5, 0), review(2, 0, 5), review(3, 1, 1)],
      true,
    );

    expect(sorted.map((r) => r.id)).toEqual([3, 2, 1]);
  });
});

describe('getUserVote', () => {
  it('reports which vote the user holds', () => {
    expect(getUserVote([{ user_id: 1 }], [])).toBe('up');
    expect(getUserVote([], [{ user_id: 1 }])).toBe('down');
    expect(getUserVote([], [])).toBeNull();
    expect(getUserVote(undefined, undefined)).toBeNull();
  });
});
