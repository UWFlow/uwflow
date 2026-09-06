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
