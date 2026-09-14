/* Type definitions */
export const BROWSER_WINDOW_RESIZED = 'BROWSER_WINDOW_RESIZED';

export interface BrowserWindowState {
  width: number;
  height: number;
}

interface BrowserWindowResizedAction {
  type: typeof BROWSER_WINDOW_RESIZED;
  payload: BrowserWindowState;
}

export type BrowserWindowAction = BrowserWindowResizedAction;

/* Action definitions */
export function BrowserWindowResized(
  width: number,
  height: number,
): BrowserWindowResizedAction {
  return {
    type: BROWSER_WINDOW_RESIZED,
    payload: {
      width,
      height,
    },
  };
}
