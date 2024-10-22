export interface Course {
  course_no: string;
  semester: number;
  years: number;
  detail: CourseDetails;
  group?: string;
}

export interface CourseDetails {
  course_no: string;
  title_long_th: string;
  title_long_en: string;
  course_desc_th: string;
  course_desc_en: string;
  credit: number;
  prerequisite: string;
}
