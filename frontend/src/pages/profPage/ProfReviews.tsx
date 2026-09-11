import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import { getCoursePageRoute } from 'Routes';
import { useTheme } from 'styled-components';

import LoadingSpinner from 'components/display/LoadingSpinner';
import Review from 'components/display/Review';
import DropdownList from 'components/input/DropdownList';
import {
  MIN_REVIEWS_SHOWN_PROF,
  REVIEWS_DIV_ID,
} from 'constants/PageConstants';
import { RootState } from 'data/reducers/RootReducer';
import {
  PROF_REVIEWS,
  PROF_REVIEWS_WITH_USER_DATA,
} from 'graphql/queries/prof/ProfReview';
import useProfReviews, { UPDATE_REVIEW_DATA } from 'hooks/useProfReviews';
import { formatCourseCode, processRating } from 'utils/Misc';
import { sortByLiked, sortByReviews, sortReviews } from 'utils/Review';

import {
  CourseCode,
  CourseDropdownsWrapper,
  CourseHeader,
  CourseLikedMetric,
  CourseLikedPercent,
  CourseLikedPercentLabel,
  CourseName,
  CourseNameAndCode,
  DropdownPanelWrapper,
  DropdownTableText,
  NoReviewsBox,
  ProfCourseReviewWrapper,
  ReviewListWrapper,
  ReviewsForSingleCourseWrapper,
  ShowMoreReviewsSection,
  ShowMoreReviewsText,
  SortFilterDropdownWrapper,
} from './styles/ProfReviews';

type ProfReviewsProps = {
  profId: number;
};

const ProfReviews = ({ profId }: ProfReviewsProps) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const theme = useTheme();

  const [courseSort, setCourseSort] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedSort, setSelectedSort] = useState(Array(1).fill(0));
  const [showingReviewsMap, setShowingReviewsMap] = useState<{
    [key: string]: string;
  }>({});

  const [reviewDataState, dispatchReviews] = useProfReviews();

  const profReviewsQuery = isLoggedIn
    ? PROF_REVIEWS_WITH_USER_DATA
    : PROF_REVIEWS;
  const { loading, data } = useQuery(profReviewsQuery, {
    variables: { id: profId },
  });

  useEffect(() => {
    if (data) {
      dispatchReviews({
        type: UPDATE_REVIEW_DATA,
        payload: data,
      });
    }
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return (
      <ProfCourseReviewWrapper>
        <LoadingSpinner />
      </ProfCourseReviewWrapper>
    );
  }

  const courseFilterDisplayOptions = [
    'show all courses',
    ...reviewDataState.courses
      .map((code) => formatCourseCode(code))
      .sort((a, b) => a.localeCompare(b)),
  ];

  const sortCourses = (a: any, b: any) =>
    courseSort === 0
      ? sortByReviews(a, b, (x, y) => x.code.localeCompare(y.code))
      : sortByLiked(a, b);

  const reviewsByCourseToShow = reviewDataState.reviewsByCourse
    .sort(sortCourses)
    .filter(
      (course) =>
        selectedFilter === 0 ||
        formatCourseCode(course.code) ===
          courseFilterDisplayOptions[selectedFilter],
    );

  const curSelectedSort =
    selectedSort.length >= reviewsByCourseToShow.length
      ? selectedSort.slice()
      : [
          ...selectedSort,
          ...Array(reviewsByCourseToShow.length - selectedSort.length).fill(0),
        ];

  if (reviewDataState.courses.length === 0) {
    return <NoReviewsBox>No Reviews</NoReviewsBox>;
  }

  return (
    <ProfCourseReviewWrapper id={REVIEWS_DIV_ID}>
      <CourseDropdownsWrapper>
        <SortFilterDropdownWrapper>
          <DropdownTableText>Sort courses: </DropdownTableText>
          <DropdownList
            color={theme.primary}
            selectedIndex={courseSort}
            options={['most reviews', 'most liked']}
            onChange={(value) => setCourseSort(value)}
            zIndex={6}
          />
        </SortFilterDropdownWrapper>
        <SortFilterDropdownWrapper>
          <DropdownTableText>Filter by course: </DropdownTableText>
          <DropdownList
            color={theme.courses}
            selectedIndex={selectedFilter}
            options={courseFilterDisplayOptions}
            onChange={(value) => setSelectedFilter(value)}
            zIndex={5}
            searchable
          />
        </SortFilterDropdownWrapper>
      </CourseDropdownsWrapper>
      {reviewsByCourseToShow.map((course, idx) => {
        return (
          <ReviewsForSingleCourseWrapper key={idx}>
            <ReviewListWrapper>
              <CourseHeader key={course.id}>
                <CourseNameAndCode>
                  <CourseCode to={getCoursePageRoute(course.code)}>
                    {formatCourseCode(course.code)}
                  </CourseCode>
                  <CourseName>{course.name}</CourseName>
                </CourseNameAndCode>
                <CourseLikedMetric>
                  <CourseLikedPercent>
                    {processRating(course.liked)}
                  </CourseLikedPercent>
                  <CourseLikedPercentLabel>
                    liked this course
                  </CourseLikedPercentLabel>
                </CourseLikedMetric>
              </CourseHeader>
              <DropdownPanelWrapper>
                <DropdownTableText>Sort by: </DropdownTableText>
                <DropdownList
                  color={theme.primary}
                  selectedIndex={curSelectedSort[idx]}
                  options={['most recent', 'most helpful']}
                  onChange={(value) => {
                    curSelectedSort[idx] = value;
                    setSelectedSort(curSelectedSort);
                  }}
                />
              </DropdownPanelWrapper>
              {sortReviews(course.reviews, selectedSort[idx] === 0)
                .filter((_, i) => {
                  return (
                    i < MIN_REVIEWS_SHOWN_PROF || showingReviewsMap[course.code]
                  );
                })
                .map((review) => (
                  <Review
                    key={review.id}
                    review={review}
                    isCourseReview={false}
                  />
                ))}
            </ReviewListWrapper>
            {course.reviews.length > MIN_REVIEWS_SHOWN_PROF && (
              <ShowMoreReviewsSection
                onClick={() => {
                  setShowingReviewsMap({
                    ...showingReviewsMap,
                    [course.code]: !showingReviewsMap[course.code],
                  });
                  if (showingReviewsMap[course.code]) {
                    document.getElementById(course.code)?.scrollIntoView();
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ShowMoreReviewsText>
                  {showingReviewsMap[course.code]
                    ? `Show fewer reviews`
                    : `Show all ${course.reviews.length} reviews`}
                </ShowMoreReviewsText>
              </ShowMoreReviewsSection>
            )}
          </ReviewsForSingleCourseWrapper>
        );
      })}
    </ProfCourseReviewWrapper>
  );
};

export default ProfReviews;
