# Search

UWFlow performs all autocomplete searches directly in-browser to minimize latency. This is implemented by indexing all available search data in-memory whenever a page is loaded. Whenever a user types into the search bar, we query the in-memory index to retrieve all matching course and professor results, and display the most relevant results with special heuristics for ranking. Implementation for search indexing and querying functionality can be found in `SearchClient.ts`. Details for each step are outlined below:

## 1. Indexing search data

The client side search works by indexing raw course and professor data from the backend into an in-memory search index. We use the `fuzzysort` library to index all courses, professors, and course codes (ECE, CS, PHIL, etc.). For courses, we search over course codes, course names, and associated professors. For professors, we index names and associated course codes. Course codes are indexed by using all unique course codes found in the course data. For all of these entities, we also index the number of ratings, which will be used as a heuristic to rank popular courses/professors higher. For course codes, the number of ratings is the aggregate sum of all course ratings for related courses.

On page load, if the raw search data already exists in local storage, then we load it into the index directly. However, if the existing data is more than 12 hours old or doesn't exist, then we fetch it directly from the backend API from the `/data/search` endpoint. This contains all relevant course and professor information that we use for queries. We store the raw data in local storage as a compressed string using the `LZString` library.

Since the Javascript engine in browsers is single-threaded, we perform the indexing task in a background web worker defined in `search.worker.ts` to avoid blocking rendering. It generally takes ~2s to fully index the data before autocomplete is available for use.

## 2. Making search requests

Because we index the search data in a web worker, all search requests need to be sent as a message to the same worker. The `SearchProvider` class provides the search worker to nested components so that they can call search functions directly. The search worker can be accessed with the `useSearchContext` hook. The `SearchBar` component implements autocomplete functionality using the worker.

## 3. Querying index and ranking results

When the worker makes an autocomplete request, we first process the query by splitting on spaces and transforming any strings that look like course codes into our expected course code format.

Next, we query for:
  1. Courses that match the processed query string on course code, name, or professor names.
  2. Professors that match on professor name or course code.
  3. All matching course codes.

Once we have the raw results for courses, profs, and course codes, we rerank them by weighting on the number of ratings for each entity and return them.

## 4. Semantic results

Fuzzy matching only finds courses whose code, name, or professors share text with the query. To also surface courses that match by meaning (e.g. "learn to build websites"), the search bar shows a "Related courses" section populated by the `/search/semantic` API endpoint. `useSemanticSearch` debounces requests by 300ms, skips queries shorter than 3 characters, and drops responses for outdated queries. The search bar removes courses the fuzzy results already show and displays up to 3 of the rest.

On the backend, the importer embeds each course's code, name, and description with OpenAI `text-embedding-3-small` (512 dimensions) and stores the vectors in the `course_embedding` table. Only new or changed courses are re-embedded. The API keeps all vectors in memory, refreshing them hourly, embeds the query, and ranks courses by cosine similarity. Semantic search requires `OPENAI_API_KEY` in the backend `.env`. Without it, the endpoint returns no results and the importer skips embedding, so the dropdown shows only fuzzy results. Run `make import-embeddings` to backfill embeddings locally.

## 5. AI summaries

For natural-language queries (`isSummaryQuery` in `summary.ts`: three or more words, a question, or two words with an intent word like "easy" or "electives"), the dropdown opens with a short streamed answer that links the courses it cites. Course codes and two-word names go straight to autocomplete without calling the LLM.

`useSearchSummary` shows a skeleton as soon as the query qualifies and requests `/search/summary` 350ms after typing stops. It aborts superseded requests and keeps the previous answer dimmed until the next one starts streaming, so the dropdown doesn't jump. Any failure hides the card.

The API endpoint retrieves 24 courses by meaning and keeps the 10 that are most similar, with a nudge towards courses that have many ratings. It sends their ratings, descriptions, and two most-upvoted reviews to OpenAI `gpt-5.4-mini` with reasoning disabled, and streams the answer back as server-sent events (`courses`, `delta`, `done`, or `error`). It sets `X-Accel-Buffering: no` so Nginx doesn't buffer the stream. Finished summaries are cached for an hour, and at most 8 summaries are generated at once; further requests get 429.
