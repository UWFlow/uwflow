import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GetUserQuery } from 'generated/graphql';
import { Dispatch } from 'redux';
import {
  isOnLandingPageRoute,
  PROFILE_PAGE_ROUTE,
  SWAP_PAGE_ROUTE,
} from 'Routes';
import { useTheme } from 'styled-components';

import DropdownList from 'components/input/DropdownList';
import { AUTH_MODAL } from 'constants/Modal';
import { RootState } from 'data/reducers/RootReducer';
import { GET_USER } from 'graphql/queries/user/User';
import useModal from 'hooks/useModal';
import { logOut } from 'utils/Auth';
import { getKittenFromID } from 'utils/Kitten';

import {
  ProfileDropdownWrapper,
  ProfilePicture,
  ProfileText,
} from './styles/ProfileDropdown';

const renderProfilePicture = (
  data: GetUserQuery | undefined,
  dispatch: Dispatch,
  isLanding: boolean,
  loading: boolean,
) => {
  let user: { id?: number | null; picture_url?: string | null } = {
    id: null,
    picture_url: null,
  };

  // While the query is in flight `data` is still undefined; show the fallback
  // kitten and hold off on the "empty user => log out" check until the real
  // response arrives, so a slow load can't trigger a spurious logout.
  if (!loading && data && data.user) {
    if (data.user.length > 0) {
      [user] = data.user;
    } else {
      logOut(dispatch);
    }
  }

  return (
    <ProfilePicture
      image={user.picture_url || getKittenFromID(user.id)}
      isLanding={isLanding}
      onMouseDown={(e) => e.preventDefault()}
    />
  );
};

const ProfileDropdown = () => {
  const [openModal] = useModal();
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const isLanding = isOnLandingPageRoute(location);

  const { data, loading } = useQuery<GetUserQuery>(GET_USER, {
    variables: { id: Number(localStorage.getItem('user_id')) },
    skip: !isLoggedIn,
  });

  const handleProfileButtonClick = () =>
    isLoggedIn ? history.push(PROFILE_PAGE_ROUTE) : openModal(AUTH_MODAL);

  return (
    <ProfileDropdownWrapper>
      {isLoggedIn ? (
        <>
          <ProfileText onClick={handleProfileButtonClick} isLanding={isLanding}>
            {renderProfilePicture(data, dispatch, isLanding, loading)}
          </ProfileText>
          <DropdownList
            selectedIndex={-1}
            width={150}
            color={isLanding ? theme.white : theme.dark2}
            itemColor={theme.dark1}
            options={['View profile', 'Swap Class', 'Log out']}
            onChange={(idx) => {
              if (idx === 0) {
                handleProfileButtonClick();
              } else if (idx === 1) {
                history.push(SWAP_PAGE_ROUTE);
              } else {
                logOut(dispatch, true);
              }
            }}
            placeholder=""
            zIndex={10}
            menuOffset={24}
          />
        </>
      ) : (
        <ProfileText onClick={handleProfileButtonClick} isLanding={isLanding}>
          Log in
        </ProfileText>
      )}
    </ProfileDropdownWrapper>
  );
};

export default ProfileDropdown;
