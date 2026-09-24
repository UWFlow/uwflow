import React, {
  KeyboardEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Layers, Search, Square, User, Users } from 'react-feather';
import Highlighter from 'react-highlight-words';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import {
  EXPLORE_PAGE_ROUTE,
  getCoursePageRoute,
  getProfPageRoute,
} from 'Routes';
import { useTheme } from 'styled-components';
import useOnClickOutside from 'use-onclickoutside';

import Tooltip from 'components/display/Tooltip';
import Textbox from 'components/input/Textbox';
import KeycodeConstants from 'constants/KeycodeConstants';
import {
  AutocompleteResponse,
  IndexedCourse,
  IndexedProf,
} from 'search/SearchClient';
import { useSearchContext } from 'search/SearchProvider';
import { formatCourseCode } from 'utils/Misc';

import {
  BoldText,
  ColoredResultText,
  Dash,
  EllipsisSpan,
  ExploreSideButton,
  ResultIcon,
  ResultText,
  SearchBarWrapper,
  SearchResult,
  SearchResultsWrapper,
  ShortcutBadge,
  UnderlinedText,
} from './styles/SearchBar';

const isMac = navigator.userAgent.includes('Mac');

type HighlightProps = {
  children: ReactNode;
};

const Highlight = ({ children }: HighlightProps) => (
  <UnderlinedText>{children}</UnderlinedText>
);

const BoldHighlight = ({ children }: HighlightProps) => (
  <BoldText>
    <UnderlinedText>{children}</UnderlinedText>
  </BoldText>
);

type SearchBarProps = {
  isLanding?: boolean;
  maximizeWidth?: boolean;
};

const SearchBar = ({
  isLanding = false,
  maximizeWidth = false,
}: SearchBarProps) => {
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();

  const { q: query } = queryString.parse(location.search);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const selectedResultRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState((query as string) || '');
  const [searchResults, setSearchResults] = useState<AutocompleteResponse>({
    courseResults: [],
    profResults: [],
    courseCodeResults: [],
  });
  const { searchWorker } = useSearchContext();

  // Handle search result data from search worker message
  const performSearch = (event: MessageEvent): void => {
    const { type } = event.data;
    if (type === 'autocomplete') {
      const { results } = event.data;
      setSearchResults(results);
      setSelectedResultIndex(-1);

      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    searchWorker.addEventListener('message', performSearch);
    return () => {
      searchWorker.removeEventListener('message', performSearch);
    };
  }, [searchText, searchWorker]);

  useEffect(() => {
    // Arrow key functionality for search result dropdown
    const handleUserKeyPress = (event: globalThis.KeyboardEvent): void => {
      const { keyCode } = event;
      if (keyCode === KeycodeConstants.ESCAPE) {
        setOpen(false);
      } else if (keyCode === KeycodeConstants.UP) {
        event.preventDefault();
        setSelectedResultIndex(Math.max(-1, selectedResultIndex - 1));
      } else if (keyCode === KeycodeConstants.DOWN) {
        event.preventDefault();
        const length =
          Math.max(searchResults.courseCodeResults.length, 1) +
          searchResults.courseResults.length +
          searchResults.profResults.length;
        setSelectedResultIndex(Math.min(length - 1, selectedResultIndex + 1));
      }
    };
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [selectedResultIndex, searchResults, searchWorker]);

  useEffect(() => {
    const handleCmdK = (event: globalThis.KeyboardEvent) => {
      if (
        (isMac ? event.metaKey : event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleCmdK);
    return () => window.removeEventListener('keydown', handleCmdK);
  }, []);

  useEffect(() => {
    if (selectedResultIndex === -1 && inputRef.current) {
      inputRef.current.focus();
    } else if (selectedResultRef.current) {
      selectedResultRef.current.focus();
    }
  }, [selectedResultIndex, selectedResultRef, inputRef]);

  useEffect(() => {
    if (inputRef.current && (!isLanding || navigator.maxTouchPoints)) {
      setOpen(false);
      inputRef.current.blur();
    }
  }, [isLanding, navigator.maxTouchPoints]);

  useOnClickOutside(searchBarRef, () => setOpen(false));

  const queryExploreCourses = (
    q?: string,
    codeSearch = false,
    profSearch = false,
  ) => {
    if (q === '' || !q) {
      history.push(EXPLORE_PAGE_ROUTE);
      return;
    }

    const codeTerm = codeSearch ? '&c=t' : '';
    const profTerm = profSearch ? '&t=p' : '';
    setOpen(false);
    history.push(
      `${EXPLORE_PAGE_ROUTE}?q=${encodeURIComponent(q)}${codeTerm}${profTerm}`,
    );
  };

  const goToCourse = (code: string) => {
    setOpen(false);
    history.push(getCoursePageRoute(code));
  };

  const goToProf = (code: string) => {
    setOpen(false);
    history.push(getProfPageRoute(code));
  };

  // Route user to explore courses page
  const handleSearch = (
    event: KeyboardEvent<HTMLInputElement>,
    text: string,
  ) => {
    if (event.keyCode === KeycodeConstants.ENTER) {
      queryExploreCourses(text);
    }
  };

  // Make request to search worker for autocomplete results
  const handleKeyStroke = (value: string) => {
    setSearchText(value);
    setOpen(true);
    searchWorker.postMessage({ type: 'autocomplete', query: value });
  };

  const queryTokens = searchText
    .split(' ')
    .map((term) => formatCourseCode(term))
    .join(' ')
    .split(' ');

  const highlightText = (text: string, bold = false) => (
    <Highlighter
      highlightTag={bold ? BoldHighlight : Highlight}
      autoEscape={true}
      searchWords={queryTokens}
      textToHighlight={text}
    />
  );

  const exploreResult = (
    code = '',
    ref: RefObject<HTMLButtonElement> | null = null,
  ) => (
    <SearchResult
      onClick={() => queryExploreCourses(code, code !== '')}
      key={code}
      ref={ref}
      isLanding={isLanding}
    >
      <ResultIcon color={theme.primary} className="primaryicon">
        <Layers />
      </ResultIcon>
      <ResultText>
        <EllipsisSpan>
          <ColoredResultText color={theme.primary}>
            {`Explore all ${code.toUpperCase()} courses and professors`}
          </ColoredResultText>
        </EllipsisSpan>
      </ResultText>
    </SearchResult>
  );

  const courseResult = (
    course: IndexedCourse,
    ref: RefObject<HTMLButtonElement> | null = null,
  ) => (
    <SearchResult
      onClick={() =>
        // convert back to raw code
        goToCourse(course.code.split(' ').join('').toLowerCase())
      }
      key={course.code}
      ref={ref}
      isLanding={isLanding}
    >
      <ResultIcon color={theme.courses}>
        <Square />
      </ResultIcon>
      <ResultText>
        <ColoredResultText color={theme.courses}>
          {highlightText(formatCourseCode(course.code.toUpperCase()))}
        </ColoredResultText>
        <Dash>&mdash;</Dash>
        <EllipsisSpan>{highlightText(course.name, true)}</EllipsisSpan>
      </ResultText>
      <Tooltip content={`Explore professors that teach ${course.code}`}>
        <ExploreSideButton
          color={theme.professors}
          onClick={(e) => {
            e.stopPropagation();
            queryExploreCourses(course.code, false, true);
          }}
        >
          <Users />
        </ExploreSideButton>
      </Tooltip>
    </SearchResult>
  );

  const profResult = (
    prof: IndexedProf,
    ref: RefObject<HTMLButtonElement> | null = null,
  ) => (
    <SearchResult
      onClick={() => goToProf(prof.code)}
      key={prof.code}
      ref={ref}
      isLanding={isLanding}
    >
      <ResultIcon color={theme.professors}>
        <User />
      </ResultIcon>
      <ResultText>
        <ColoredResultText color={theme.professors}>
          {highlightText(prof.name)}
        </ColoredResultText>
        <Dash>&mdash;</Dash>
        <EllipsisSpan>Professor</EllipsisSpan>
      </ResultText>
      <Tooltip content={`Explore courses taught by ${prof.name}`}>
        <ExploreSideButton
          color={theme.courses}
          onClick={(e) => {
            e.stopPropagation();
            queryExploreCourses(prof.name);
          }}
        >
          <Layers />
        </ExploreSideButton>
      </Tooltip>
    </SearchResult>
  );

  const renderSearchResults = () => {
    const courseResults = searchResults.courseResults.map((result, i) => {
      return courseResult(
        result,
        selectedResultIndex === i ? selectedResultRef : null,
      );
    });

    let offset = courseResults.length;
    const profResults = searchResults.profResults
      .filter((prof) => !!prof.code)
      .map((prof, i) => {
        return profResult(
          prof,
          selectedResultIndex === i + offset ? selectedResultRef : null,
        );
      });

    offset += profResults.length;

    const courseCodeResults =
      searchResults.courseCodeResults.length > 0
        ? searchResults.courseCodeResults.map((result, i) =>
            exploreResult(
              result.code,
              selectedResultIndex === i + offset ? selectedResultRef : null,
            ),
          )
        : [
            exploreResult(
              '',
              selectedResultIndex === offset ? selectedResultRef : null,
            ),
          ];

    const allResults = [...courseResults, ...profResults, ...courseCodeResults];

    return (
      <SearchResultsWrapper maximizeWidth={maximizeWidth}>
        {allResults}
      </SearchResultsWrapper>
    );
  };

  const options = isLanding
    ? {
        width: '100%',
        backgroundColor: `${theme.white}`,
        color: theme.primary,
        borderRadius: open ? '4px 4px 0 0' : '4px',
      }
    : { width: '100%', borderRadius: open ? '4px 4px 0 0' : '4px' };

  return (
    <SearchBarWrapper ref={searchBarRef} isLanding={isLanding}>
      <Textbox
        icon={
          <Search size={20} color={isLanding ? theme.primary : theme.dark3} />
        }
        rightElement={<ShortcutBadge>{isMac ? '⌘K' : 'Ctrl+K'}</ShortcutBadge>}
        text={searchText}
        setText={handleKeyStroke}
        placeholder="Search for courses, subjects or professors"
        handleKeyDown={handleSearch}
        options={options}
        maxLength={100}
        forwardRef={inputRef}
        onFocus={() => {
          setOpen(true);
        }}
      />
      {open && renderSearchResults()}
    </SearchBarWrapper>
  );
};

export default SearchBar;
