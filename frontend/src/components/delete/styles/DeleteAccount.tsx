import React from 'react';
import styled from 'styled-components';

import { BoxShadow } from 'constants/Mixins';
import { cn } from 'lib/utils';

export const DeleteModalWrapper = styled.form`
  ${BoxShadow}
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: white;
  width: 400px;
  border-radius: 4px;
  max-width: 95vw;
  min-width: 300px;
`;

export const DeleteAccountTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={cn(
      'mb-lg min-w-0 w-full break-words font-anderson text-3xl font-extrabold tabletDown:text-2xl',
      className,
    )}
  />
);

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const ConfirmationText = styled.div`
  margin-bottom: 16px;
`;
