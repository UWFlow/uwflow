package exam

type Exam struct {
  CourseCode string
  Term int
  LectureSection string
  Day  string
  Date string
  StartSeconds int
  EndSeconds int
  Location string
}

type ApiExam struct {
  // *not* a code: upper case and contains space, e.g. "CS 145"
  CourseSubjectNumber  string `json:"course"`
  Sections []ApiExamSection `json:"sections"`
}

type ApiExamSection struct {
  LectureSection string `json:"section"`
  Date string `json:"date"`
  StartTime string `json:"start_time"`
  EndTime string `json:"end_time"`
  Location string `json:"location"`
}

type ApiExamResponse struct {
  Data []ApiExam `json:"data"`
}
