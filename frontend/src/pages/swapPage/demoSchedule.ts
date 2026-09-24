import { UserScheduleFragment } from 'generated/graphql';

import { getCurrentTermCode } from 'utils/Misc';

// Sample schedule rendered behind the logged-out lock overlay so the page
// doesn't look empty. Tagged with the current term_id so it always lands in
// the current term tab, and given negative ids so it can never collide with
// real sections.
const today = new Date().toISOString().slice(0, 10);
const currentTermId = getCurrentTermCode();

const hour = (h: number, m = 0) => h * 3600 + m * 60;

const demoSection = (
  id: number,
  code: string,
  name: string,
  sectionName: string,
  location: string,
  days: string[],
  startSeconds: number,
  endSeconds: number,
) => ({
  section: {
    id,
    class_number: 10000 + Math.abs(id),
    term_id: currentTermId,
    exams: [],
    meetings: [
      {
        days,
        end_date: today,
        end_seconds: endSeconds,
        is_cancelled: false,
        location,
        prof: null,
        section_id: id,
        start_date: today,
        start_seconds: startSeconds,
      },
    ],
    section_name: sectionName,
    course: { id, name, code },
  },
});

const DEMO_SCHEDULE = [
  demoSection(
    -1,
    'cs246',
    'Object-Oriented Software Development',
    'LEC 001',
    'DC 1350',
    ['T', 'Th'],
    hour(10),
    hour(11, 20),
  ),
  demoSection(
    -2,
    'cs246',
    'Object-Oriented Software Development',
    'TUT 101',
    'MC 4060',
    ['W'],
    hour(9, 30),
    hour(10, 20),
  ),
  demoSection(
    -3,
    'cs246',
    'Object-Oriented Software Development',
    'TST 201',
    'TBA',
    ['Th'],
    hour(16, 30),
    hour(18, 20),
  ),
  demoSection(
    -4,
    'cs341',
    'Algorithms',
    'LEC 001',
    'MC 2038',
    ['T', 'Th'],
    hour(11, 30),
    hour(12, 50),
  ),
  demoSection(
    -5,
    'cs341',
    'Algorithms',
    'TUT 101',
    'MC 2034',
    ['F'],
    hour(13, 30),
    hour(14, 20),
  ),
  demoSection(
    -6,
    'cs341',
    'Algorithms',
    'TST 201',
    'TBA',
    ['M'],
    hour(16, 30),
    hour(18, 20),
  ),
  demoSection(
    -7,
    'cs350',
    'Operating Systems',
    'LEC 001',
    'DC 1350',
    ['T', 'Th'],
    hour(14, 30),
    hour(15, 50),
  ),
  demoSection(
    -8,
    'cs350',
    'Operating Systems',
    'TST 101',
    'TBA',
    ['M'],
    hour(18, 30),
    hour(20, 20),
  ),
  demoSection(
    -9,
    'stat230',
    'Probability',
    'LEC 001',
    'MC 4021',
    ['M', 'W', 'F'],
    hour(11, 30),
    hour(12, 20),
  ),
  demoSection(
    -10,
    'stat230',
    'Probability',
    'TUT 101',
    'MC 4060',
    ['F'],
    hour(12, 30),
    hour(13, 20),
  ),
  demoSection(
    -11,
    'stat230',
    'Probability',
    'TST 201',
    'TBA',
    ['T'],
    hour(16, 30),
    hour(18, 20),
  ),
  demoSection(
    -12,
    'co351',
    'Network Flow Theory',
    'LEC 001',
    'MC 2035',
    ['T', 'Th'],
    hour(14, 30),
    hour(15, 50),
  ),
] as unknown as UserScheduleFragment['schedule'];

export default DEMO_SCHEDULE;
