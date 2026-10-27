export type ServerSentEvent = {
  event: string;
  data: string;
};

/*
 * Splits a server-sent event buffer into complete events. The unterminated
 * tail is returned as `rest` so it can be prefixed to the next chunk.
 */
export const parseServerSentEvents = (
  buffer: string,
): { events: ServerSentEvent[]; rest: string } => {
  const blocks = buffer.split('\n\n');
  const rest = blocks.pop() ?? '';
  const events = blocks.map((block) => {
    let event = 'message';
    const data: string[] = [];
    block.split('\n').forEach((line) => {
      if (line.startsWith('event: ')) {
        event = line.slice('event: '.length);
      } else if (line.startsWith('data: ')) {
        data.push(line.slice('data: '.length));
      }
    });
    return { event, data: data.join('\n') };
  });
  return { events, rest };
};

// Words that signal a question about courses rather than a name lookup.
const INTENT_WORDS = new Set([
  'easy',
  'easiest',
  'hard',
  'hardest',
  'fun',
  'useful',
  'best',
  'interesting',
  'bird',
  'elective',
  'electives',
  'course',
  'courses',
  'class',
  'classes',
  'about',
  'learn',
]);

const COURSE_CODE = /^[a-z]{2,8}\s?\d{1,3}[a-z]{0,2}$/i;

/*
 * Whether a query reads like a natural-language question worth an AI
 * summary. Codes and two-word names (likely professors) are left to
 * autocomplete, which keeps the LLM off the common, cheap lookups.
 */
export const isSummaryQuery = (query: string): boolean => {
  const trimmed = query.trim();
  if (trimmed.length < 6 || COURSE_CODE.test(trimmed)) {
    return false;
  }
  const words = trimmed.toLowerCase().split(/\s+/);
  return (
    words.length >= 3 ||
    trimmed.endsWith('?') ||
    (words.length === 2 && words.some((word) => INTENT_WORDS.has(word)))
  );
};

export type SummaryPart = { text: string; code?: string };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*
 * Splits summary text so each mention of a known course code becomes its own
 * part, letting the card render citations as links.
 */
export const splitByCourseCodes = (
  text: string,
  codes: string[],
): SummaryPart[] => {
  if (codes.length === 0 || text === '') {
    return text === '' ? [] : [{ text }];
  }
  // Longest first so "CS 136L" wins over "CS 136".
  const pattern = new RegExp(
    `\\b(${[...codes]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|')})\\b`,
    'g',
  );
  const known = new Set(codes);
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) =>
      known.has(part) ? { text: part, code: part } : { text: part },
    );
};
