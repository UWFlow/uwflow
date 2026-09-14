import React from 'react';
import { useTheme } from 'styled-components';

import DiscreteSlider from 'components/input/DiscreteSlider';

import {
  NumRatingsText,
  NumRatingsWrapper,
  SearchFilterText,
} from './styles/SearchFilter';

export const RATING_MULTIPLES = [
  0, 1, 5, 10, 20, 50, 75, 100, 200, 500,
] as const;

type Props = {
  currentIndex: number;
  setSlider: (val: number) => void;
};

const RatingSlider = ({ currentIndex, setSlider }: Props) => {
  const theme = useTheme();

  return (
    <>
      <NumRatingsWrapper>
        <SearchFilterText>Min # of ratings</SearchFilterText>
        <NumRatingsText>
          &ge; {RATING_MULTIPLES[currentIndex]}{' '}
          {RATING_MULTIPLES[currentIndex] === 1 ? 'rating' : 'ratings'}
        </NumRatingsText>
      </NumRatingsWrapper>
      <DiscreteSlider
        numNodes={RATING_MULTIPLES.length}
        currentNode={currentIndex}
        color={theme.primary}
        onUpdate={(values) => setSlider(values[0])}
        showTicks={false}
        fullWidthMobile
      />
    </>
  );
};

export default RatingSlider;
