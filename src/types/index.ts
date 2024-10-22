export * from "./auth";
export * from "./student";
export * from "./major";
export * from "./curriculum";
export * from "./student_curriculum";
export * from "./enrolled_course";
export * from "./category";
export * from "./course_detail";

export type TResponse<T> = {
	success: boolean;
	message?: string;
	result?: T;
};
