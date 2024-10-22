export type StudentCurriculum = {
	id?: number;
	name: string;
	student_code: number;
	curriculum_id: number;
	is_system: boolean;
	is_default: boolean;

	courses?: StudentCurriculumCourse[];
	answers: StudentCurriculumQuestionAnswer[];
};

export type StudentCurriculumCreate = {
	name: string;
	student_code: number;
	curriculum_id: number;
	is_system: boolean;
	is_default: boolean;

	answers: StudentCurriculumQuestionAnswer[];
};

export type StudentCurriculumCourse = {
	id: number;
	semester: number;
	year: number;
	course_no: string;
	category_id: number;
};

export type StudentCurriculumQuestionAnswer = {
	id?: number;
	question_id: number;
	choice_id: number;
};
