import React from 'react';
import { Moment } from 'moment';

import { splitCourseCode } from 'utils/Misc';

import { LastUpdatedLink, LastUpdatedText } from './styles/LastUpdatedSchedule';

const classesLink = 'https://classes.uwaterloo.ca/infocour/CIR/SA/index.html';

type LastUpdatedScheduleProps = {
  margin?: string;
  fontSize?: string;
  courseCode?: string;
  term?: number;
  updatedAt?: Moment;
};

const LastUpdatedSchedule = ({
  courseCode,
  term,
  updatedAt,
  margin = '8px 0 0 0',
  fontSize,
}: LastUpdatedScheduleProps) => {
  const buildLink = (): string => {
    if (courseCode && term) {
      const [courseLetters, courseNum] = splitCourseCode(courseCode);
      const courseLevel =
        courseCode &&
        (['1', '2', '3', '4', '5'].includes(courseNum[0]) ||
          courseNum.length < 3)
          ? 'under'
          : 'grad';
      return `https://classes.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=${courseLevel}&sess=${term}&subject=${courseLetters}&cournum=${courseNum.toUpperCase()}`;
    }
    return classesLink;
  };

  return (
    <LastUpdatedText margin={margin} fontSize={fontSize}>
      Last updated {updatedAt?.fromNow()} from{' '}
      <LastUpdatedLink href={buildLink()} target="_blank">
        classes.uwaterloo.ca
      </LastUpdatedLink>
    </LastUpdatedText>
  );
};

export default LastUpdatedSchedule;
