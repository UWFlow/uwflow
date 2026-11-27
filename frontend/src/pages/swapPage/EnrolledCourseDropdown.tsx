import React from 'react';

import CoursePicker from './CoursePicker';

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
}: EnrolledCourseDropdownProps) => (
  <CoursePicker
    ariaLabel="Swap out of course"
    courses={courses}
    onSelect={onSelect}
    selectedCode={selectedCode}
  />
);

export default EnrolledCourseDropdown;
