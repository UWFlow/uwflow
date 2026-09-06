import React from 'react';
import { GetUserQuery, UserScheduleFragment } from 'generated/graphql';
import { useTheme } from 'styled-components';

import CheckCircle from 'components/input/CheckCircle';

import {
  CheckedItem,
  CheckedText,
  CompleteProfileHeading,
} from './styles/CompleteProfileContent';

type CompleteProfileContentProps = {
  user: UserScheduleFragment;
  reviews: GetUserQuery['review'];
  coursesTaken: GetUserQuery['user_course_taken'];
};

const CompleteProfileContent = ({
  user,
  coursesTaken,
  reviews,
}: CompleteProfileContentProps) => {
  const theme = useTheme();

  const hasScheduleUploaded = user.schedule && user.schedule.length > 0;
  const hasCourseInfo = coursesTaken && coursesTaken.length > 0;
  const hasCoursesReviewed =
    reviews &&
    reviews.length > 0 &&
    !!reviews.find(
      (r) =>
        r.liked !== null ||
        r.course_easy !== null ||
        r.course_useful !== null ||
        r.course_comment !== null,
    );
  const hasProfsReviewed =
    reviews &&
    reviews.length > 0 &&
    !!reviews.find(
      (r) =>
        r.prof_id !== null &&
        (r.prof_clear !== null ||
          r.prof_engaging !== null ||
          r.prof_comment !== null),
    );

  return (
    <>
      <CompleteProfileHeading>Complete your profile</CompleteProfileHeading>
      <CheckedItem>
        <CheckCircle color={theme.primary} checked={hasScheduleUploaded} />
        <CheckedText checked={hasScheduleUploaded}>
          Upload your schedule
        </CheckedText>
      </CheckedItem>
      <CheckedItem>
        <CheckCircle color={theme.primary} checked={hasCourseInfo} />
        <CheckedText checked={hasCourseInfo}>
          Import your previous courses
        </CheckedText>
      </CheckedItem>
      <CheckedItem>
        <CheckCircle color={theme.primary} checked={hasCoursesReviewed} />
        <CheckedText checked={hasCoursesReviewed}>
          Add a rating for a course
        </CheckedText>
      </CheckedItem>
      <CheckedItem>
        <CheckCircle color={theme.primary} checked={hasProfsReviewed} />
        <CheckedText checked={hasProfsReviewed}>
          Add a rating for a professor
        </CheckedText>
      </CheckedItem>
    </>
  );
};

export default CompleteProfileContent;
