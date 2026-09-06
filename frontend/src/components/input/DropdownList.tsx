import React, { useCallback, useEffect, useRef, useState } from 'react';
import FadeIn from 'react-fade-in';
import { ChevronDown, Search } from 'react-feather';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import fuzzysort from 'fuzzysort';
import { useTheme } from 'styled-components';
import useOnClickOutside from 'use-onclickoutside';

import KeycodeConstants from 'constants/KeycodeConstants';

import {
  DropdownControl,
  DropdownMenu,
  DropdownWrapper,
  ITEM_HEIGHT,
  MenuItem,
  MenuSearch,
} from './styles/DropdownList';
import Textbox from './Textbox';

type DropdownListProps = {
  color: string;
  options: string[];
  selectedIndex: number;
  maxItems?: number;
  menuOffset?: number;
  itemColor?: string;
  margin?: string;
  onChange?: (index: number) => void;
  placeholder?: string;
  searchable?: boolean;
  width?: number;
  zIndex?: number;
};

const DropdownList = ({
  color,
  options,
  selectedIndex,
  onChange = () => {},
  placeholder = 'select an option',
  zIndex = 4,
  width = 150,
  margin = 'auto',
  itemColor = undefined,
  menuOffset = 8,
  searchable = false,
  maxItems = 5,
}: DropdownListProps) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<
    Array<{ value: string; index: number }>
  >(options.map((opt, idx) => ({ value: opt, index: idx })));
  useOnClickOutside(ref, () => setOpen(false));

  const handleUserKeyPress = useCallback((event: KeyboardEvent) => {
    const { keyCode } = event;
    if (keyCode === KeycodeConstants.ESCAPE) {
      setOpen(false);
    }
  }, []);

  const filterAndSetOptions = (
    searchValue: string,
    optionsList: string[],
    setFilteredOptionsFn: React.Dispatch<
      React.SetStateAction<Array<{ value: string; index: number }>>
    >,
  ) => {
    if (!searchValue) {
      setFilteredOptionsFn(
        optionsList.map((opt, idx) => ({ value: opt, index: idx })),
      );
      return;
    }

    const results = fuzzysort.go(searchValue, optionsList, {
      threshold: -10000,
      allowTypo: true,
    });

    setFilteredOptionsFn(
      results.map((result) => ({
        value: result.target,
        index: optionsList.indexOf(result.target),
      })),
    );
  };

  useEffect(() => {
    filterAndSetOptions(searchText, options, setFilteredOptions);
  }, [searchText, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => (
      <MenuItem
        key={filteredOptions[index].index}
        selected={filteredOptions[index].index === selectedIndex}
        itemColor={itemColor}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onChange(filteredOptions[index].index);
          setOpen(false);
        }}
        style={style}
      >
        {filteredOptions[index].value}
      </MenuItem>
    ),
    [filteredOptions, selectedIndex, itemColor, onChange],
  );

  const DropdownMenuContent = () => (
    <>
      {searchable && options.length > maxItems && (
        <MenuSearch>
          <Textbox
            icon={<Search color={theme.dark3} />}
            text={searchText}
            setText={setSearchText}
            placeholder=""
            maxLength={50}
            options={{
              width: '100%',
              backgroundColor: theme.light2,
              padding: 0,
            }}
          />
        </MenuSearch>
      )}
      <List
        height={Math.min(
          filteredOptions.length * ITEM_HEIGHT,
          maxItems * ITEM_HEIGHT,
        )}
        itemCount={filteredOptions.length}
        itemSize={ITEM_HEIGHT}
        width={width}
      >
        {Row}
      </List>
    </>
  );

  return (
    <DropdownWrapper
      zIndex={zIndex}
      ref={ref}
      width={width.toString()}
      margin={margin}
    >
      <DropdownControl
        open={open}
        color={color}
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => e.preventDefault()}
      >
        {selectedIndex !== -1 ? options[selectedIndex] : placeholder}
        <ChevronDown />
      </DropdownControl>
      <FadeIn>
        <DropdownMenu open={open} menuOffset={menuOffset}>
          {DropdownMenuContent()}
        </DropdownMenu>
      </FadeIn>
    </DropdownWrapper>
  );
};

export default DropdownList;
