import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Heading4, Hover } from 'constants/Mixins';

export const FlowLogoWrapper = styled(Link)`
  user-select: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.dark1};
  text-decoration: none;
  border: none;
  ${Heading4}
  font-size: 24px;
  margin-right: 40px;
  font-weight: 600;
  ${Hover()}
`;

export const BlueText = styled.div`
  color: ${({ theme }) => theme.primary};
  margin-left: 4px;
`;
