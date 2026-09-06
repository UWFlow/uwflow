import React from 'react';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  CourseInfoFragment,
  CourseRatingFragment,
  CourseRequirementsFragment,
  CourseReviewDistributionFragment,
  CourseScheduleFragment,
  GetCourseQuery,
  GetCourseQueryVariables,
  GetCourseWithUserDataQuery,
  ReviewInfoFragment,
} from 'generated/graphql';

import LoadingSpinner from 'components/display/LoadingSpinner';
import Button from 'components/input/Button';
import LikeCourseToggle from 'components/input/LikeCourseToggle';
import { DEFAULT_ERROR, NOT_FOUND } from 'constants/Messages';
import { AUTH_MODAL, COURSE_REVIEW_COURSE_MODAL } from 'constants/Modal';
import { getIsBrowserDesktop, RootState } from 'data/reducers/RootReducer';
import {
  GET_COURSE,
  GET_COURSE_WITH_USER_DATA,
} from 'graphql/queries/course/Course';
import useModal from 'hooks/useModal';
import NotFoundPage from 'pages/notFoundPage/NotFoundPage';
import { getUserId } from 'utils/Auth';
import { formatCourseCode } from 'utils/Misc';
import { createOrderedBuckets, Distribution } from 'utils/Ratings';

import {
  Column1,
  Column2,
  ColumnWrapper,
  CoursePageWrapper,
  CourseQuestionTextAndToggle,
  CourseReviewQuestionBox,
  CourseReviewQuestionText,
  ReviewWrapper,
} from './styles/CoursePage';
import CourseInfoHeader from './CourseInfoHeader';
import CourseRequisites from './CourseRequisites';
import CourseReviews from './CourseReviews';
import CourseSchedule from './CourseSchedule';

export type Course = CourseInfoFragment &
  CourseScheduleFragment &
  CourseRequirementsFragment &
  CourseRatingFragment &
  CourseReviewDistributionFragment;

type CoursePageContentProps = {
  course: Course;
  userEmail?: string | null;
  userReview?: ReviewInfoFragment;
  sectionSubscriptions?: GetCourseWithUserDataQuery['queue_section_subscribed'];
  shortlisted?: boolean;
  userCourseTaken?: boolean;
};

const CoursePageContent = ({
  course,
  userReview,
  sectionSubscriptions = [],
  shortlisted = false,
  userCourseTaken = false,
  userEmail = null,
}: CoursePageContentProps) => {
  const [openModal, closeModal] = useModal();
  const isBrowserDesktop = useSelector(getIsBrowserDesktop);
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);

  const usefulDistribution: Distribution = {
    hasDistribution: course.course_useful_buckets.length > 0,
    displayName: 'Useful',
    buckets: createOrderedBuckets(course.course_useful_buckets),
    total: course.course_useful_buckets.reduce(
      (acc, bucket) => acc + bucket.count,
      0,
    ),
  };

  const easyDistribution: Distribution = {
    hasDistribution: course.course_easy_buckets.length > 0,
    displayName: 'Easy',
    buckets: createOrderedBuckets(course.course_easy_buckets),
    total: course.course_easy_buckets.reduce(
      (acc, bucket) => acc + bucket.count,
      0,
    ),
  };

  const handleReviewClick = () =>
    isLoggedIn
      ? openModal(COURSE_REVIEW_COURSE_MODAL, {
          courseReviews: [{ course, review: userReview }],
          onCancel: () => closeModal(COURSE_REVIEW_COURSE_MODAL),
        })
      : openModal(AUTH_MODAL);

  const Schedule = (
    <CourseSchedule
      sections={course.sections}
      courseCode={course.code}
      courseId={course.id}
      sectionSubscriptions={sectionSubscriptions}
      userEmail={userEmail}
    />
  );

  return (
    <>
      <CourseInfoHeader
        course={course}
        shortlisted={shortlisted}
        distributions={{
          useful: usefulDistribution,
          easy: easyDistribution,
        }}
      />
      <ColumnWrapper>
        {isBrowserDesktop && Schedule}
        <Column1>
          <ReviewWrapper>
            {!isBrowserDesktop && Schedule}
            {(!isLoggedIn || userCourseTaken) && (
              <CourseReviewQuestionBox>
                <CourseQuestionTextAndToggle>
                  <CourseReviewQuestionText>
                    What do you think of {formatCourseCode(course.code)}?
                  </CourseReviewQuestionText>
                  <LikeCourseToggle
                    courseCode={course.code}
                    courseId={course.id}
                    profId={userReview?.prof_id}
                    reviewId={userReview?.id}
                    initialState={userReview?.liked}
                  />
                </CourseQuestionTextAndToggle>
                <Button
                  width={isBrowserDesktop ? 'max-content' : '100%'}
                  padding="16px 24px"
                  handleClick={handleReviewClick}
                >
                  {userReview ? 'Edit your review' : 'Add your review'}
                </Button>
              </CourseReviewQuestionBox>
            )}
          </ReviewWrapper>
          <CourseReviews
            courseId={course.id}
            profsTeaching={course.profs_teaching}
          />
        </Column1>
        <Column2>
          <CourseRequisites
            courseCode={course.code}
            prereqs={course.prereqs}
            antireqs={course.antireqs}
            coreqs={course.coreqs}
            postreqs={course.postrequisites}
          />
        </Column2>
      </ColumnWrapper>
    </>
  );
};

const CoursePage = () => {
  const match = useRouteMatch<{ courseCode: string }>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);

  const courseCode = match.params.courseCode.toLowerCase();

  const query = isLoggedIn ? GET_COURSE_WITH_USER_DATA : GET_COURSE;
  const variables = {
    code: courseCode,
    ...(isLoggedIn && { user_id: getUserId() }),
  };

  const { loading, error, data } = useQuery<
    GetCourseQuery | GetCourseWithUserDataQuery,
    GetCourseQueryVariables
  >(query, { variables });

  const renderContent = (
    queryData: GetCourseQuery | GetCourseWithUserDataQuery,
  ) => {
    if (isLoggedIn) {
      const dataWithUser = queryData as GetCourseWithUserDataQuery;
      return (
        <CoursePageContent
          course={dataWithUser.course[0]}
          userEmail={dataWithUser.user[0].email}
          userReview={dataWithUser.review[0]}
          userCourseTaken={dataWithUser.user_course_taken.length > 0}
          shortlisted={dataWithUser.user_shortlist.length > 0}
          sectionSubscriptions={dataWithUser.queue_section_subscribed}
        />
      );
    }
    return <CoursePageContent course={queryData.course[0]} />;
  };

  return loading ? (
    <CoursePageWrapper>
      <LoadingSpinner />
    </CoursePageWrapper>
  ) : error || !data ? (
    <NotFoundPage text={DEFAULT_ERROR} title="" />
  ) : data.course.length === 0 ? (
    <NotFoundPage text={NOT_FOUND.course} />
  ) : (
    <CoursePageWrapper>
      <Helmet>
        <title>
          {formatCourseCode(data.course[0].code)} - {data.course[0].name} - UW
          Flow
        </title>
        <meta name="description" content={data.course[0].description ?? ''} />
        <meta
          property="og:title"
          content={`${formatCourseCode(data.course[0].code)} - ${
            data.course[0].name
          } - UW Flow`}
        />
        <meta
          property="og:description"
          content={data.course[0].description ?? ''}
        />
      </Helmet>
      {renderContent(data)}
    </CoursePageWrapper>
  );
};

export default CoursePage;
