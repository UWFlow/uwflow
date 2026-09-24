import React from 'react';

import Avatar from 'components/display/Avatar';
import Tooltip from 'components/display/Tooltip';
import { getKittenFromID } from 'utils/Kitten';

import { GroupMember } from './api';

const MemberAvatar = ({ member }: { member: GroupMember }) => (
  <Tooltip content={member.name}>
    <Avatar
      src={getKittenFromID(member.user_id)}
      alt={member.name}
      size="sm"
      tabIndex={0}
      className="h-5 w-5 border border-solid border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    />
  </Tooltip>
);

export default MemberAvatar;
