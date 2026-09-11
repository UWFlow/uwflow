import React, { ReactNode } from 'react';

import {
  MemberBio,
  MemberLink,
  MemberLinksWrapper,
  MemberPhoto,
  MemberTitle,
  MemberWrapper,
  TeamMembersWrapper,
} from './styles/TeamMember';

type TeamMemberProps = {
  children: ReactNode;
  name: string;
  photo: string;
  title: string;
  linkedIn?: string;
  program?: string;
  twitter?: string;
  website?: string;
};

const TeamMember = ({
  photo,
  name,
  title,
  linkedIn,
  program,
  website,
  twitter,
  children,
}: TeamMemberProps) => (
  <TeamMembersWrapper>
    <MemberPhoto img={photo} />
    <MemberWrapper>
      <MemberTitle>{name}</MemberTitle>
      {title}
      {program && ` — ${program}`}
      <MemberLinksWrapper>
        {linkedIn && (
          <MemberLink href={linkedIn} target="_blank" rel="noopener noreferrer">
            Linkedin
          </MemberLink>
        )}
        {website && (
          <MemberLink href={website} target="_blank" rel="noopener noreferrer">
            Website
          </MemberLink>
        )}
        {twitter && (
          <MemberLink href={twitter} target="_blank" rel="noopener noreferrer">
            Twitter
          </MemberLink>
        )}
      </MemberLinksWrapper>
      <MemberBio>{children}</MemberBio>
    </MemberWrapper>
  </TeamMembersWrapper>
);

export default TeamMember;
