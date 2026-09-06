import React from 'react';
import { faRedditAlien } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  CourseInfoFragment,
  CourseRatingFragment,
  CourseReviewDistributionFragment,
} from 'generated/graphql';

import RatingBox, { RATING_BOX_WIDTH } from 'components/display/RatingBox';
import ShortlistStar from 'components/input/ShortlistStar';
import { formatCourseCode } from 'utils/Misc';
import { Distribution } from 'utils/Ratings';

import {
  CourseCode,
  CourseCodeAndNameSection,
  CourseCodeAndStar,
  CourseDescriptionSection,
  CourseInfoHeaderWrapper,
  CourseName,
  CourseNameWrapper,
  Description,
  RatingsSection,
  RedditSearchButton,
  RedditSearchButtonText,
  StarAlignmentWrapper,
} from './styles/CourseInfoHeader';

type CourseInfoHeaderProps = {
  course: CourseInfoFragment &
    CourseRatingFragment &
    CourseReviewDistributionFragment;
  distributions: {
    useful: Distribution;
    easy: Distribution;
  };
  shortlisted: boolean;
};

const CourseInfoHeader = ({
  course,
  shortlisted,
  distributions,
}: CourseInfoHeaderProps) => {
  const { liked, easy, useful, filled_count, comment_count } =
    course.rating ?? ({} as NonNullable<typeof course.rating>);
  const redditSearchTerm = course.code.replace(/\s+/g, '').toLowerCase();
  const redditSearchUrl = `https://www.reddit.com/r/uwaterloo/search/?q=${encodeURIComponent(
    redditSearchTerm,
  )}`;

  return (
    <CourseInfoHeaderWrapper>
      <CourseCodeAndNameSection>
        <CourseCodeAndStar>
          <CourseCode ratingBoxWidth={RATING_BOX_WIDTH}>
            {formatCourseCode(course.code)}
          </CourseCode>
          <StarAlignmentWrapper>
            <ShortlistStar
              size={36}
              initialState={shortlisted}
              courseId={course.id}
              courseCode={course.code}
            />
          </StarAlignmentWrapper>
        </CourseCodeAndStar>
        <CourseNameWrapper>
          <CourseName ratingBoxWidth={RATING_BOX_WIDTH}>
            {course.name}
          </CourseName>
        </CourseNameWrapper>
      </CourseCodeAndNameSection>
      <CourseDescriptionSection>
        <RatingsSection>
          <RatingBox
            numRatings={filled_count}
            numComments={comment_count}
            percentages={[
              {
                displayName: 'Likes',
                percent: liked,
              },
              {
                displayName: 'Easy',
                percent: easy,
                distribution: distributions.easy,
                hasDistribution: distributions.easy.hasDistribution,
              },
              {
                displayName: 'Useful',
                percent: useful,
                distribution: distributions.useful,
                hasDistribution: distributions.useful.hasDistribution,
              },
            ]}
          />
          <RedditSearchButton
            href={redditSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Search Reddit for ${redditSearchTerm}`}
          >
            <FontAwesomeIcon icon={faRedditAlien} />
            <RedditSearchButtonText>Search Reddit</RedditSearchButtonText>
          </RedditSearchButton>
        </RatingsSection>
        <Description ratingBoxWidth={RATING_BOX_WIDTH}>
          {course.description}
        </Description>
      </CourseDescriptionSection>
    </CourseInfoHeaderWrapper>
  );
};

export default CourseInfoHeader;
