import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
// eslint-disable-next-line import/no-webpack-loader-syntax
import SearchWorker from 'worker-loader!search/search.worker';

import { LAST_INDEXED_ID, SEARCH_DATA_ID } from 'constants/Search';
import { millisecondsPerDay } from 'utils/Misc';

type SearchContextType = {
  searchWorker: Worker;
};

export const SearchContext = createContext<SearchContextType>({
  searchWorker: new SearchWorker(),
});
export const useSearchContext = () => useContext(SearchContext);

type SearchProviderProps = {
  searchWorker: Worker;
  children: ReactNode;
};

const SearchProvider = ({ searchWorker, children }: SearchProviderProps) => {
  const [shouldReindex, setShouldReindex] = useState(false);

  useEffect(() => {
    // Build indices
    searchWorker.postMessage({
      type: 'build',
      searchData: localStorage.getItem(SEARCH_DATA_ID),
      lastIndexedDate: localStorage.getItem(LAST_INDEXED_ID),
    });

    searchWorker.addEventListener('message', (event) => {
      const { type } = event.data;
      if (type === 'data') {
        const { searchData, lastIndexedDate } = event.data;
        localStorage.setItem(SEARCH_DATA_ID, searchData);
        localStorage.setItem(LAST_INDEXED_ID, lastIndexedDate);

        // Reload if index is more than 12 hours old
        if (
          new Date().getTime() - new Date(lastIndexedDate).getTime() >
          millisecondsPerDay / 2
        ) {
          setShouldReindex(true);
        }
      }
    });
  }, [searchWorker]);

  // reindex data
  useEffect(() => {
    if (!shouldReindex) {
      return;
    }

    localStorage.removeItem(LAST_INDEXED_ID);
    localStorage.removeItem(SEARCH_DATA_ID);
    searchWorker.postMessage({
      type: 'build',
      searchData: null,
      lastIndexedDate: null,
    });
    setShouldReindex(false);
  }, [shouldReindex, searchWorker]);

  return (
    <SearchContext.Consumer>
      {(context) => {
        if (context.searchWorker !== searchWorker) {
          context = { ...context, searchWorker };
        }

        return (
          <SearchContext.Provider value={context}>
            {children}
          </SearchContext.Provider>
        );
      }}
    </SearchContext.Consumer>
  );
};

export default SearchProvider;
