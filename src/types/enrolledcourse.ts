export type EnrolledCourse = {
  CourseNo: string;
  Credit: string;
  Grade: string;
};

export type MappingEnrolledCourse = {
  Year: string;
  Semester: string;
  Courses: EnrolledCourse[];
};
