# Analytics

UW Flow sends product analytics to **PostHog Cloud** and nothing else. PostHog
is the single destination: it stores the events and powers dashboards, funnels,
and retention.

Beyond PostHog's automatic pageview/session capture, we emit a small number of
custom product events (see [Custom events](#custom-events)). There is no custom
ingestion endpoint and no second store — everything goes to PostHog.

## Client architecture

Everything lives under [`src/lib/analytics/`](../src/lib/analytics):

| File         | Responsibility                                               |
|--------------|--------------------------------------------------------------|
| `index.ts`   | `initAnalytics()` (init once near the app root), `capture(event, props)` (emit a custom event), `identify(userId)` (tie events to a user). All never throw, no-op when no key is configured, and `capture`/`identify` fire on the side (deferred a macrotask) so they never block UI. |

PostHog itself handles everything we used to hand-roll:

- **Pageviews & sessions** — captured automatically on SPA navigation via
  `capture_pageview: 'history_change'`, plus `$pageleave` on exit. We do **not**
  emit our own `page_view` or `*_view` events.
- **Identity & sessions** — PostHog assigns an anonymous `distinct_id` and tracks
  sessions automatically. After login/signup we call `identify(user_id)` so events
  (and the preceding anonymous session) attach to the user's PostHog person.
- **Delivery** — PostHog batches events and flushes them, including on tab hide /
  unload, so we don't manage a buffer or `sendBeacon`.
- **Do-Not-Track** — `respect_dnt: true` makes PostHog a no-op when the browser
  sends a DNT signal.

`autocapture` is disabled: we don't want raw DOM clicks in the stream, only
PostHog's pageview/session signals.

## Custom events

We deliberately keep custom events few. Today there are two:

### `account_created`

Fired once when a brand-new account is created (`is_new` from the auth
response), from `AuthForm`'s `onAuthSuccess`.

| Property | Type | Notes |
|----------|------|-------|
| `method` | `'email' \| 'google' \| 'facebook'` | Which signup path was used. |

### `review_posted`

Fired when a user posts a review. Two shapes share one event so funnels and
totals stay simple — split on `review_type`.

| Property | Type | Notes |
|----------|------|-------|
| `review_type` | `'full' \| 'like'` | `'full'` = the rich review form; `'like'` = the thumbs up/down toggle. |
| `about_prof` | `boolean` | Whether the review includes a professor. Always `false` for likes. |
| `course_id` / `course_code` | `number` / `string` | The course reviewed. |
| `liked` | `0 \| 1` | Thumbs down / up. |

`review_type: 'full'` adds: `is_update` (editing vs first post), `prof_id`,
`course_useful`, `course_easy`, `prof_clear`, `prof_engaging` (null when no
prof), `has_course_comment`, `has_prof_comment`, `is_anonymous`.

Toggling a like **off** (clearing it) is a removal, not a post, so it emits no
event.

## Usage

```ts
import { initAnalytics, capture, identify } from 'lib/analytics';

initAnalytics(); // once, near the app root (App.tsx)
identify(userId); // after login/signup
capture('review_posted', { review_type: 'like', liked: 1 /* … */ });
```

`initAnalytics()` no-ops until a PostHog key is configured, so local dev without
a key behaves identically to production.

## Environment variables

Set these for the deploy (see [`.env.sample`](../.env.sample)). Both are
build-time `REACT_APP_*` vars inlined by CRA.

| Variable                 | Required | Default                    | Purpose |
|--------------------------|----------|----------------------------|---------|
| `REACT_APP_POSTHOG_KEY`  | No       | _(unset → analytics off)_  | Public PostHog project API key. When unset, analytics is a no-op (expected in local dev). |
| `REACT_APP_POSTHOG_HOST` | No       | `https://us.i.posthog.com` | PostHog ingestion host (use `https://eu.i.posthog.com` for EU). |

The PostHog key is public by design — a key shipped in client JS can't be secret.
</content>
</invoke>
