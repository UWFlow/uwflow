/**
 * PostHog analytics — the single entry point the rest of the app uses.
 *
 *   import { initAnalytics } from 'lib/analytics';
 *   initAnalytics();  // once, near the app root
 *
 * PostHog captures pageviews/pageleaves and sessions automatically, and handles
 * batching, delivery on tab-hide/unload, and Do-Not-Track. On top of that we
 * emit a small number of product events via `capture()` (e.g. account_created,
 * review_posted) and tie them to a user with `identify()` after auth.
 *
 * Configuration (build-time, inlined by CRA's DefinePlugin):
 *   REACT_APP_POSTHOG_KEY  — public PostHog project API key (safe in client JS).
 *                            When unset, analytics is a no-op (local dev).
 *   REACT_APP_POSTHOG_HOST — ingestion host (defaults to US cloud).
 */

import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

let enabled = false;

/**
 * Initialize PostHog once, near the app root. No-ops when no project key is
 * configured (e.g. local dev) so the app behaves identically with or without
 * it. Safe to call repeatedly.
 */
export const initAnalytics = (): void => {
  if (enabled || !POSTHOG_KEY) {
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // PostHog captures pageviews on History API changes (SPA navigation) and
      // pageleaves itself, so we don't hand-roll route tracking.
      capture_pageview: 'history_change',
      capture_pageleave: true,
      // No DOM autocapture — pageviews/sessions are the only analytics we want.
      autocapture: false,
      // Honour the browser Do-Not-Track signal.
      respect_dnt: true,
    });
    enabled = true;
  } catch {
    // Analytics must never break the app.
  }
};

// Run analytics work "on the side": defer to a macrotask so the current
// user-facing flow (toast, navigation, re-render) commits first and analytics
// never blocks it. PostHog's own send is already async/batched; this just
// guarantees even the synchronous enqueue happens after the UI has settled.
const onSide = (fn: () => void): void => {
  setTimeout(() => {
    try {
      fn();
    } catch {
      // Analytics must never break the app.
    }
  }, 0);
};

/**
 * Emit a custom product event. No-ops when analytics is disabled, never throws,
 * and fires on the side (deferred) so call sites don't block or have to guard.
 */
export const capture = (
  event: string,
  properties?: Record<string, unknown>,
): void => {
  if (!enabled) {
    return;
  }
  onSide(() => posthog.capture(event, properties));
};

/**
 * Tie subsequent events to a logged-in user. Call after login/signup so events
 * (and the session that led to them) attach to the user's PostHog person.
 * Fires on the side, preserving call order (identify before any later capture).
 */
export const identify = (userId: string | number): void => {
  if (!enabled || userId === null || userId === undefined) {
    return;
  }
  onSide(() => posthog.identify(String(userId)));
};
