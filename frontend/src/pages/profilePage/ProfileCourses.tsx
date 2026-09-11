import React, { ReactNode } from 'react';
import { Edit, PlusSquare } from 'react-feather';
import { ApolloQueryResult } from '@apollo/client';
import {
  GetUserQuery,
  GetUserQueryVariables,
  ReviewInfoFragment,
  UserCoursesTakenFragment,
} from 'generated/graphql';
import { getCoursePageRoute } from 'Routes';
import { useTheme } from 'styled-components';

import TabContainer from 'components/display/TabContainer';
import Button from 'components/input/Button';
import LikeCourseToggle from 'components/input/LikeCourseToggle';
import {
  COURSE_REVIEW_COURSE_MODAL,
  TRANSCRIPT_UPLOAD_MODAL,
} from 'constants/Modal';
import useModal from 'hooks/useModal';
import { formatCourseCode, processRating, termCodeToDate } from 'utils/Misc';

import {
  AddReviewIcon,
  HeaderText,
  LikedCourseWrapper,
  LikedThisCourseText,
  LikeToggleWrapper,
  ProfileCourseCode,
  ProfileCourseLiked,
  ProfileCourseName,
  ProfileCourseReviewButtonText,
  ProfileCoursesCourse,
  ProfileCoursesWrapper,
  ProfileCourseText,
  ReviewButtonContents,
  YourCoursesWrapper,
} from './styles/ProfileCourses';

type IndexedUserCourse = UserCoursesTakenFragment & { index: number };

type TermCourseGroups = {
  [key: string]: IndexedUserCourse[];
};

type ProfileCoursesProps = {
  reviews: GetUserQuery['review'];
  userCourses: GetUserQuery['user_course_taken'];
  reviewModalCourseList: {
    course: UserCoursesTakenFragment['course'];
    review?: ReviewInfoFragment;
  }[];
  refetchAll: (
    variables: GetUserQueryVariables,
  ) => Promise<ApolloQueryResult<GetUserQuery>>;
};

const ProfileCourses = ({
  reviews,
  userCourses,
  reviewModalCourseList,
  refetchAll,
}: ProfileCoursesProps) => {
  const [openModal, closeModal] = useModal();
  const theme = useTheme();

  const groupCoursesByTerm = () => {
    return userCourses.reduce((groups: TermCourseGroups, course, idx) => {
      groups[course.term_id] = groups[course.term_id] || [];
      groups[course.term_id].push({ ...course, index: idx });
      return groups;
    }, {});
  };

  const unorderedGroups = groupCoursesByTerm();
  const courseGroups: { [key: string]: IndexedUserCourse[] } = {};
  const reviewModalProps = {
    showCourseDropdown: true,
    courseReviews: reviewModalCourseList,
    onCancel: () => closeModal(COURSE_REVIEW_COURSE_MODAL),
  };

  // sort terms by date
  Object.keys(unorderedGroups)
    .sort()
    .reverse()
    .forEach((term) => {
      courseGroups[termCodeToDate(Number(term))] = unorderedGroups[term];
    });

  const sortedCourseList = reviewModalCourseList.sort((a, b) =>
    (a.course?.code ?? '').localeCompare(b.course?.code ?? ''),
  );

  const tabContent = (termName: string): ReactNode =>
    courseGroups[termName].map((courseTaken) => {
      const course = courseTaken.course;
      if (!course) return null;
      const review = reviews.find((r) => r.course_id === courseTaken.course_id);
      const selectedIndex = sortedCourseList.findIndex(
        (courseObj) => courseObj.course?.id === courseTaken.course?.id,
      );

      return (
        <ProfileCoursesCourse key={course.id}>
          <ProfileCourseText>
            <ProfileCourseCode to={getCoursePageRoute(course.code)}>
              {formatCourseCode(course.code)}
            </ProfileCourseCode>
            <ProfileCourseName>{course.name}</ProfileCourseName>
          </ProfileCourseText>
          <LikedCourseWrapper>
            <ProfileCourseLiked>
              {processRating(course.rating?.liked ?? 0)}
            </ProfileCourseLiked>
            <LikedThisCourseText>
              liked this
              <br />
              course
            </LikedThisCourseText>
          </LikedCourseWrapper>
          <LikeToggleWrapper>
            <LikeCourseToggle
              key={course.id}
              courseId={course.id}
              courseCode={course.code}
              profId={review ? review.prof_id : null}
              reviewId={review ? review.id : null}
              initialState={review ? review.liked : null}
            />
          </LikeToggleWrapper>
          <Button
            key={course.id}
            margin="auto 0 auto 16px"
            padding="8px"
            height={48}
            maxHeight={'48px'}
            handleClick={() => {
              openModal(COURSE_REVIEW_COURSE_MODAL, {
                ...reviewModalProps,
                initialSelectedCourseIndex: selectedIndex,
              });
            }}
          >
            <ReviewButtonContents>
              <AddReviewIcon>
                {review ? (
                  <Edit color={theme.dark2} size={20} strokeWidth={2} />
                ) : (
                  <PlusSquare color={theme.dark2} size={20} strokeWidth={2} />
                )}
              </AddReviewIcon>
              <ProfileCourseReviewButtonText>
                {review ? 'Edit review' : 'Add review'}
              </ProfileCourseReviewButtonText>
            </ReviewButtonContents>
          </Button>
        </ProfileCoursesCourse>
      );
    });

  const tabList = Object.keys(courseGroups).map((termName) => {
    return {
      title: termName,
      render: () => tabContent(termName),
      onClick: () => {},
    };
  });

  const transcriptModalProps = {
    onAfterUploadSuccess: refetchAll,
    onSkip: () => closeModal(TRANSCRIPT_UPLOAD_MODAL),
  };

  return tabList.length > 0 ? (
    <ProfileCoursesWrapper>
      <YourCoursesWrapper columnBreak={425}>
        <HeaderText columnBreak={425}>Your courses</HeaderText>
        <Button
          handleClick={() =>
            openModal(TRANSCRIPT_UPLOAD_MODAL, transcriptModalProps)
          }
          padding="8px 24px"
        >
          Add previous terms
        </Button>
      </YourCoursesWrapper>
      <TabContainer tabList={tabList} contentPadding="0" minTabWidth={144} />
    </ProfileCoursesWrapper>
  ) : (
    <ProfileCoursesWrapper>
      <YourCoursesWrapper columnBreak={1120}>
        <HeaderText columnBreak={1120}>Add courses you have taken</HeaderText>
        <Button
          handleClick={() =>
            openModal(TRANSCRIPT_UPLOAD_MODAL, transcriptModalProps)
          }
          padding="8px 24px"
        >
          Add previous terms
        </Button>
      </YourCoursesWrapper>
    </ProfileCoursesWrapper>
  );
};

export default ProfileCourses;
