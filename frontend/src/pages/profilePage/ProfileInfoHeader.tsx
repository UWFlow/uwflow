import React from 'react';
import { Edit, Trash2 } from 'react-feather';
import { UserInfoFragment } from 'generated/graphql';

import { DELETE_ACCOUNT_MODAL, EDIT_EMAIL_MODAL } from 'constants/Modal';
import useModal from 'hooks/useModal';
import { getKittenFromID } from 'utils/Kitten';

import {
  ProfileInfoHeaderWrapper,
  ProfileInfoSection,
  ProfileOptionIconWrapper,
  UserClickable,
  UserEmailText,
  UserInfoWrapper,
  UserName,
  UserPicture,
  UserProfileOptionWrapper,
  UserProgram,
} from './styles/ProfileInfoHeader';

type ProfileInfoHeaderProps = {
  user: UserInfoFragment;
};

const ProfileInfoHeader = ({ user }: ProfileInfoHeaderProps) => {
  const [openModal] = useModal();

  return (
    <ProfileInfoHeaderWrapper>
      <ProfileInfoSection>
        <UserPicture
          image={user.picture_url ? user.picture_url : getKittenFromID(user.id)}
        />
        <UserInfoWrapper>
          <UserName>{user.full_name}</UserName>
          <UserProgram>{user.program}</UserProgram>
          <UserProfileOptionWrapper>
            <UserEmailText>Send notifications to</UserEmailText>
            <UserClickable
              onClick={() => openModal(EDIT_EMAIL_MODAL, { email: user.email })}
            >
              {user.email}
              <ProfileOptionIconWrapper>
                <Edit size={16} />
              </ProfileOptionIconWrapper>
            </UserClickable>
          </UserProfileOptionWrapper>
          <UserProfileOptionWrapper>
            <UserClickable onClick={() => openModal(DELETE_ACCOUNT_MODAL, {})}>
              Delete account
              <ProfileOptionIconWrapper>
                <Trash2 size={16} />
              </ProfileOptionIconWrapper>
            </UserClickable>
          </UserProfileOptionWrapper>
        </UserInfoWrapper>
      </ProfileInfoSection>
    </ProfileInfoHeaderWrapper>
  );
};

export default ProfileInfoHeader;
