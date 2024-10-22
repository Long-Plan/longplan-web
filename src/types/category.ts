export type Category = {
	id: number;
	name_th: string;
	name_en: string;
	at_least?: boolean;
	credit?: number;
	type_id?: number;
	is_display?: boolean;
	primary_color: string;
	secondary_color: string;
	note: string;
	created_at: Date;
	updated_at: Date;

	requirements: CategoryRequirement[];
	relationships: CategoryRelationship[];
	child_categories: Category[];
	courses: string[];
};

export type CategoryRequirement = {
	id: number;
	regex?: string;
	credit?: number;
};

export type CategoryRelationship = {
	id: number;
	child_category_id: number;
	require_all: boolean;
	position: number;
	question_id?: number;
	choice_id?: number;
	cross_category_id?: number;
};

export type CategoryCourse = {
	id: number;
	category_id: number;
	course_no: string;
	semester?: number;
	year?: number;
	credit: number;
};

export type CategoryCourseRequisite = {
	id: number;
	related_course_no: string;
	requisite_type: string;
};

export type CategoryType = {
	id: number;
	name_th: string;
	name_en: string;
	short_name: string;
};
