import React from 'react';
import { useQuery } from '@apollo/client';
import {
  CourseDropdownByTermQuery,
  CourseDropdownByTermQueryVariables,
} from 'generated/graphql';
import { useTheme } from 'styled-components';

import DropdownList from 'components/input/DropdownList';
import { COURSE_DROPDOWN_TERM_QUERY } from 'graphql/queries/course/SwapCourse';
import { formatCourseCode } from 'utils/Misc';

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
  const theme = useTheme();
  const { data } = useQuery<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >(COURSE_DROPDOWN_TERM_QUERY, { variables: { termId } });
  const courses = data?.course ?? [];
  const activeCode = selectedCode ?? displayCode;
  const selectedIndex = courses.findIndex(
    (course) => course.code === activeCode,
  );

  return (
    <DropdownList
      color={theme.courses}
      maxItems={8}
      onChange={(index) => onSelect(courses[index].code)}
      options={courses.map((course) => formatCourseCode(course.code))}
      placeholder={formatCourseCode(displayCode)}
      searchable
      selectedIndex={selectedIndex}
      width={300}
    />
  );
};

export default CourseSearchDropdown;
