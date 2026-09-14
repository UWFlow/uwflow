import { cache } from '../apollo';

/**
 * Exercises the real `InMemoryCache` `typePolicies` from `apollo.js` (rather
 * than a standalone helper) so the test breaks if the production normalization
 * config drifts. `cache.identify` returns the same string Apollo uses as the
 * store key for a given object.
 */
describe('Apollo InMemoryCache normalization (typePolicies keyFields)', () => {
  it('keys course_search_index by course_id', () => {
    expect(
      cache.identify({ __typename: 'course_search_index', course_id: 42 }),
    ).toBe('course_search_index:{"course_id":42}');
  });

  it('keys prof_search_index by prof_id', () => {
    expect(
      cache.identify({ __typename: 'prof_search_index', prof_id: 7 }),
    ).toBe('prof_search_index:{"prof_id":7}');
  });

  it('keys queue_section_subscribed by section_id + user_id', () => {
    expect(
      cache.identify({
        __typename: 'queue_section_subscribed',
        section_id: 100,
        user_id: 5,
      }),
    ).toBe('queue_section_subscribed:{"section_id":100,"user_id":5}');
  });

  it('keys user_shortlist by course_id + user_id', () => {
    expect(
      cache.identify({
        __typename: 'user_shortlist',
        course_id: 11,
        user_id: 5,
      }),
    ).toBe('user_shortlist:{"course_id":11,"user_id":5}');
  });

  it('keys user_course_taken by term_id + course_id', () => {
    expect(
      cache.identify({
        __typename: 'user_course_taken',
        term_id: 1205,
        course_id: 11,
      }),
    ).toBe('user_course_taken:{"term_id":1205,"course_id":11}');
  });

  it('keys user_schedule by user_id + nested section.id', () => {
    expect(
      cache.identify({
        __typename: 'user_schedule',
        user_id: 5,
        section: { id: 99 },
      }),
    ).toBe('user_schedule:{"user_id":5,"section":{"id":99}}');
  });

  it('keys user_schedule_swap by user_id + source_section_id', () => {
    expect(
      cache.identify({
        __typename: 'user_schedule_swap',
        user_id: 5,
        source_section_id: 99,
      }),
    ).toBe('user_schedule_swap:{"user_id":5,"source_section_id":99}');
  });

  it('falls back to the default id heuristic for ordinary typenames', () => {
    expect(cache.identify({ __typename: 'course', id: 123 })).toBe(
      'course:123',
    );
  });
});
