import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {
  Body,
  BoxShadow,
  Heading2,
  Heading4,
  Hover,
  Link,
} from 'constants/Mixins';

export const TeamMembersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 100px 0;
`;

export const MemberPhoto = styled.div<{ img: string }>`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 32px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${({ img }) => img});
  ${BoxShadow}
`;

export const MemberWrapper = styled.div`
  ${Heading4}
  ${breakpoint('tablet')`
        flex: 1;
        padding-left: 32px;
    `}
    ${breakpoint('zero', 'tablet')`
        width: 100%;
    `}
`;

export const MemberTitle = styled.div`
  ${Heading2}
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const MemberBio = styled.div`
  ${Body}
`;

export const MemberLinksWrapper = styled.div`
  margin: 16px 0;
`;

export const MemberLink = styled.a`
  ${Link}
  margin-right: 16px;
  ${Hover(true)};
`;
