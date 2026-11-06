import React from 'react';
import { useQuery } from '@apollo/client';
import {
  CourseDropdownByTermQuery,
  CourseDropdownByTermQueryVariables,
} from 'generated/graphql';

import { COURSE_DROPDOWN_TERM_QUERY } from 'graphql/queries/course/SwapCourse';

import CoursePicker from './CoursePicker';

type CourseSearchDropdownProps = {
  displayCode: string;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  termId: number;
};

const CourseSearchDropdown = ({
  displayCode,
  selectedCode,
  onSelect,
  termId,
}: CourseSearchDropdownProps) => {
  const { data } = useQuery<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >(COURSE_DROPDOWN_TERM_QUERY, { variables: { termId } });

  return (
    <CoursePicker
      align="right"
      ariaLabel="Swap into course"
      courses={data?.course ?? []}
      onSelect={onSelect}
      searchable
      selectedCode={selectedCode ?? displayCode}
    />
  );
};

export default CourseSearchDropdown;
