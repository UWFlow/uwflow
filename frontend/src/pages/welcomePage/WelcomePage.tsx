import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { LANDING_PAGE_ROUTE, PROFILE_PAGE_ROUTE } from 'Routes';

import ScheduleUploadModalContent from 'components/upload/ScheduleUploadModalContent';
import TranscriptUploadModalContent from 'components/upload/TranscriptUploadModalContent';
import { RootState } from 'data/reducers/RootReducer';

import { WelcomePageWrapper } from './styles/WelcomePage';

const WelcomePage = () => {
  const history = useHistory();
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const client = useApolloClient();

  const [isUploadingTranscript, setIsUploadingTranscript] = useState(true);
  const [isUploadingSchedule, setIsUploadingSchedule] = useState(false);

  if (!isLoggedIn) {
    history.push(LANDING_PAGE_ROUTE);
  }

  // Because we made an earlier GetUser query during intial login, we need to invalidate the cache
  // before redirecting to the profile page to ensure that the profile page is up to date
  const goToProfile = () => {
    client.resetStore().then(() => {
      history.push(PROFILE_PAGE_ROUTE);
    });
  };

  return (
    <WelcomePageWrapper>
      {isUploadingTranscript && (
        <TranscriptUploadModalContent
          onSkip={() => {
            setIsUploadingTranscript(false);
            setIsUploadingSchedule(true);
          }}
          showSkipStepButton={true}
        />
      )}
      {isUploadingSchedule && (
        <ScheduleUploadModalContent
          onAfterUploadSuccess={goToProfile}
          onSkip={goToProfile}
          showSkipStepButton={true}
        />
      )}
    </WelcomePageWrapper>
  );
};

export default WelcomePage;
