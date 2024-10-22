export type EnrolledCourseCycle = {
	year: string;
	semester: string;
	courses: EnrolledCourse[];
};

export type EnrolledCourse = {
	course_no: string;
	credit: string;
	grade: string;
};
