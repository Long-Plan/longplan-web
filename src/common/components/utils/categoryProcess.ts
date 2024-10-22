import {
	Category,
	CategoryType,
	StudentCurriculumQuestionAnswer,
} from "../../../types";

export type CategoryDetailOfCourse = {
	categoryID: number;
	categoryDisplayID?: number;
	categoryTypeID?: number;
};

const getFreeElectiveCategory = (category: Category): Category | null => {
	if (category.type_id === 3) {
		return category;
	}

	if (!category.child_categories) {
		return null;
	}

	for (const childCategory of category.child_categories) {
		const type = getFreeElectiveCategory(childCategory);
		if (type) {
			return type;
		}
	}
	return null;
};

const getCategoryDetailOfCourseHelper = (
	courseNo: string,
	category: Category,
	parentCategories: Category[] = []
): CategoryDetailOfCourse | null => {
	parentCategories = [...parentCategories, category];
	if (category.courses && category.courses.includes(courseNo)) {
		return {
			categoryID: category.id,
			categoryDisplayID: parentCategories
				.reverse()
				.find((category) => category.is_display)?.id,
			categoryTypeID: parentCategories.find(
				(category) => category.type_id !== null && category.is_display
			)?.type_id,
		};
	}

	if (!category.child_categories) {
		return null;
	}

	for (const childCategory of category.child_categories) {
		const type = getCategoryDetailOfCourseHelper(
			courseNo,
			childCategory as Category,
			parentCategories
		);
		if (type) {
			return type;
		}
	}

	return null;
};

export const getCategoryDetailOfCourseNotFE = (
	courseNo: string,
	categoryData: Category
): CategoryDetailOfCourse | null => {
	if (!categoryData) return null;
	const categoryDetail = getCategoryDetailOfCourseHelper(
		courseNo,
		categoryData,
		[]
	);
	if (categoryDetail) {
		return categoryDetail;
	}
	return null;
};

export const getCategoryDetailOfCourse = (
	courseNo: string,
	categoryData: Category
): CategoryDetailOfCourse | null => {
	if (!categoryData) return null;
	const categoryDetail = getCategoryDetailOfCourseHelper(
		courseNo,
		categoryData,
		[]
	);
	if (categoryDetail) {
		return categoryDetail;
	}

	const freeElectiveCategory = getFreeElectiveCategory(categoryData);

	if (freeElectiveCategory && freeElectiveCategory.is_display) {
		return {
			categoryID: freeElectiveCategory.id,
			categoryDisplayID: freeElectiveCategory.id,
			categoryTypeID: freeElectiveCategory.type_id,
		};
	}

	return null;
};

const getDetailOfCategoryHelper = (
	categoryId: number,
	category: Category
): Category | null => {
	if (category.id === categoryId) {
		return category;
	}

	if (category.child_categories) {
		for (const childCategory of category.child_categories) {
			const category = getDetailOfCategoryHelper(categoryId, childCategory);
			if (category) {
				return category;
			}
		}
	}
	return null;
};

export const getDetailOfCategory = (
	categoryId: number,
	categoryData: Category
): Category | null => {
	return getDetailOfCategoryHelper(categoryId, categoryData);
};

export const getDetailOfCategoryType = (
	typeId: number,
	types: CategoryType[]
): CategoryType | null => {
	return types.find((type) => type.id === typeId) ?? null;
};

const getCategoryAnswerFilteredHelper = (
	category: Category,
	answers: StudentCurriculumQuestionAnswer[]
): Category => {
	const filteredCategory = category;
	const filteredRelationship = [];

	if (category.relationships === null) {
		return category;
	}

	for (const relationship of category.relationships) {
		if (relationship.question_id && relationship.choice_id) {
			const answer = answers.find(
				(answer) =>
					answer.question_id === relationship.question_id &&
					answer.choice_id === relationship.choice_id
			);
			if (answer) {
				filteredRelationship.push(relationship);
			}
		} else {
			filteredRelationship.push(relationship);
		}
	}
	filteredCategory.relationships = filteredRelationship;
	filteredCategory.child_categories = filteredCategory.child_categories.filter(
		(childCategory) => {
			return filteredCategory.relationships
				? filteredCategory.relationships.find(
						(relationship) =>
							relationship.child_category_id === childCategory.id
				  )
				: true;
		}
	);
	for (const childCategory of filteredCategory.child_categories) {
		getCategoryAnswerFilteredHelper(childCategory, answers);
	}

	return filteredCategory;
};

export const getCategoryAnswerFiltered = (
	category: Category,
	answers: StudentCurriculumQuestionAnswer[]
): Category => {
	return getCategoryAnswerFilteredHelper(category, answers);
};
