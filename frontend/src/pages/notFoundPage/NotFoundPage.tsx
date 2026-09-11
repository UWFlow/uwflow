import React from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { LANDING_PAGE_ROUTE } from 'Routes';

import Button from 'components/input/Button';
import { NOT_FOUND } from 'constants/Messages';

import {
  HeaderText,
  NotFoundImage,
  NotFoundPageWrapper,
  PageHeader,
} from './styles/NotFoundPage';

type NotFoundPageProps = {
  text?: string;
  title?: string;
};

const NotFoundPage = ({
  text = NOT_FOUND.page,
  title = 'Not Found',
}: NotFoundPageProps) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(LANDING_PAGE_ROUTE);
  };

  return (
    <NotFoundPageWrapper>
      <Helmet>
        <title>{title} - UW Flow</title>
      </Helmet>
      <PageHeader>
        <HeaderText>{text}</HeaderText>
      </PageHeader>
      <NotFoundImage />
      <Button handleClick={handleClick}>Home</Button>
    </NotFoundPageWrapper>
  );
};

export default NotFoundPage;
