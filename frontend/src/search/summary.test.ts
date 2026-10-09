import {
  isSummaryQuery,
  parseServerSentEvents,
  splitByCourseCodes,
} from './summary';

describe('parseServerSentEvents', () => {
  it('keeps an incomplete trailing event for the next chunk', () => {
    const first = parseServerSentEvents(
      'event: courses\ndata: []\n\nevent: delta\ndata: "Hel',
    );
    expect(first.events).toEqual([{ event: 'courses', data: '[]' }]);

    const second = parseServerSentEvents(`${first.rest}lo"\n\n`);
    expect(second.events).toEqual([{ event: 'delta', data: '"Hello"' }]);
    expect(second.rest).toBe('');
  });
});

describe('isSummaryQuery', () => {
  it.each([
    ['easy cs courses', true],
    ['what should I take for fun?', true],
    ['bird courses', true],
    ['easy electives', true],
    ['cs 135', false],
    ['MATH135', false],
    ['David Jao', false],
    ['machine learning', false],
    ['calc', false],
  ])('%s -> %s', (query, expected) => {
    expect(isSummaryQuery(query)).toBe(expected);
  });
});

describe('splitByCourseCodes', () => {
  it('marks known codes, preferring the longest match', () => {
    expect(
      splitByCourseCodes('Take CS 136L, then CS 136 or CS 999.', [
        'CS 136',
        'CS 136L',
      ]),
    ).toEqual([
      { text: 'Take ' },
      { text: 'CS 136L', code: 'CS 136L' },
      { text: ', then ' },
      { text: 'CS 136', code: 'CS 136' },
      { text: ' or CS 999.' },
    ]);
  });

  it('does not match a code inside a longer one', () => {
    expect(splitByCourseCodes('CS 1350 is not CS 135', ['CS 135'])).toEqual([
      { text: 'CS 1350 is not ' },
      { text: 'CS 135', code: 'CS 135' },
    ]);
  });
});
