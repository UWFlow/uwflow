import React from 'react';
import { Helmet } from 'react-helmet';
import { useRouteMatch } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  GetProfQuery,
  GetProfQueryVariables,
  ProfCoursesTaughtFragment,
  ProfInfoFragment,
  ProfRatingFragment,
  ProfReviewDistributionFragment,
} from 'generated/graphql';

import LoadingSpinner from 'components/display/LoadingSpinner';
import { DEFAULT_ERROR, NOT_FOUND } from 'constants/Messages';
import { GET_PROF } from 'graphql/queries/prof/Prof';
import NotFoundPage from 'pages/notFoundPage/NotFoundPage';
import ProfInfoHeader from 'pages/profPage/ProfInfoHeader';
import ProfReviews from 'pages/profPage/ProfReviews';
import { createOrderedBuckets, Distribution } from 'utils/Ratings';

import {
  Column1,
  Column2,
  ColumnWrapper,
  ProfPageWrapper,
} from './styles/ProfPage';

type ProfPageContentProps = {
  prof: ProfInfoFragment &
    ProfCoursesTaughtFragment &
    ProfRatingFragment &
    ProfReviewDistributionFragment;
};

const ProfPageContent = ({ prof }: ProfPageContentProps) => {
  const clearDistribution: Distribution = {
    hasDistribution: prof.prof_clear_buckets.length > 0,
    displayName: 'Clear',
    buckets: createOrderedBuckets(prof.prof_clear_buckets),
    total: prof.prof_clear_buckets.reduce(
      (acc, bucket) => acc + bucket.count,
      0,
    ),
  };

  const engagingDistribution: Distribution = {
    hasDistribution: prof.prof_engaging_buckets.length > 0,
    displayName: 'Engaging',
    buckets: createOrderedBuckets(prof.prof_engaging_buckets),
    total: prof.prof_engaging_buckets.reduce(
      (acc, bucket) => acc + bucket.count,
      0,
    ),
  };

  return (
    <>
      <ProfInfoHeader
        prof={prof}
        distributions={{
          clear: clearDistribution,
          engaging: engagingDistribution,
        }}
      />
      <ColumnWrapper>
        <Column1>
          <ProfReviews profId={prof.id} />
        </Column1>
        <Column2 />
      </ColumnWrapper>
    </>
  );
};

export const ProfPage = () => {
  const match = useRouteMatch<{ profCode: string }>();

  const profCode = match.params.profCode.toLowerCase();

  const { loading, error, data } = useQuery<
    GetProfQuery,
    GetProfQueryVariables
  >(GET_PROF, {
    variables: { code: profCode },
  });

  // A merged-away prof row still exists, so check the merge ledger first
  const prof = data?.prof_merge[0]?.into_prof ?? data?.prof[0];

  return loading ? (
    <ProfPageWrapper>
      <LoadingSpinner />
    </ProfPageWrapper>
  ) : error || !data ? (
    <NotFoundPage text={DEFAULT_ERROR} title="" />
  ) : !prof ? (
    <NotFoundPage text={NOT_FOUND.prof} />
  ) : (
    <ProfPageWrapper>
      <Helmet>
        <title>{prof.name} - UW Flow</title>
        <meta
          name="description"
          content={`Professor ${prof.name} at the University of Waterloo.`}
        />
      </Helmet>
      <ProfPageContent prof={prof} />
    </ProfPageWrapper>
  );
};

export default ProfPage;
