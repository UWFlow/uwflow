// One hue per course, keyed on `colorKey`: the section type is already spelled
// out in each block's label ("LEC 001"), while the course had no visual
// identifier at all. Full class strings so Tailwind's JIT scanner sees them.
// Gold is left out on purpose (it marks the selected block on the swap page),
// and so is grey — a grey block reads as disabled next to the coloured ones.
const COURSE_COLORS = [
  { rail: 'border-primary', fill: 'bg-[#f0f6ff]', ghost: 'bg-[#f0f6ff]/60' },
  { rail: 'border-[#36b37e]', fill: 'bg-[#ebf9f3]', ghost: 'bg-[#ebf9f3]/60' },
  { rail: 'border-[#6554c0]', fill: 'bg-[#f2f0fc]', ghost: 'bg-[#f2f0fc]/60' },
  { rail: 'border-[#ff8b00]', fill: 'bg-[#fff4e6]', ghost: 'bg-[#fff4e6]/60' },
  { rail: 'border-[#2b8fcd]', fill: 'bg-[#f0fdff]', ghost: 'bg-[#f0fdff]/60' },
  { rail: 'border-[#d83ba0]', fill: 'bg-[#fdeff8]', ghost: 'bg-[#fdeff8]/60' },
  { rail: 'border-[#de350b]', fill: 'bg-[#fdefeb]', ghost: 'bg-[#fdefeb]/60' },
];

// Blocks with no course key (rare — every caller passes a course code).
const DEFAULT_COURSE_COLOR = {
  rail: 'border-dark3',
  fill: 'bg-[#eaecef]',
  ghost: 'bg-[#eaecef]/60',
};

export type CourseColor = typeof DEFAULT_COURSE_COLOR;

// Keep cards and calendar blocks on the same alphabetical course palette.
export const getCourseColors = (keys: string[]) =>
  new Map(
    Array.from(new Set(keys))
      .sort()
      .map((key, index) => [key, COURSE_COLORS[index % COURSE_COLORS.length]]),
  );

export { DEFAULT_COURSE_COLOR };
