import { ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge only knows Tailwind's stock scales, so it can't tell that
// `px-md` and `px-3.5` conflict — it would keep both and let source order
// decide. Teach it the named scales from tailwind.config.js so a call-site
// class always overrides the one baked into a shared component.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['page', 'xs', 'sm', 'md', 'lg', 'xl'],
      borderRadius: ['card'],
    },
  },
});

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * Used by shadcn/ui components and any Tailwind-styled component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
