import React from 'react';
import { useTheme } from 'styled-components';

import DropdownList from 'components/input/DropdownList';
import { formatCourseCode } from 'utils/Misc';

export type EnrolledCourse = {
  code: string;
  name: string;
};

type EnrolledCourseDropdownProps = {
  courses: EnrolledCourse[];
  selectedCode: string;
  onSelect: (code: string) => void;
};

const EnrolledCourseDropdown = ({
  courses,
  selectedCode,
  onSelect,
}: EnrolledCourseDropdownProps) => {
  const theme = useTheme();
  const selectedIndex = courses.findIndex(
    (course) => course.code === selectedCode,
  );
  return (
    <DropdownList
      color={theme.courses}
      onChange={(index) => onSelect(courses[index].code)}
      options={courses.map((course) => formatCourseCode(course.code))}
      selectedIndex={selectedIndex}
      width={240}
    />
  );
};

export default EnrolledCourseDropdown;
