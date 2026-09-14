import React from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ApolloQueryResult, useQuery } from '@apollo/client';
import {
  GetUserQuery,
  GetUserQueryVariables,
  UserInfoFragment,
  UserScheduleFragment,
  UserShortlistFragment,
} from 'generated/graphql';
import { LANDING_PAGE_ROUTE } from 'Routes';

import LoadingSpinner from 'components/display/LoadingSpinner';
import { SEO_DESCRIPTIONS } from 'constants/Messages';
import { getIsBrowserDesktop, RootState } from 'data/reducers/RootReducer';
import { GET_USER } from 'graphql/queries/user/User';
import NotFoundPage from 'pages/notFoundPage/NotFoundPage';
import { logOut } from 'utils/Auth';

import {
  Column1,
  Column2,
  ColumnWrapper,
  CompleteProfileWrapper,
  ProfilePageWrapper,
} from './styles/ProfilePage';
import CompleteProfileContent from './CompleteProfileContent';
import ProfileCalendar from './ProfileCalendar';
import ProfileCourses from './ProfileCourses';
import ProfileInfoHeader from './ProfileInfoHeader';
import ShortlistBox from './ShortlistBox';

type ProfilePageContentProps = {
  user: UserInfoFragment & UserShortlistFragment & UserScheduleFragment;
  reviews: GetUserQuery['review'];
  coursesTaken: GetUserQuery['user_course_taken'];
  refetchAll: (
    variables: GetUserQueryVariables,
  ) => Promise<ApolloQueryResult<GetUserQuery>>;
};

const ProfilePageContent = ({
  user,
  reviews,
  coursesTaken,
  refetchAll,
}: ProfilePageContentProps) => {
  const isBrowserDesktop = useSelector(getIsBrowserDesktop);

  const { shortlist } = user;
  const reviewModalCourseList = coursesTaken.map((courseObj) => {
    const curReview = reviews.find(
      (review) => review.course_id === courseObj.course?.id,
    );

    return { course: courseObj.course, review: curReview };
  });

  return (
    <>
      <ProfileInfoHeader user={user} />
      <ColumnWrapper>
        <Column1>
          <ProfileCalendar
            schedule={user.schedule}
            secretId={user.secret_id}
            refetchAll={refetchAll}
          />
          <ProfileCourses
            reviews={reviews}
            userCourses={coursesTaken}
            reviewModalCourseList={reviewModalCourseList}
            refetchAll={refetchAll}
          />
        </Column1>
        <Column2>
          {isBrowserDesktop && (
            <CompleteProfileWrapper>
              <CompleteProfileContent
                user={user}
                coursesTaken={coursesTaken}
                reviews={reviews}
              />
            </CompleteProfileWrapper>
          )}
          <ShortlistBox shortlistCourses={shortlist} />
        </Column2>
      </ColumnWrapper>
    </>
  );
};

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const history = useHistory();

  const { loading, error, data, refetch } = useQuery<
    GetUserQuery,
    GetUserQueryVariables
  >(GET_USER, {
    variables: { id: Number(localStorage.getItem('user_id')) },
  });

  if (data && data.user.length === 0) {
    logOut(dispatch);
  }

  if (!isLoggedIn) {
    history.push(LANDING_PAGE_ROUTE);
  }

  return loading ? (
    <ProfilePageWrapper>
      <Helmet>
        <title>Profile - UW Flow</title>
        <meta name="description" content={SEO_DESCRIPTIONS.profile} />
        <meta property="og:title" content="Profile - UW Flow" />
        <meta property="og:description" content={SEO_DESCRIPTIONS.profile} />
      </Helmet>
      <LoadingSpinner />
    </ProfilePageWrapper>
  ) : error || !data ? (
    <NotFoundPage />
  ) : (
    <ProfilePageWrapper>
      <Helmet>
        <title>Profile - UW Flow</title>
      </Helmet>
      <ProfilePageContent
        user={data.user[0]}
        reviews={data.review}
        coursesTaken={data.user_course_taken}
        refetchAll={refetch}
      />
    </ProfilePageWrapper>
  );
};

export default ProfilePage;
