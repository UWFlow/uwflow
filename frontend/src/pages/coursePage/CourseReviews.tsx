import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import {
  CourseReviewsQuery,
  CourseReviewsQueryVariables,
  CourseReviewsWithUserDataQuery,
} from 'generated/graphql';
import { getProfPageRoute } from 'Routes';
import { useTheme } from 'styled-components';

import CollapsibleContainer from 'components/display/CollapsibleContainer';
import LoadingSpinner from 'components/display/LoadingSpinner';
import Review from 'components/display/Review';
import TabContainer from 'components/display/TabContainer';
import DropdownList from 'components/input/DropdownList';
import {
  MIN_REVIEWS_SHOWN_COURSE,
  MIN_REVIEWS_SHOWN_PROF,
  REVIEWS_DIV_ID,
} from 'constants/PageConstants';
import { getIsBrowserDesktop, RootState } from 'data/reducers/RootReducer';
import {
  COURSE_REVIEWS,
  COURSE_REVIEWS_WITH_USER_DATA,
} from 'graphql/queries/course/CourseReview';
import useCourseReviews, { UPDATE_REVIEW_DATA } from 'hooks/useCourseReviews';
import { processRating } from 'utils/Misc';
import { sortByLiked, sortByReviews, sortReviews } from 'utils/Review';

import {
  CourseCourseReviewsWrapper,
  CourseProfReviewsWrapper,
  CourseReviewWrapper,
  DropdownPanelWrapper,
  DropdownTableText,
  NameNumReviewsWrapper,
  NumProfReviews,
  ProfDropdownPanelWrapper,
  ProfHeader,
  ProfLikedMetric,
  ProfLikedPercent,
  ProfLikedPercentLabel,
  ProfName,
  ProfReviewDropdownsWrapper,
  ReviewListWrapper,
  ReviewsForSingleProfWrapper,
  ReviewsOptionsWrapper,
  ShowMoreReviewsSection,
  ShowMoreReviewsText,
} from './styles/CourseReviews';

type CourseCourseReviewsProps = {
  reviews: any;
  courseSort: any;
  setCourseSort: any;
  courseProfFilter: any;
  courseProfFilterOptions: any;
  setCourseProfFilter: any;
};

const CourseCourseReviews = ({
  reviews,
  courseSort,
  setCourseSort,
  courseProfFilter,
  courseProfFilterOptions,
  setCourseProfFilter,
}: CourseCourseReviewsProps) => {
  const theme = useTheme();
  const [showingAllReviews, setShowingAllReviews] = useState(false);

  const renderReviews = useMemo(
    () =>
      sortReviews(reviews, courseSort === 0)
        .filter((_, i) => {
          return showingAllReviews || i < MIN_REVIEWS_SHOWN_COURSE;
        })
        .map((review) => (
          <Review key={review.id} review={review} isCourseReview />
        )),
    [reviews, showingAllReviews, courseSort],
  );

  return (
    <CourseCourseReviewsWrapper>
      <ReviewListWrapper>
        <ReviewsOptionsWrapper>
          <DropdownPanelWrapper>
            <DropdownTableText>Sort by: </DropdownTableText>
            <DropdownList
              color={theme.primary}
              selectedIndex={courseSort}
              options={['most recent', 'most helpful']}
              onChange={(value) => setCourseSort(value)}
              zIndex={6}
            />
          </DropdownPanelWrapper>
          <DropdownPanelWrapper>
            <DropdownTableText>Filter by professor: </DropdownTableText>
            <DropdownList
              color={theme.professors}
              selectedIndex={courseProfFilter}
              options={courseProfFilterOptions}
              onChange={(value) => setCourseProfFilter(value)}
              searchable
            />
          </DropdownPanelWrapper>
        </ReviewsOptionsWrapper>
        {renderReviews}
      </ReviewListWrapper>
      {reviews.length > MIN_REVIEWS_SHOWN_COURSE && (
        <ShowMoreReviewsSection
          onClick={() => setShowingAllReviews(!showingAllReviews)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ShowMoreReviewsText>
            {showingAllReviews
              ? `Show fewer reviews`
              : `Show all ${reviews.length} reviews`}
          </ShowMoreReviewsText>
        </ShowMoreReviewsSection>
      )}
    </CourseCourseReviewsWrapper>
  );
};

type CourseProfReviewsProps = {
  reviewsByProf: any;
  selectedSort: any;
  setSelectedSort: any;
};

const CourseProfReviews = ({
  reviewsByProf,
  selectedSort,
  setSelectedSort,
}: CourseProfReviewsProps) => {
  const theme = useTheme();
  const [showingReviewsMap, setShowingReviewsMap] = useState<any>({});

  const curSelectedSort =
    selectedSort.length >= reviewsByProf.length
      ? selectedSort.slice()
      : [
          ...selectedSort,
          ...Array(reviewsByProf.length - selectedSort.length).fill(0),
        ];

  const reviewList = useMemo(
    () =>
      reviewsByProf
        .filter((prof: any) => !!prof.code)
        .map((prof: any, idx: number) => (
          <ReviewsForSingleProfWrapper key={idx}>
            <ReviewListWrapper>
              <ProfHeader>
                <NameNumReviewsWrapper>
                  <ProfName to={getProfPageRoute(prof.code)}>
                    {prof.name}
                  </ProfName>
                  <NumProfReviews>
                    {prof.reviews.length > 0
                      ? `${prof.reviews.length} review${
                          prof.reviews.length === 1 ? '' : 's'
                        } for this course`
                      : `${prof.comment_count} review${
                          prof.comment_count === 1 ? '' : 's'
                        } for other courses`}
                  </NumProfReviews>
                </NameNumReviewsWrapper>
                <ProfLikedMetric>
                  <ProfLikedPercent>
                    {processRating(prof.liked)}
                  </ProfLikedPercent>
                  <ProfLikedPercentLabel>
                    liked this professor
                  </ProfLikedPercentLabel>
                </ProfLikedMetric>
              </ProfHeader>
              {prof.reviews.length > 0 && (
                <ReviewsOptionsWrapper>
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
                      zIndex={4}
                    />
                  </DropdownPanelWrapper>
                </ReviewsOptionsWrapper>
              )}
              {sortReviews(prof.reviews, selectedSort[idx] === 0)
                .filter((_, i) => {
                  return (
                    i < MIN_REVIEWS_SHOWN_PROF || showingReviewsMap[prof.name]
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
            {prof.reviews.length > MIN_REVIEWS_SHOWN_PROF && (
              <ShowMoreReviewsSection
                id={prof.name}
                onClick={() => {
                  setShowingReviewsMap({
                    ...showingReviewsMap,
                    [prof.name]: !showingReviewsMap[prof.name],
                  });
                  if (showingReviewsMap[prof.name]) {
                    document.getElementById(prof.name)?.scrollIntoView();
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ShowMoreReviewsText>
                  {showingReviewsMap[prof.name]
                    ? `Show fewer reviews`
                    : `Show all ${prof.reviews.length} reviews`}
                </ShowMoreReviewsText>
              </ShowMoreReviewsSection>
            )}
          </ReviewsForSingleProfWrapper>
        )),
    // eslint-disable-next-line
    [reviewsByProf, showingReviewsMap, selectedSort, curSelectedSort],
  );

  return <CourseProfReviewsWrapper>{reviewList}</CourseProfReviewsWrapper>;
};

type CourseReviewsProps = {
  courseId: number;
  profsTeaching: any;
};

const CourseReviews = ({ courseId, profsTeaching }: CourseReviewsProps) => {
  const theme = useTheme();
  const isBrowserDesktop = useSelector(getIsBrowserDesktop);
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);

  const courseReviewQuery = isLoggedIn
    ? COURSE_REVIEWS_WITH_USER_DATA
    : COURSE_REVIEWS;

  const [courseSort, setCourseSort] = useState(0);
  const [courseProfFilter, setCourseProfFilter] = useState(0);
  const [profReviewFilter, setProfReviewFilter] = useState(0);
  const [showingProfReviews, setShowingProfReviews] = useState(false);
  const [profSort, setProfSort] = useState(0);
  const [selectedProfSort, setSelectedProfSort] = useState(Array(1).fill(0));

  const [reviewDataState, dispatchReviews] = useCourseReviews();

  const { loading, data } = useQuery<
    CourseReviewsQuery | CourseReviewsWithUserDataQuery,
    CourseReviewsQueryVariables
  >(courseReviewQuery, {
    variables: { id: courseId },
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
      <CourseReviewWrapper>
        <LoadingSpinner />
      </CourseReviewWrapper>
    );
  }

  const courseProfFilterOptions = [
    'all professors',
    ...reviewDataState.courseReviewProfs.sort((a, b) => a.localeCompare(b)),
  ];

  const courseReviewsToShow = reviewDataState.courseReviews.filter(
    (review) =>
      courseProfFilter === 0 ||
      review.prof === courseProfFilterOptions[courseProfFilter],
  );

  // find profs who don't have reviews but are currently teaching the course
  const profsWithReviews = reviewDataState.reviewsByProf
    .filter((prof) => !!prof.code)
    .map((prof) => prof.code);
  const additionalProfs = profsTeaching
    .filter((profObj: any) => !profsWithReviews.includes(profObj.prof.code))
    .map((profObj: any) =>
      Object({
        ...profObj.prof,
        ...profObj.prof.rating,
        reviews: [],
      }),
    );

  const profFilterOptions = [
    'all professors',
    ...[
      ...reviewDataState.profReviewProfs,
      ...additionalProfs.map((prof: any) => prof.name),
    ].sort((a, b) => a.localeCompare(b)),
  ];

  const sortProfs = (a: any, b: any) =>
    profSort === 0
      ? sortByReviews(a, b, (x, y) => x.name.localeCompare(y.name))
      : sortByLiked(a, b);

  const profReviewsToShow = reviewDataState.reviewsByProf
    .concat(additionalProfs)
    .sort(sortProfs)
    .filter(
      (prof) =>
        profReviewFilter === 0 ||
        prof.name === profFilterOptions[profReviewFilter],
    );

  const numProfReviews = profReviewsToShow.reduce((total, curr) => {
    total += curr.reviews.length;
    return total;
  }, 0);

  const ProfDropdowns = (
    <ProfReviewDropdownsWrapper>
      <ProfDropdownPanelWrapper>
        <DropdownTableText>Sort by: </DropdownTableText>
        <DropdownList
          color={theme.primary}
          selectedIndex={profSort}
          options={['most reviews', 'most liked']}
          onChange={(value) => setProfSort(value)}
          zIndex={6}
        />
      </ProfDropdownPanelWrapper>
      <ProfDropdownPanelWrapper>
        <DropdownTableText>Filter by professor: </DropdownTableText>
        <DropdownList
          color={theme.professors}
          selectedIndex={profReviewFilter}
          options={profFilterOptions}
          onChange={(value) => setProfReviewFilter(value)}
          zIndex={5}
          searchable
        />
      </ProfDropdownPanelWrapper>
    </ProfReviewDropdownsWrapper>
  );

  const tabList = [
    {
      title: `Course reviews (${courseReviewsToShow.length})`,
      render: () => (
        <CourseCourseReviews
          reviews={courseReviewsToShow}
          courseSort={courseSort}
          setCourseSort={setCourseSort}
          courseProfFilter={courseProfFilter}
          courseProfFilterOptions={courseProfFilterOptions}
          setCourseProfFilter={setCourseProfFilter}
        />
      ),
      onClick: () => setShowingProfReviews(false),
    },
    {
      title: `Professor reviews (${numProfReviews})`,
      render: () => ProfDropdowns,
      onClick: () => setShowingProfReviews(true),
    },
  ];

  return (
    <CourseReviewWrapper id={REVIEWS_DIV_ID}>
      {isBrowserDesktop && (
        <TabContainer
          tabList={tabList}
          initialSelectedTab={0}
          contentPadding="0"
        />
      )}
      {showingProfReviews && isBrowserDesktop && (
        <CourseProfReviews
          reviewsByProf={profReviewsToShow}
          selectedSort={selectedProfSort}
          setSelectedSort={setSelectedProfSort}
        />
      )}
      {!isBrowserDesktop && (
        <>
          <CollapsibleContainer
            title={`Course reviews (${courseReviewsToShow.length})`}
            margin="0 auto"
          >
            <CourseCourseReviews
              reviews={courseReviewsToShow}
              courseSort={courseSort}
              setCourseSort={setCourseSort}
              courseProfFilter={courseProfFilter}
              courseProfFilterOptions={courseProfFilterOptions}
              setCourseProfFilter={setCourseProfFilter}
            />
          </CollapsibleContainer>
          <CollapsibleContainer title={`Professor reviews (${numProfReviews})`}>
            {ProfDropdowns}
            <CourseProfReviews
              reviewsByProf={profReviewsToShow}
              selectedSort={selectedProfSort}
              setSelectedSort={setSelectedProfSort}
            />
          </CollapsibleContainer>
        </>
      )}
    </CourseReviewWrapper>
  );
};

export default CourseReviews;
